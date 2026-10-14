import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === "function") {
      const Component = Icon as React.ComponentType<{ className?: string }>;
      return <Component className="h-8 w-8 text-muted-foreground" />;
    }
    return Icon;
  };

  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      {Icon && (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 border border-border/60">
          {renderIcon()}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
