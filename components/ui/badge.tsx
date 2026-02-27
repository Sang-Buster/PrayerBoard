import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
          {
            "bg-primary text-primary-foreground": variant === "default",
            "bg-secondary text-secondary-foreground": variant === "secondary",
            "border border-border text-muted-foreground": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
