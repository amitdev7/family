"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "lime" | "dark" | "default" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Pill({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: PillProps) {
  const variantStyles = {
    lime: "bg-[#E2F937] text-slate-950 font-extrabold shadow-sm",
    dark: "bg-[#16171B] text-white font-bold border border-white/10",
    default: "bg-white dark:bg-[#16171B] text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10",
    outline: "border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3.5 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full transition-all",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

