import * as React from "react";
import { Combobox as ArkCombobox, createListCollection } from "@ark-ui/react/combobox";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";

export interface AutoCompleteProps {
  /** Texto actual del input (controlado). */
  value: string;
  /** Se dispara al escribir y al seleccionar una sugerencia. */
  onChange: (value: string) => void;
  /** Sugerencias a mostrar, ya filtradas por quien consume el componente. */
  suggestions: string[];
  /** Se dispara en cada cambio de texto — quien lo use recalcula `suggestions` (ej. contra una API). */
  onQueryChange: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Campo de texto con sugerencias sobre Ark UI Combobox (headless). Recibe
 * `suggestions` (el resultado ya filtrado) y `onQueryChange` (callback que
 * calcula esas sugerencias, típicamente contra una API) — mismo contrato que
 * la versión anterior sobre PrimeReact (`suggestions`/`completeMethod`).
 */
const AutoComplete = React.forwardRef<HTMLDivElement, AutoCompleteProps>(
  ({ className, value, onChange, suggestions, onQueryChange, placeholder = "Buscar...", disabled, ...props }, ref) => {
    const items = React.useMemo(() => suggestions.map((s) => ({ label: s, value: s })), [suggestions]);
    const collection = React.useMemo(
      () =>
        createListCollection({
          items,
          itemToValue: (item) => item.value,
          itemToString: (item) => item.label,
        }),
      [items],
    );

    return (
      <ArkCombobox.Root
        ref={ref}
        collection={collection}
        inputValue={value}
        disabled={disabled}
        onInputValueChange={(details) => {
          onChange(details.inputValue);
          onQueryChange(details.inputValue);
        }}
        onValueChange={(details) => {
          const next = details.items[0]?.value;
          if (next !== undefined) onChange(next);
        }}
        className={cn("w-full", className)}
        {...props}
      >
        <ArkCombobox.Control
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
            "transition-colors duration-150 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          )}
        >
          <ArkCombobox.Input
            placeholder={placeholder}
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <ArkCombobox.Trigger className="shrink-0 text-muted-foreground">
            <ChevronsUpDown className="h-4 w-4" />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        <Portal>
          <ArkCombobox.Positioner>
            <ArkCombobox.Content
              className={cn(
                "z-50 max-h-64 min-w-[var(--reference-width)] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none",
                elevationRing,
                popoverAnimation,
              )}
            >
              <ArkCombobox.Empty className="px-2 py-1.5 text-sm text-muted-foreground">
                Sin resultados
              </ArkCombobox.Empty>
              {items.map((item) => (
                <ArkCombobox.Item
                  key={item.value}
                  item={item}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                  )}
                >
                  <ArkCombobox.ItemText>{item.label}</ArkCombobox.ItemText>
                  <ArkCombobox.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              ))}
            </ArkCombobox.Content>
          </ArkCombobox.Positioner>
        </Portal>
      </ArkCombobox.Root>
    );
  },
);
AutoComplete.displayName = "AutoComplete";

export { AutoComplete };
