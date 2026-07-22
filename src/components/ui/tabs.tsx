import * as React from "react";
import { TabView, TabPanel, type TabViewProps, type TabPanelPassThroughOptions } from "primereact/tabview";

import { cn } from "@/lib/utils";

export interface TabsProps extends Omit<TabViewProps, "activeIndex" | "onTabChange"> {
  /** Índice de la pestaña activa (controlado). */
  value?: number;
  onValueChange?: (index: number) => void;
}

/**
 * PT por pestaña individual. IMPORTANTE: a diferencia del resto de la
 * librería, TabView NO expone `header`/`headerAction` en el tema global
 * (`primereact-theme.ts`) — su prop `headerClassName` solo se aplica en modo
 * "styled" (no en `unstyled`, que es el que usamos siempre), así que la
 * única forma real de estilar la pestaña clickeable es pasando `pt`
 * directamente a cada `TabPanel`. Ver discusión en el PR que corrigió esto.
 */
const tabHeaderPt: TabPanelPassThroughOptions = {
  header: { className: "list-none" },
  headerAction: {
    className: cn(
      "flex items-center gap-2 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground",
      "transition-colors duration-150 hover:text-foreground",
      "aria-selected:border-primary aria-selected:text-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    ),
  },
};

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
        React.isValidElement<{ pt?: TabPanelPassThroughOptions }>(child)
          ? React.cloneElement(child, {
              pt: { ...tabHeaderPt, ...child.props.pt },
            })
          : child,
      )}
    </TabView>
  ),
);
Tabs.displayName = "Tabs";

export { Tabs, TabPanel };
