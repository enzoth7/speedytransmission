import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00307B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#00307B] text-white hover:bg-[#00265f]",
        secondary: "border border-[#DCE4EE] bg-white text-[#243247] hover:bg-[#F2F6FA]",
        ghost: "text-[#4C5B70] hover:bg-[#EDF3F8] hover:text-[#0F172A]",
        danger: "bg-[#C90301] text-white hover:bg-[#a90200]",
      },
      size: {
        default: "h-11",
        icon: "h-11 w-11 px-0",
        sm: "h-9 min-h-9 px-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
