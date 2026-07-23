import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva("relative grid grid-cols-[auto_1fr] gap-x-3 rounded-lg border p-4", {
  variants: {
    variant: {
      info: "border-border bg-surface text-foreground",
      success: "border-success/30 bg-success/10 text-foreground",
      warning: "border-warning/40 bg-warning/10 text-foreground",
      destructive: "border-destructive/30 bg-destructive/10 text-foreground",
    },
  },
  defaultVariants: { variant: "info" },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, children, role = variant === "destructive" ? "alert" : "status", ...props }, ref) => (
    <div ref={ref} role={role} className={cn(alertVariants({ variant }), className)} {...props}>
      {icon ? <div aria-hidden="true" className="mt-0.5 text-current">{icon}</div> : null}
      <div className={cn(icon ? "col-start-2" : "col-span-2")}>{children}</div>
    </div>
  ),
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-heading text-sm font-semibold", className)} {...props} />
  ),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("mt-1 text-sm text-muted-foreground", className)} {...props} />
  ),
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
