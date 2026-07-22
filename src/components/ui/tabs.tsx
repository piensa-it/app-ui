import * as React from "react";
import { TabView, TabPanel, type TabViewProps } from "primereact/tabview";

import { cn } from "@/lib/utils";

export interface TabsProps extends Omit<TabViewProps, "activeIndex" | "onTabChange"> {
  /** Índice de la pestaña activa (controlado). */
  value?: number;
  onValueChange?: (index: number) => void;
}

const defaultHeaderClassName = cn(
  "flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground",
  "transition-colors hover:text-foreground",
  "aria-selected:border-primary aria-selected:text-foreground",
);

/** Navegación por pestañas sobre PrimeReact TabView. Los hijos deben ser `TabPanel`. */
const Tabs = React.forwardRef<TabView, TabsProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => (
    <TabView
      ref={ref}
      className={cn(className)}
      activeIndex={value}
      onTabChange={(e) => onValueChange?.(e.index)}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, {
              headerClassName: cn(defaultHeaderClassName, child.props.headerClassName),
            } as { headerClassName: string })
          : child,
      )}
    </TabView>
  ),
);
Tabs.displayName = "Tabs";

export { Tabs, TabPanel };
