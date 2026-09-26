import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "positive" | "negative" | "warning" | "brand";

const tones: Record<Tone, string> = {
  neutral: "bg-[#EDF3F8] text-[#40516A]",
  positive: "bg-[#E8F5EC] text-[#11642F]",
  negative: "bg-[#FDECEB] text-[#A20A08]",
  warning: "bg-[#FFF5D6] text-[#795600]",
  brand: "bg-[#EAF1FB] text-[#00307B]",
};

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLElement> & { tone?: Tone }) {
  return <strong className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props} />;
}
