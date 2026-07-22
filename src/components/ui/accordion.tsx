import * as React from "react";
import { Accordion as ArkAccordion } from "@ark-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionTabProps {
  /** Etiqueta del panel. */
  header: React.ReactNode;
  /** Identificador estable del panel. Si se omite, se usa el índice como string. */
  value?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Marcador de contenido — no se renderiza directamente. `Accordion` recorre
 * sus hijos `AccordionTab` para construir los `Accordion.Item` sobre Ark UI.
 */
function AccordionTab(_props: AccordionTabProps): null {
  return null;
}

export interface AccordionProps extends Omit<ArkAccordion.RootProps, "value" | "onValueChange" | "children"> {
  /** Valores expandidos (controlado). Si se omite, es no controlado. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Permite tener varios paneles abiertos a la vez. @default false */
  multiple?: boolean;
  /** Permite cerrar el panel activo volviendo a hacer click. @default true */
  collapsible?: boolean;
  children?: React.ReactNode;
}

/** Contenido colapsable sobre Ark UI (headless). Los hijos deben ser `AccordionTab`. */
const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, value, onValueChange, multiple = false, collapsible = true, children, ...props }, ref) => {
    const tabs = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<AccordionTabProps> =>
        React.isValidElement(child) && child.type === AccordionTab,
    );

    return (
      <ArkAccordion.Root
        ref={ref}
        className={cn("divide-y divide-border rounded-md border border-border", className)}
        value={value}
        multiple={multiple}
        collapsible={collapsible}
        onValueChange={(details) => onValueChange?.(details.value)}
        {...props}
      >
        {tabs.map((tab, index) => {
          const itemValue = tab.props.value ?? String(index);
          return (
            <ArkAccordion.Item key={itemValue} value={itemValue} disabled={tab.props.disabled}>
              <ArkAccordion.ItemTrigger
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium",
                  "transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {tab.props.header}
                <ArkAccordion.ItemIndicator className="transition-transform duration-200 data-[state=open]:rotate-180">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </ArkAccordion.ItemIndicator>
              </ArkAccordion.ItemTrigger>
              <ArkAccordion.ItemContent className="px-4 pb-4 text-sm text-muted-foreground">
                {tab.props.children}
              </ArkAccordion.ItemContent>
            </ArkAccordion.Item>
          );
        })}
      </ArkAccordion.Root>
    );
  },
);
Accordion.displayName = "Accordion";

export { Accordion, AccordionTab };
