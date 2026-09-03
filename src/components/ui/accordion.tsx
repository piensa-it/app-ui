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
        className={cn("space-y-2", className)}
        value={value}
        multiple={multiple}
        collapsible={collapsible}
        onValueChange={(details) => onValueChange?.(details.value)}
        {...props}
      >
        {tabs.map((tab, index) => {
          const itemValue = tab.props.value ?? String(index);
          return (
            <ArkAccordion.Item
              key={itemValue}
              value={itemValue}
              disabled={tab.props.disabled}
              className={cn(
                "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
                "transition-[border-color,box-shadow] duration-normal ease-standard",
                "hover:border-surface-border",
                "data-[state=open]:border-ring/30 data-[state=open]:shadow-sm",
              )}
            >
              <ArkAccordion.ItemTrigger
                className={cn(
                  "group flex min-h-control-comfortable w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold",
                  "transition-colors duration-normal ease-standard hover:bg-surface-hover",
                  "data-[state=open]:bg-subtle/70 data-[state=open]:text-subtle-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-inset",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <span className="min-w-0">{tab.props.header}</span>
                <ArkAccordion.ItemIndicator
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-md border border-border bg-raised text-muted-foreground shadow-sm",
                    "transition-[transform,background-color,color,border-color] duration-normal ease-standard",
                    "group-hover:border-surface-border group-hover:text-foreground",
                    "data-[state=open]:rotate-180 data-[state=open]:border-ring/30 data-[state=open]:bg-primary data-[state=open]:text-primary-foreground",
                  )}
                >
                  <ChevronDown className="size-4" />
                </ArkAccordion.ItemIndicator>
              </ArkAccordion.ItemTrigger>
              <ArkAccordion.ItemContent
                className={cn(
                  "border-t border-border/70 px-4 py-4 text-sm leading-6 text-muted-foreground",
                  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1",
                  "data-[state=open]:duration-normal motion-reduce:animate-none",
                )}
              >
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
