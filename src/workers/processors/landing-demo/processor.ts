import type { Job } from "bullmq";

import { createLogger } from "@/lib/logger";
import { db } from "@/server/db";
import { redis } from "@/server/redis";
import type { LandingDemoJobData } from "../../queues/landing-demo.queue";

const logger = createLogger("landing-demo");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processLandingDemoJob(
  job: Job<LandingDemoJobData>,
): Promise<void> {
  await processLandingDemoTask(job.data);
}

export async function processLandingDemoTask(
  data: LandingDemoJobData,
): Promise<void> {
  const { runId, taskIndex, redisKey } = data;
  const startedAt = Date.now();

  try {
    const item = await db.landingDemoItem.findUnique({
      where: { runId_taskIndex: { runId, taskIndex } },
      select: { status: true },
    });

    if (!item) {
      throw new Error(`Landing demo item not found: ${runId}/${taskIndex}`);
    }

    if (item.status === "SUCCEEDED") {
      return;
    }

    await db.landingDemoItem.update({
      where: { runId_taskIndex: { runId, taskIndex } },
      data: {
        status: "RUNNING",
        error: null,
        startedAt: new Date(),
      },
    });

    await sleep(250 + Math.floor(Math.random() * 750));

    const durationMs = Date.now() - startedAt;
    const updatedItem = await db.landingDemoItem.updateMany({
      where: {
        runId,
        taskIndex,
        status: { not: "SUCCEEDED" },
      },
      data: {
        status: "SUCCEEDED",
        durationMs,
        finishedAt: new Date(),
      },
    });
    if (updatedItem.count === 0) {
      return;
    }

    const redisValue = await redis.hincrby(redisKey, "completed", 1);
    await db.landingDemoItem.update({
      where: { runId_taskIndex: { runId, taskIndex } },
      data: { redisValue },
    });

    const run = await db.landingDemoRun.update({
      where: { id: runId },
      data: { completedTasks: { increment: 1 } },
      select: { completedTasks: true, totalTasks: true },
    });

    const nextRedisState = {
      lastCompletedTask: String(taskIndex),
      updatedAt: new Date().toISOString(),
    };

    if (run.completedTasks >= run.totalTasks) {
      await Promise.all([
        db.landingDemoRun.update({
          where: { id: runId },
          data: {
            status: "SUCCEEDED",
            finishedAt: new Date(),
          },
        }),
        redis.hset(redisKey, {
          ...nextRedisState,
          status: "SUCCEEDED",
          completed: String(run.completedTasks),
          finishedAt: new Date().toISOString(),
        }),
      ]);
      return;
    }

    await redis.hset(redisKey, {
      ...nextRedisState,
      completed: String(run.completedTasks),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error({ error: message, runId, taskIndex }, "Landing demo job failed");

    await Promise.all([
      db.landingDemoItem.updateMany({
        where: { runId, taskIndex },
        data: {
          status: "FAILED",
          error: message,
          durationMs: Date.now() - startedAt,
          finishedAt: new Date(),
        },
      }),
      db.landingDemoRun.updateMany({
        where: { id: runId },
        data: { status: "FAILED" },
      }),
      redis.hset(redisKey, {
        status: "FAILED",
        error: message,
        updatedAt: new Date().toISOString(),
      }),
    ]);

    throw error;
  }
}
