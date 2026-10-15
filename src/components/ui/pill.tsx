import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const pillVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-all select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-[#D4F835] text-black hover:bg-[#c6ea27] shadow-sm shadow-[#D4F835]/20 active:scale-95 cursor-pointer",
        secondary:
          "bg-secondary text-foreground hover:bg-secondary/80 border border-border cursor-pointer active:scale-95",
        active:
          "bg-[#D4F835]/20 text-[#0E0E10] dark:text-[#D4F835] border border-[#D4F835]/40 font-extrabold",
        dark:
          "bg-[#0E0E10] text-white hover:bg-zinc-800 border border-zinc-800 shadow-xs cursor-pointer active:scale-95",
        outline:
          "border border-border text-foreground hover:bg-secondary/50 cursor-pointer",
        success:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
        warning:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25",
        danger:
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px] leading-tight",
        default: "px-3.5 py-1.5 text-xs leading-normal",
        lg: "px-5 py-2.5 text-sm leading-normal",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  asButton?: boolean;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

export function Pill({
  className,
  variant,
  size,
  asButton = false,
  children,
  onClick,
  ...props
}: PillProps) {
  return (
    <span
      role={asButton || onClick ? "button" : undefined}
      tabIndex={asButton || onClick ? 0 : undefined}
      onClick={onClick}
      className={cn(pillVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </span>
  );
}
