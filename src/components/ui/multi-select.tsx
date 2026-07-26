import * as React from "react";
import { Select as ArkSelect, createListCollection, useSelect } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronDown, X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { assignForwardedRef, useOverlayDismiss } from "@/lib/overlay-dismiss";
import type { SelectOption } from "@/components/ui/select";
import { fieldControlVariants, floatingPanelStyles, optionStyles } from "@/lib/recipes/field-control";

export interface MultiSelectFieldProps
  extends Omit<
    ArkSelect.RootProps<SelectOption>,
    "collection" | "value" | "onValueChange" | "items" | "multiple" | "onChange"
  >,
    VariantProps<typeof fieldControlVariants> {
  options: SelectOption[];
  value?: Array<string | number>;
  onChange?: (value: Array<string | number>) => void;
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
}

/** Selector múltiple sobre Ark UI (headless), con chips removibles y el tema Tailwind de la librería. */
const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectFieldProps>(
  (
    {
      className,
      options,
      value = [],
      onChange,
      placeholder = "Selecciona opciones",
      "aria-label": ariaLabel,
      id,
      variant,
      size,
      open: controlledOpen,
      defaultOpen,
      onOpenChange,
      onInteractOutside,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
    const open = controlledOpen ?? internalOpen;
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const assignRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        assignForwardedRef(ref, node);
      },
      [ref],
    );
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
    const select = useSelect({
      id: id ? `${id}-root` : undefined,
      collection,
      multiple: true,
      value: selected,
      open,
      onOpenChange: (details) => {
        if (controlledOpen === undefined) setInternalOpen(details.open);
        onOpenChange?.(details);
      },
      onInteractOutside: (event) => {
        if (controlledOpen === undefined) setInternalOpen(false);
        onInteractOutside?.(event);
      },
      onValueChange: (details) => {
        const next = details.items.map((item) => item.value);
        onChange?.(next);
      },
      ...props,
    });
    const isOpen = select.open;
    const reposition = select.reposition;

    React.useEffect(() => {
      if (!isOpen) return;
      const frame = window.requestAnimationFrame(() => reposition());
      return () => window.cancelAnimationFrame(frame);
    }, [isOpen, reposition]);

    const dismiss = React.useCallback(() => setInternalOpen(false), []);
    useOverlayDismiss(open, controlledOpen === undefined, rootRef, contentRef, dismiss);

    const removeValue = (raw: string) => {
      const next = value.filter((item) => String(item) !== raw);
      onChange?.(next);
    };

    return (
      <ArkSelect.RootProvider
        ref={assignRootRef}
        value={select}
        className={cn("w-full", className)}
      >
        <ArkSelect.Control
          onClick={() => select.setOpen(true)}
          className={cn(
            fieldControlVariants({ variant, size }),
            "group flex cursor-pointer flex-wrap items-center gap-1.5 py-1.5",
          )}
        >
            {selected.length === 0 ? (
              <span className="px-1 text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((raw) => (
                <span
                  key={raw}
                  className="flex min-h-7 items-center gap-1 rounded-md bg-subtle px-2 text-xs font-medium text-subtle-foreground"
                >
                  {labelByValue.get(raw) ?? raw}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeValue(raw);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        removeValue(raw);
                      }
                    }}
                    aria-label={`Quitar ${labelByValue.get(raw) ?? raw}`}
                    className="rounded-sm opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X aria-hidden="true" className="size-3" />
                  </span>
                </span>
              ))
            )}
            <ArkSelect.Trigger
              id={id}
              aria-label={ariaLabel ?? "Mostrar opciones"}
              className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronDown
                aria-hidden="true"
                className="size-4 transition-transform duration-150 group-data-[state=open]:rotate-180"
              />
            </ArkSelect.Trigger>
        </ArkSelect.Control>
        <Portal>
          <ArkSelect.Positioner>
            <ArkSelect.Content
              ref={contentRef}
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
      </ArkSelect.RootProvider>
    );
  },
);
MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
