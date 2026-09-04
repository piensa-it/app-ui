import * as React from "react";
import { Combobox as ArkCombobox, createListCollection, useCombobox } from "@ark-ui/react/combobox";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { assignForwardedRef, useOverlayDismiss } from "@/lib/overlay-dismiss";
import { fieldControlVariants, floatingPanelStyles, optionStyles } from "@/lib/recipes/field-control";

export interface AutoCompleteProps extends VariantProps<typeof fieldControlVariants> {
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
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  id?: string;
  className?: string;
}

/**
 * Campo de texto con sugerencias sobre Ark UI Combobox (headless). Recibe
 * `suggestions` (el resultado ya filtrado) y `onQueryChange` (callback que
 * calcula esas sugerencias, típicamente contra una API) — mismo contrato que
 * la versión anterior sobre PrimeReact (`suggestions`/`completeMethod`).
 */
const AutoComplete = React.forwardRef<HTMLDivElement, AutoCompleteProps>(
  (
    {
      className,
      value,
      onChange,
      suggestions,
      onQueryChange,
      placeholder = "Buscar...",
      disabled,
      variant,
      size,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      id,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const assignRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        assignForwardedRef(ref, node);
      },
      [ref],
    );
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
    const combobox = useCombobox({
      // El id externo (Field/label) va al input vía `ids`, sin pisar el id de Zag.
      ids: id ? { input: id } : undefined,
      collection,
      inputValue: value,
      disabled,
      open,
      openOnClick: true,
      onOpenChange: (details) => setOpen(details.open),
      onInteractOutside: () => setOpen(false),
      onInputValueChange: (details) => {
        onChange(details.inputValue);
        onQueryChange(details.inputValue);
      },
      onValueChange: (details) => {
        const next = details.items[0]?.value;
        if (next !== undefined) onChange(next);
      },
      ...props,
    });
    const reposition = combobox.reposition;

    React.useEffect(() => {
      if (!open) return;
      const frame = window.requestAnimationFrame(() => reposition());
      return () => window.cancelAnimationFrame(frame);
    }, [open, reposition]);

    const dismiss = React.useCallback(() => setOpen(false), []);
    useOverlayDismiss(open, true, rootRef, contentRef, dismiss);

    return (
      <ArkCombobox.RootProvider
        ref={assignRootRef}
        value={combobox}
        className={cn("w-full", className)}
      >
        <ArkCombobox.Control
          aria-invalid={ariaInvalid}
          className={cn(
            fieldControlVariants({ variant, size }),
            "flex items-center gap-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
          )}
        >
          <ArkCombobox.Input
            aria-label={ariaLabel}
            aria-invalid={ariaInvalid}
            placeholder={placeholder}
            onKeyDown={(event) => {
              if (event.key === "Escape" || event.key === "Tab") setOpen(false);
            }}
            className="min-w-0 flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          />
          <ArkCombobox.Trigger
            aria-label="Mostrar sugerencias"
            onKeyDown={(event) => {
              if (event.key === "Escape" || event.key === "Tab") setOpen(false);
            }}
            className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        <Portal>
          <ArkCombobox.Positioner>
            <ArkCombobox.Content
              ref={contentRef}
              className={cn(
                floatingPanelStyles,
                "max-h-72 min-w-[var(--reference-width)] p-1.5",
                elevationRing,
                popoverAnimation,
              )}
            >
              <ArkCombobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </ArkCombobox.Empty>
              {items.map((item) => (
                <ArkCombobox.Item
                  key={item.value}
                  item={item}
                  className={optionStyles}
                >
                  <ArkCombobox.ItemText>{item.label}</ArkCombobox.ItemText>
                  <ArkCombobox.ItemIndicator>
                    <Check aria-hidden="true" className="size-4" />
                  </ArkCombobox.ItemIndicator>
                </ArkCombobox.Item>
              ))}
            </ArkCombobox.Content>
          </ArkCombobox.Positioner>
        </Portal>
      </ArkCombobox.RootProvider>
    );
  },
);
AutoComplete.displayName = "AutoComplete";

export { AutoComplete };
