import * as React from "react";
import { Select as ArkSelect, createListCollection } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<ArkSelect.RootProps<SelectOption>, "collection" | "value" | "onValueChange" | "items" | "onChange"> {
  options: SelectOption[];
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  placeholder?: string;
  className?: string;
}

/** Select accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, value, onChange, placeholder = "Selecciona una opción", ...props }, ref) => {
    const collection = React.useMemo(
      () =>
        createListCollection({
          items: options,
          itemToValue: (item) => String(item.value),
          itemToString: (item) => item.label,
          isItemDisabled: (item) => !!item.disabled,
        }),
      [options],
    );

    return (
      <ArkSelect.Root
        ref={ref}
        collection={collection}
        value={value === null || value === undefined ? [] : [String(value)]}
        onValueChange={(details) => {
          const raw = details.items[0]?.value;
          onChange?.(raw === undefined ? null : raw);
        }}
        className={cn("w-full", className)}
        {...props}
      >
        <ArkSelect.Control>
          <ArkSelect.Trigger
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
              "transition-colors duration-150 hover:bg-accent/50",
              "data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            )}
          >
            <ArkSelect.ValueText
              placeholder={placeholder}
              className="truncate text-left data-[placeholder-shown]:text-muted-foreground"
            />
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </ArkSelect.Trigger>
        </ArkSelect.Control>
        <Portal>
          <ArkSelect.Positioner>
            <ArkSelect.Content
              className={cn(
                "z-50 max-h-64 min-w-[var(--reference-width)] overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none",
                elevationRing,
                popoverAnimation,
              )}
            >
              {options.map((option) => (
                <ArkSelect.Item
                  key={option.value}
                  item={option}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <ArkSelect.ItemText>{option.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              ))}
            </ArkSelect.Content>
          </ArkSelect.Positioner>
        </Portal>
        <ArkSelect.HiddenSelect />
      </ArkSelect.Root>
    );
  },
);
Select.displayName = "Select";

export { Select };
