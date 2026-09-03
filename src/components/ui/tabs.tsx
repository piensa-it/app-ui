import * as React from "react";
import { Tabs as ArkTabs } from "@ark-ui/react/tabs";

import { cn } from "@/lib/utils";

export interface TabPanelProps {
  /** Etiqueta de la pestaña. */
  header: React.ReactNode;
  /** Identificador estable de la pestaña. Si se omite, se usa el índice como string. */
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Marcador de contenido — no se renderiza directamente. `Tabs` recorre sus
 * hijos `TabPanel` para construir el `Tabs.List` (triggers) y los
 * `Tabs.Content` correspondientes sobre Ark UI.
 */
function TabPanel(_props: TabPanelProps): null {
  return null;
}

export interface TabsProps extends Omit<ArkTabs.RootProps, "value" | "defaultValue" | "onValueChange" | "children"> {
  /** Valor de la pestaña activa (controlado). Si no se pasa, es no controlado. */
  value?: string;
  /**
   * Pestaña inicial en modo no controlado. Si se omite (o llega `undefined`),
   * se abre la primera. Se ignora cuando `value` está presente.
   */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

/** Navegación por pestañas sobre Ark UI (headless). Los hijos deben ser `TabPanel`. */
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, defaultValue, onValueChange, children, ...props }, ref) => {
    const panels = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<TabPanelProps> => React.isValidElement(child) && child.type === TabPanel,
    );
    const withValues = panels.map((panel, index) => ({
      value: panel.props.value ?? String(index),
      header: panel.props.header,
      disabled: panel.props.disabled,
      children: panel.props.children,
    }));
    // Un `defaultValue` explícitamente `undefined` dejaría la vista sin
    // pestaña activa; se cae en la primera.
    const initialValue = defaultValue ?? withValues[0]?.value;

    return (
      <ArkTabs.Root
        ref={ref}
        {...props}
        className={cn(className)}
        value={value}
        defaultValue={value === undefined ? initialValue : undefined}
        onValueChange={(details) => onValueChange?.(details.value)}
      >
        <ArkTabs.List className="relative flex items-center overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {withValues.map((panel) => (
            <ArkTabs.Trigger
              key={panel.value}
              value={panel.value}
              disabled={panel.disabled}
              className={cn(
                "flex min-h-control-comfortable shrink-0 items-center gap-2 whitespace-nowrap rounded-t-md px-4 text-sm font-medium text-muted-foreground",
                "transition-colors duration-normal hover:bg-surface-hover hover:text-foreground",
                "data-[selected]:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              {panel.header}
            </ArkTabs.Trigger>
          ))}
          <ArkTabs.Indicator className="bottom-0 h-0.5 rounded-full bg-primary transition-all duration-normal ease-standard motion-reduce:transition-none" />
        </ArkTabs.List>
        {withValues.map((panel) => (
          <ArkTabs.Content key={panel.value} value={panel.value} className="pt-5 outline-none">
            {panel.children}
          </ArkTabs.Content>
        ))}
      </ArkTabs.Root>
    );
  },
);
Tabs.displayName = "Tabs";

export { Tabs, TabPanel };
