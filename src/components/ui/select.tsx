import * as React from "react";
import { Select as ArkSelect, createListCollection, useSelect } from "@ark-ui/react/select";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronDown } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { fieldControlVariants, floatingPanelStyles, optionStyles } from "@/lib/recipes/field-control";
import { selectOptionToString } from "@/lib/select-option";

export interface SelectOption {
  /** Contenido de la opción. Si no es texto plano, pasa también `textValue`. */
  label: React.ReactNode;
  /**
   * Texto plano de la opción cuando `label` es un nodo (icono + texto): lo
   * usan el `<select>` nativo, la búsqueda por teclado y el trigger.
   * Si `label` es string no hace falta.
   */
  textValue?: string;
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
      name,
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
          itemToString: selectOptionToString,
          isItemDisabled: (item) => !!item.disabled,
        }),
      [options],
    );
    const selectedOption = React.useMemo(
      () => (value === null || value === undefined ? undefined : options.find((option) => String(option.value) === String(value))),
      [options, value],
    );
    const select = useSelect({
      // El `id` externo (p. ej. el que inyecta Field para asociar el <label>) se
      // aplica al trigger VÍA `ids`, nunca sobreescribiendo el atributo id del
      // Trigger: Zag localiza sus partes por id (`select:*:trigger`) y si el
      // trigger tiene otro id no lo encuentra, no posiciona el desplegable y lo
      // deja fuera de pantalla (translate -100vh). Visto dentro de Dialog en app-lynx.
      ids: id ? { trigger: id } : undefined,
      collection,
      value: value === null || value === undefined ? [] : [String(value)],
      onValueChange: (details) => {
        const raw = details.items[0]?.value;
        onChange?.(raw === undefined ? null : raw);
      },
      name,
      ...props,
    });
    const isOpen = select.open;
    const reposition = select.reposition;

    React.useEffect(() => {
      if (!isOpen) return;
      const frame = window.requestAnimationFrame(() => reposition());
      return () => window.cancelAnimationFrame(frame);
    }, [isOpen, reposition]);

    return (
      <ArkSelect.RootProvider
        ref={ref}
        value={select}
        // El desplegable se monta solo al abrir: si existe desde el inicio, un Dialog
        // modal que se abra después lo marca aria-hidden (hideOthers) y, al estar antes
        // en el DOM con el mismo z-index, lo tapa — el Select "no abre" dentro del diálogo.
        lazyMount
        unmountOnExit
        className={cn("w-full", className)}
      >
        <ArkSelect.Control>
          <ArkSelect.Trigger
            aria-label={ariaLabel}
            className={cn(
              fieldControlVariants({ variant, size }),
              "group flex cursor-pointer items-center justify-between gap-3",
            )}
          >
            <ArkSelect.ValueText
              placeholder={placeholder}
              className="truncate text-left data-[placeholder-shown]:text-muted-foreground"
            >
              {/* Ark muestra `itemToString` (texto plano); con un label en nodo
                  (icono + texto) se pinta el nodo tal cual. */}
              {selectedOption?.label}
            </ArkSelect.ValueText>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180"
            />
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
        {/* El <select> nativo solo tiene sentido dentro de un <form>: sin
            `name` duplicaría cada opción en el DOM (invisible, pero la
            encuentra cualquier consulta por texto antes que la visible). */}
        {name ? <ArkSelect.HiddenSelect /> : null}
      </ArkSelect.RootProvider>
    );
  },
);
Select.displayName = "Select";

export { Select };
