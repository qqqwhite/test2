import { Queue } from "bullmq";

import { createLogger } from "@/lib/logger";
import { redis } from "@/server/redis";

export const LANDING_DEMO_QUEUE_NAME = "landing-demo";

export interface LandingDemoJobData {
  runId: string;
  taskIndex: number;
  redisKey: string;
}

export const landingDemoQueue = new Queue<LandingDemoJobData>(
  LANDING_DEMO_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 500,
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: 100,
      },
      removeOnFail: {
        age: 7 * 24 * 3600,
      },
    },
  },
);

const logger = createLogger("queue:landing-demo");

landingDemoQueue.on("error", (err) => {
  logger.error({ err }, "Landing demo queue error");
});
