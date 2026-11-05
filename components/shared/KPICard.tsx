"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: "default" | "success" | "warning" | "destructive" | "primary";
  className?: string;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: KPICardProps) {
  const iconColorMap = {
    default: "text-muted-foreground bg-muted/60",
    primary: "text-primary bg-primary/10",
    success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    warning: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    destructive: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
            {value}
          </div>
        </div>
        <div className={cn("p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105", iconColorMap[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-muted-foreground font-medium">{subtitle}</span>
          )}
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md",
                trend.isPositive
                  ? "text-emerald-700 bg-emerald-100/60 dark:text-emerald-300 dark:bg-emerald-900/30"
                  : "text-rose-700 bg-rose-100/60 dark:text-rose-300 dark:bg-rose-900/30"
              )}
            >
              {trend.value} {trend.label && <span className="ml-1 font-normal opacity-80">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

