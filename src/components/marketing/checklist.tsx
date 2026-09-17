import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ChecklistItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface ChecklistProps extends React.HTMLAttributes<HTMLUListElement> {
  items: (ChecklistItem | string)[];
  /** @default 1 */
  columns?: 1 | 2;
  /** Ícono en vez del check. */
  icon?: React.ReactNode;
}

/** Lista de garantías o beneficios con check (Deliver «Plantillas»). */
const Checklist = React.forwardRef<HTMLUListElement, ChecklistProps>(
  ({ items, columns = 1, icon, className, ...props }, ref) => (
    <ul ref={ref} className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2", className)} {...props}>
      {items.map((raw, index) => {
        const item = typeof raw === "string" ? { title: raw } : raw;
        return (
          <li key={index} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/10 text-success [&_svg]:size-3.5"
            >
              {icon ?? <Check strokeWidth={3} />}
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{item.title}</span>
              {item.description && <span className="text-sm text-muted-foreground">{item.description}</span>}
            </div>
          </li>
        );
      })}
    </ul>
  ),
);
Checklist.displayName = "Checklist";

export { Checklist };
