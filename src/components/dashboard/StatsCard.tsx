import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  iconBg: "primary" | "success" | "muted" | "chart-4";
}

const iconBgClasses = {
  primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
  success: "bg-success text-success-foreground shadow-lg shadow-success/20",
  muted: "bg-muted text-muted-foreground shadow-lg shadow-muted/20",
  "chart-4": "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
};

export function StatsCard({ title, value, change, trend, icon: Icon, iconBg }: StatsCardProps) {
  return (
    <div className="animate-fade-in relative mt-6 pt-10 pb-6 px-4 border border-border/60 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1 rounded-2xl flex flex-col items-center text-center">
      {/* Overlapping Icon Container */}
      <div className={cn(
        "absolute -top-6 left-1/2 -translate-x-1/2 p-3.5 rounded-full border-4 border-white dark:border-slate-900 transition-all group-hover:scale-110 group-hover:animate-bob z-10",
        iconBgClasses[iconBg]
      )}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {title}
        </p>

        <div
          className={cn(
            "mt-3 flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm ring-1 ring-inset",
            trend === "up"
              ? "bg-success/5 text-success ring-success/20"
              : "bg-destructive/5 text-destructive ring-destructive/20"
          )}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
