import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (str: string) => {
    if (!str) return "H";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-16 h-16 text-xl",
  }[size];

  const getBackgroundColor = (str: string) => {
    const colors = [
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center font-semibold rounded-full overflow-hidden shrink-0 border border-border/50 select-none",
        sizeClasses,
        !src || imageError ? getBackgroundColor(name) : "",
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

