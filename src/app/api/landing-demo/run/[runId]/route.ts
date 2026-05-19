import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { redis } from "@/server/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;

  const run = await db.landingDemoRun.findUnique({
    where: { id: runId },
    include: { items: { orderBy: { taskIndex: "asc" } } },
  });

  if (!run) {
    return NextResponse.json(
      {
        error: "Landing demo run not found",
      },
      { status: 404 },
    );
  }

  const redisState = await redis.hgetall(run.redisKey);

  return NextResponse.json({
    run,
    redis: redisState,
  });
}
