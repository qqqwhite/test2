"use client";

import { useEffect, useState } from "react";
import { Loader2, Play, Server } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type DemoItem = {
  id: string;
  taskIndex: number;
  status: "RUNNING" | "SUCCEEDED" | "FAILED";
  redisValue: number | null;
  durationMs: number | null;
};

type DemoRunResponse = {
  run: {
    id: string;
    status: "RUNNING" | "SUCCEEDED" | "FAILED";
    concurrency: number;
    totalTasks: number;
    completedTasks: number;
    items: DemoItem[];
  };
  redis: Record<string, string>;
};

export function DemoRunner() {
  const t = useTranslations("landing.demoRunner");
  const [isStarting, setIsStarting] = useState(false);
  const [result, setResult] = useState<DemoRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isRunActive = result?.run.status === "RUNNING";

  useEffect(() => {
    if (!isRunActive || !result?.run.id) {
      return;
    }

    const pollRun = async () => {
      try {
        const response = await fetch(`/api/landing-demo/run/${result.run.id}`);

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = (await response.json()) as DemoRunResponse;
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("unknownError"));
      }
    };

    const interval = window.setInterval(() => {
      void pollRun();
    }, 800);

    return () => window.clearInterval(interval);
  }, [isRunActive, result?.run.id, t]);

  const handleRun = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch("/api/landing-demo/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = (await response.json()) as DemoRunResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"));
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className="relative z-10 w-full px-6 pb-24">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Server className="h-3.5 w-3.5" />
              {t("eyebrow")}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {t("title")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {t("description")}
              </p>
            </div>
          </div>

          <Button
            size="lg"
            className="rounded-full px-8"
            disabled={isStarting || isRunActive}
            onClick={handleRun}
          >
            {isStarting || isRunActive ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isStarting || isRunActive ? t("running") : t("button")}
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {t("errorPrefix")} {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-8 grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Metric label={t("metrics.runId")} value={result.run.id.slice(0, 8)} />
              <Metric label={t("metrics.concurrency")} value={String(result.run.concurrency)} />
              <Metric
                label={t("metrics.completed")}
                value={`${result.run.completedTasks}/${result.run.totalTasks}`}
              />
              <Metric label={t("metrics.redis")} value={result.redis.status ?? result.run.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {result.run.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-background/80 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      #{item.taskIndex}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.redisValue ?? "-"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {item.status} · {item.durationMs ?? 0}ms
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
