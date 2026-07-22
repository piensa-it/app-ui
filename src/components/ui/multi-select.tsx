import * as React from "react";
import { Select as ArkSelect, createListCollection } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import type { SelectOption } from "@/components/ui/select";

export interface MultiSelectFieldProps
  extends Omit<
    ArkSelect.RootProps<SelectOption>,
    "collection" | "value" | "onValueChange" | "items" | "multiple" | "onChange"
  > {
  options: SelectOption[];
  value?: Array<string | number>;
  onChange?: (value: Array<string | number>) => void;
  placeholder?: string;
  className?: string;
}

/** Selector múltiple sobre Ark UI (headless), con chips removibles y el tema Tailwind de la librería. */
const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  ({ className, options, value = [], onChange, placeholder = "Selecciona opciones", ...props }, ref) => {
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
    const selected = React.useMemo(() => value.map(String), [value]);
    const labelByValue = React.useMemo(
      () => new Map(options.map((option) => [String(option.value), option.label])),
      [options],
    );

    const removeValue = (raw: string) => {
      const next = value.filter((item) => String(item) !== raw);
      onChange?.(next);
    };

    return (
      <ArkSelect.Root
        ref={ref}
        collection={collection}
        multiple
        value={selected}
        onValueChange={(details) => {
          const next = details.items.map((item) => item.value);
          onChange?.(next);
        }}
        className={cn("w-full", className)}
        {...props}
      >
        <ArkSelect.Control>
          <ArkSelect.Trigger
            className={cn(
              "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-sm shadow-sm",
              "transition-colors duration-150 hover:bg-accent/50",
              "data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            )}
          >
            {selected.length === 0 ? (
              <span className="px-1 text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((raw) => (
                <span
                  key={raw}
                  className="flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {labelByValue.get(raw) ?? raw}
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeValue(raw);
                    }}
                    className="rounded-sm opacity-70 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
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
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
