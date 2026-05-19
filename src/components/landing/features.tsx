"use client";

import { Sparkles, Zap, Lock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const features = [
  {
    icon: Sparkles,
    key: "preview",
    color: "text-blue-500",
  },
  {
    icon: Zap,
    key: "workflow",
    color: "text-purple-500",
  },
  {
    icon: Lock,
    key: "reliability",
    color: "text-emerald-500",
  },
  {
    icon: CreditCard,
    key: "launch",
    color: "text-orange-500",
  },
];

export function Features() {
  const t = useTranslations("landing.features");

  return (
    <section className="w-full px-6 py-32 relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px] dark:bg-blue-500/5" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px] dark:bg-purple-500/5" />

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-medium text-blue-500 tracking-widest uppercase mb-6">
              {t("eyebrow")}
            </h2>
            <h3 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.1]">
              {t("titleLine1")} <br/>
              <span className="text-muted-foreground">{t("titleLine2")}</span>
            </h3>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-sm leading-relaxed font-light">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group flex flex-col items-start"
            >
              <div className="w-full h-[1px] bg-border/50 mb-8 relative overflow-hidden">
                <div className={cn(
                  "absolute inset-0 w-full h-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out bg-foreground",
                )} />
              </div>

              <div className={cn(
                "mb-6 p-3 -ml-3 rounded-full bg-transparent group-hover:bg-accent/50 transition-colors duration-300",
                feature.color
              )}>
                <feature.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <h4 className="text-xl font-medium mb-3 text-foreground tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                {t(`items.${feature.key}.title`)}
              </h4>
              
              <p className="text-muted-foreground leading-relaxed font-light text-base">
                {t(`items.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
