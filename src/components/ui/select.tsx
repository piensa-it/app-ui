import * as React from "react";
import { Select as ArkSelect, createListCollection } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { fieldControlVariants, floatingPanelStyles, optionStyles } from "@/lib/recipes/field-control";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<ArkSelect.RootProps<SelectOption>, "collection" | "value" | "onValueChange" | "items" | "onChange">,
    VariantProps<typeof fieldControlVariants> {
  options: SelectOption[];
  value?: string | number | null;
  onChange?: (value: string | number | null) => void;
  placeholder?: string;
  /** Nombre accesible cuando el trigger no tiene un Label asociado. */
  "aria-label"?: string;
  className?: string;
}

/** Select accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className,
      options,
      value,
      onChange,
      placeholder = "Selecciona una opción",
      "aria-label": ariaLabel,
      id,
      variant,
      size,
      ...props
    },
    ref,
  ) => {
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
        id={id ? `${id}-root` : undefined}
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
            id={id}
            aria-label={ariaLabel}
            className={cn(
              fieldControlVariants({ variant, size }),
              "flex items-center justify-between gap-3",
            )}
          >
            <ArkSelect.ValueText
              placeholder={placeholder}
              className="truncate text-left data-[placeholder-shown]:text-muted-foreground"
            />
            <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </ArkSelect.Trigger>
        </ArkSelect.Control>
        <Portal>
          <ArkSelect.Positioner>
            <ArkSelect.Content
              className={cn(
                floatingPanelStyles,
                "max-h-72 min-w-[var(--reference-width)] p-1.5",
                elevationRing,
                popoverAnimation,
              )}
            >
              {options.map((option) => (
                <ArkSelect.Item
                  key={option.value}
                  item={option}
                  className={optionStyles}
                >
                  <ArkSelect.ItemText>{option.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator>
                    <Check aria-hidden="true" className="size-4" />
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
