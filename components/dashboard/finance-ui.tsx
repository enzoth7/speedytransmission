"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "green" | "red" | "yellow" | "dark";

const accentStyles: Record<Accent, { icon: string; value: string; surface: string }> = {
  blue: {
    icon: "bg-[#DDF6F7] text-[#078D98]",
    value: "text-[#10213A]",
    surface: "bg-white",
  },
  green: {
    icon: "bg-[#E5F6EC] text-[#15803D]",
    value: "text-[#10213A]",
    surface: "bg-white",
  },
  red: {
    icon: "bg-[#FDECEC] text-[#C90301]",
    value: "text-[#10213A]",
    surface: "bg-white",
  },
  yellow: {
    icon: "bg-[#FFF2C8] text-[#765600]",
    value: "text-[#10213A]",
    surface: "bg-white",
  },
  dark: {
    icon: "bg-white/10 text-white",
    value: "text-white",
    surface: "border-[#172E4C] bg-[#081A31] text-white",
  },
};

export function TrendValue({ value, inverse = false, dark = false }: { value: number; inverse?: boolean; dark?: boolean }) {
  const favorable = inverse ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs font-bold", favorable ? (dark ? "text-[#70D394]" : "text-[#15803D]") : "text-[#D43A36]") }>
      <Icon className="size-3.5" aria-hidden="true" />
      {Math.abs(value).toFixed(1)}%
      <small className={cn("font-medium", dark ? "text-[#AFBED0]" : "text-[#738096]")}>vs. previous period</small>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  trend,
  inverse,
  accent = "blue",
  className,
  onClick,
  actionLabel,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  trend?: number;
  inverse?: boolean;
  accent?: Accent;
  className?: string;
  onClick?: () => void;
  actionLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const styles = accentStyles[accent];
  const dark = accent === "dark";

  const content = (
    <div className="flex h-full min-h-[132px] flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-xs font-semibold text-[#66748A]", dark && "text-[#B7C4D4]")}>{label}</div>
          <output className={cn("mt-2 block truncate text-[1.6rem] font-bold leading-none tracking-[-0.035em] 2xl:text-[1.8rem]", styles.value)}>{value}</output>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200", styles.icon)}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <div className="mt-4 flex min-h-6 items-end justify-between gap-2">
        <div className="min-w-0">
          {trend !== undefined ? <TrendValue value={trend} inverse={inverse} dark={dark} /> : <div className={cn("text-xs font-medium text-[#738096]", dark && "text-[#AFBED0]")}>{detail}</div>}
        </div>
        {onClick && <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors", dark ? "border-white/20 text-white group-hover:bg-white/10" : "border-[#D7E0EA] text-[#00307B] group-hover:border-[#00307B] group-hover:bg-[#EAF1FB]")}><ArrowUpRight className="size-3.5" aria-hidden="true" /></div>}
      </div>
    </div>
  );

  const shellClass = cn(
    "group min-w-0 overflow-hidden rounded-xl border border-[#D9E2EC] text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] duration-200 hover:border-[#BFCEDA] hover:shadow-[0_8px_20px_rgba(15,23,42,0.07)]",
    styles.surface,
    onClick && "w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00307B] focus-visible:ring-offset-2 active:scale-[0.995]",
    className,
  );

  if (onClick) return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={actionLabel ?? `Open ${label.toLowerCase()} details`}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={shellClass}
    >
      {content}
    </motion.button>
  );

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={shellClass}
    >
      {content}
    </motion.div>
  );
}

export function CompactInsight({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue",
  className,
  onClick,
  actionLabel,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: Exclude<Accent, "dark">;
  className?: string;
  onClick?: () => void;
  actionLabel?: string;
}) {
  const styles = accentStyles[tone];
  const content = (
      <div className="flex items-start gap-3 p-4">
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", styles.icon)}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#69778B]">{label}</div>
          <strong className="mt-1 block break-words text-[1.05rem] font-bold leading-6 tracking-[-0.02em] text-[#10213A]">{value}</strong>
          <div className="mt-1 text-xs leading-5 text-[#69778B]">{detail}</div>
        </div>
        {onClick && <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-[#D7E0EA] bg-white text-[#00307B] transition-colors group-hover:border-[#00307B] group-hover:bg-[#EAF1FB]"><ArrowUpRight className="size-3.5" aria-hidden="true" /></div>}
      </div>
  );
  const shellClass = cn(
    "group relative rounded-xl border border-[#DDE5EE] bg-white text-left transition-[border-color,box-shadow,transform] duration-200 hover:border-[#C6D2DF] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
    onClick && "w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00307B] focus-visible:ring-offset-2 active:scale-[0.995]",
    className,
  );
  if (onClick) return (
    <button type="button" onClick={onClick} aria-label={actionLabel ?? `Open ${label.toLowerCase()} details`} className={shellClass}>
      {content}
    </button>
  );
  return (
    <div className={shellClass}>
      {content}
    </div>
  );
}

export function BentoSurface({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-[#D9E2EC] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]", className)}>{children}</div>;
}
