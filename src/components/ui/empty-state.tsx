import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn("flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center", className)}
      {...props}
    >
      {icon ? (
        <div aria-hidden="true" className="mb-4 flex size-11 items-center justify-center rounded-full bg-subtle text-subtle-foreground">
          {icon}
        </div>
      ) : null}
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
