import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

function Avatar({ className, size = "md", ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        {
          "h-8 w-8": size === "sm",
          "h-10 w-10": size === "md",
          "h-14 w-14": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
    />
  );
}

function AvatarFallback({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
