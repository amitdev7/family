import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "info" | "success" | "warning" | "destructive";
  title?: string;
}

export function Alert({
  className,
  variant = "default",
  title,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    default: "bg-muted/50 border-border text-foreground",
    info: "bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200",
    destructive: "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-300",
  };

  const IconComponent = {
    default: Info,
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    destructive: AlertCircle,
  }[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-sm flex items-start gap-3",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold leading-none tracking-tight">{title}</h5>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}

