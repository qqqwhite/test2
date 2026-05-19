import { NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";

import { db } from "@/server/db";
import { redis } from "@/server/redis";
import { landingDemoQueue } from "@/workers/queues/landing-demo.queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONCURRENCY = 10;
const TASK_COUNT = 10;
const REDIS_TTL_SECONDS = 60 * 60;

export async function POST() {
  // Intentionally public: this landing-page demo enqueues Redis jobs and records PostgreSQL state.
  const runId = createId();
  const redisKey = `landing-demo:${runId}`;
  const startedAt = new Date();

  await redis.hset(redisKey, {
    status: "RUNNING",
    total: String(TASK_COUNT),
    concurrency: String(CONCURRENCY),
    completed: "0",
    startedAt: startedAt.toISOString(),
  });
  await redis.expire(redisKey, REDIS_TTL_SECONDS);

  await db.landingDemoRun.create({
    data: {
      id: runId,
      status: "RUNNING",
      concurrency: CONCURRENCY,
      totalTasks: TASK_COUNT,
      redisKey,
      startedAt,
      items: {
        create: Array.from({ length: TASK_COUNT }, (_, index) => ({
          taskIndex: index + 1,
          status: "RUNNING",
        })),
      },
    },
  });

  await landingDemoQueue.addBulk(
    Array.from({ length: TASK_COUNT }, (_, index) => {
      const taskIndex = index + 1;

      return {
        name: "run-task",
        data: { runId, taskIndex, redisKey },
        opts: {
          jobId: `${runId}:${taskIndex}`,
        },
      };
    }),
  );

  const [run, redisState] = await Promise.all([
    db.landingDemoRun.findUniqueOrThrow({
      where: { id: runId },
      include: { items: { orderBy: { taskIndex: "asc" } } },
    }),
    redis.hgetall(redisKey),
  ]);

  return NextResponse.json(
    {
      run,
      redis: redisState,
    },
    { status: 202 },
  );
}

export async function GET() {
  const run = await db.landingDemoRun.findFirst({
    orderBy: { createdAt: "desc" },
    include: { items: { orderBy: { taskIndex: "asc" } } },
  });

  if (!run) {
    return NextResponse.json({ run: null, redis: {} });
  }

  const redisState = await redis.hgetall(run.redisKey);

  return NextResponse.json({
    run,
    redis: redisState,
  });
}
