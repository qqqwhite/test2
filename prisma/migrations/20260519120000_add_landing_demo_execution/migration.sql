-- CreateEnum
CREATE TYPE "LandingDemoRunStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "LandingDemoItemStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "landing_demo_runs" (
    "id" TEXT NOT NULL,
    "status" "LandingDemoRunStatus" NOT NULL DEFAULT 'RUNNING',
    "concurrency" INTEGER NOT NULL DEFAULT 10,
    "total_tasks" INTEGER NOT NULL,
    "completed_tasks" INTEGER NOT NULL DEFAULT 0,
    "redis_key" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_demo_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_demo_items" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "task_index" INTEGER NOT NULL,
    "status" "LandingDemoItemStatus" NOT NULL DEFAULT 'RUNNING',
    "redis_value" INTEGER,
    "duration_ms" INTEGER,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "landing_demo_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "landing_demo_runs_created_at_idx" ON "landing_demo_runs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "landing_demo_items_run_id_task_index_key" ON "landing_demo_items"("run_id", "task_index");

-- CreateIndex
CREATE INDEX "landing_demo_items_run_id_status_idx" ON "landing_demo_items"("run_id", "status");

-- AddForeignKey
ALTER TABLE "landing_demo_items" ADD CONSTRAINT "landing_demo_items_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "landing_demo_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
