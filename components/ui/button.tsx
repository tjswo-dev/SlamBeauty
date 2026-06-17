import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm": variant === "default",
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50": variant === "outline",
            "hover:bg-slate-100 text-slate-700": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "bg-slate-100 text-slate-700 hover:bg-slate-200": variant === "secondary",
            "text-indigo-600 hover:underline p-0 h-auto": variant === "link",
          },
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
