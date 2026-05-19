"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Background } from "@/components/layout/background";
import { SiteFooter } from "@/components/layout/site-footer";
import { Features } from "@/components/landing/features";
import { DemoRunner } from "@/components/landing/demo-runner";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("landing");

  return (
    <div
      className={cn(
        "w-full bg-background text-foreground font-sans selection:bg-primary/30 relative",
        "min-h-screen overflow-y-auto overflow-x-hidden"
      )}
    >
      <Background />
      <Header />

      <main className="relative z-10 flex w-full flex-col items-center px-4 pb-12 pt-28 min-h-[calc(100vh-80px)] justify-center">
        <div className="relative mx-auto mb-10 w-full max-w-5xl space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <div className="mx-auto inline-flex items-center rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
            {t("hero.eyebrow")}
          </div>

          <h1 className="font-poppins text-5xl font-medium tracking-tight text-foreground drop-shadow-sm md:text-7xl">
            {t("hero.titleLine1")}{" "}
            <br className="hidden md:block" />
            <span className="animate-gradient-x bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-purple-300 dark:to-pink-300">
              {t("hero.titleLine2")}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl font-sans text-lg font-light tracking-wide text-muted-foreground md:text-xl">
            {t("hero.subtitle")}
            <br className="hidden sm:block" />
            <span className="text-foreground">
              {t("hero.subtitleAccent")}
            </span>
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/chat">{t("hero.primaryCta")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8 bg-background/70">
              <Link href="/docs">{t("hero.secondaryCta")}</Link>
            </Button>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            {["environment", "language", "theme"].map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-border bg-card/80 p-5 text-left shadow-sm backdrop-blur dark:bg-card/70"
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t(`hero.status.${key}.label`)}
                </p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {t(`hero.status.${key}.value`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <DemoRunner />

      <Features />

      <SiteFooter />
    </div>
  );
}
