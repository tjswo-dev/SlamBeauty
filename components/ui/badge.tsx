import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-indigo-100 text-indigo-700": variant === "default",
          "bg-slate-100 text-slate-700": variant === "secondary",
          "bg-emerald-100 text-emerald-700": variant === "success",
          "bg-amber-100 text-amber-700": variant === "warning",
          "bg-red-100 text-red-700": variant === "destructive",
          "border border-slate-200 text-slate-700 bg-transparent": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
