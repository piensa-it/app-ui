import * as React from "react";
import { Combobox as ArkCombobox, createListCollection, useCombobox } from "@ark-ui/react/combobox";
import { Portal } from "@ark-ui/react/portal";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { assignForwardedRef, useOverlayDismiss } from "@/lib/overlay-dismiss";
import { splitAriaProps } from "@/lib/aria-props";
import { fieldControlVariants, floatingPanelStyles, optionStyles } from "@/lib/recipes/field-control";

export interface SearchSelectOption {
  /** Texto de la opción; es también lo que queda escrito en el campo al elegirla. */
  label: string;
  /** Identificador del registro (el id del cliente, el código del ítem...). */
  value: string | number;
  /** Segunda línea para distinguir registros homónimos (NIT, código, ciudad). */
  description?: string;
  disabled?: boolean;
}

export interface SearchSelectProps extends VariantProps<typeof fieldControlVariants> {
  /** Registros entre los que se elige. Con `onSearch`, los resultados que devolvió tu búsqueda. */
  options: SearchSelectOption[];
  /** Identificador del registro seleccionado, o `null` si no hay ninguno. */
  value?: string | number | null;
  /** Avisa el identificador elegido y la opción completa (para leer precio, NIT...). `null` al limpiar. */
  onChange?: (value: string | number | null, option: SearchSelectOption | null) => void;
  /**
   * Búsqueda en el servidor. Si la pasas, el componente **no filtra**: muestra
   * `options` tal cual y te avisa el texto (con retardo `searchDelay`) para
   * que traigas los resultados. Sin ella, filtra `options` localmente por
   * `label` y `description`, sin distinguir tildes ni mayúsculas.
   */
  onSearch?: (query: string) => void;
  /**
   * Milisegundos sin teclear antes de llamar `onSearch`.
   * @default 300
   */
  searchDelay?: number;
  /** Muestra "Buscando…" en el panel mientras llegan los resultados. */
  loading?: boolean;
  /**
   * Opción del valor actual cuando no está en `options` — típico al editar un
   * documento guardado con búsqueda en el servidor. Sin ella el campo no
   * sabría qué nombre mostrar.
   */
  selectedOption?: SearchSelectOption | null;
  /**
   * Máximo de opciones pintadas en el panel. Con miles de registros, pintarlos
   * todos vuelve lento el desplegable; el resto se alcanza escribiendo.
   * @default 50
   */
  maxResults?: number;
  /**
   * Muestra la X para dejar el campo sin selección.
   * @default true
   */
  clearable?: boolean;
  placeholder?: string;
  /** @default "Sin resultados" */
  emptyText?: string;
  disabled?: boolean;
  /** Nombre del campo en un `<form>`: envía el identificador, no el texto visible. */
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-labelledby"?: string;
  "aria-required"?: boolean | "true" | "false";
  className?: string;
}

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase().trim();
}

/**
 * Selector con búsqueda sobre Ark UI Combobox: se escribe para encontrar el
 * registro, pero solo se puede **elegir** uno existente y `value` es su
 * identificador. Pensado para listas grandes (clientes, ítems): con
 * `onSearch` la búsqueda va al servidor, y en local nunca pinta más de
 * `maxResults` opciones. A diferencia de `AutoComplete`, el texto libre no
 * queda como valor: al salir sin elegir, el campo vuelve al registro elegido.
 */
const SearchSelect = React.forwardRef<HTMLDivElement, SearchSelectProps>(
  (
    {
      className,
      options,
      value = null,
      onChange,
      onSearch,
      searchDelay = 300,
      loading = false,
      selectedOption,
      maxResults = 50,
      clearable = true,
      placeholder = "Buscar…",
      emptyText = "Sin resultados",
      disabled,
      name,
      id,
      variant,
      size,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [ariaProps] = splitAriaProps(props);
    const invalid = ariaProps["aria-invalid"] === true || ariaProps["aria-invalid"] === "true";
    const hasValue = value !== null && value !== undefined;

    const [open, setOpen] = React.useState(false);
    // Solo se filtra por lo que la persona escribió: al abrir con un cliente ya
    // elegido, el campo muestra su nombre, y filtrar por él dejaría una sola opción.
    const [query, setQuery] = React.useState<string | null>(null);

    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const assignRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        assignForwardedRef(ref, node);
      },
      [ref],
    );

    // Recuerda la última opción elegida: con búsqueda en el servidor, una
    // búsqueda nueva la saca de `options` y el campo se quedaría sin nombre.
    const lastSelectedRef = React.useRef<SearchSelectOption | null>(null);
    const currentOption = React.useMemo(() => {
      if (!hasValue) return null;
      const key = String(value);
      return (
        options.find((option) => String(option.value) === key) ??
        (selectedOption && String(selectedOption.value) === key ? selectedOption : null) ??
        (lastSelectedRef.current && String(lastSelectedRef.current.value) === key ? lastSelectedRef.current : null)
      );
    }, [hasValue, options, selectedOption, value]);
    if (currentOption) lastSelectedRef.current = currentOption;
    const selectedLabel = currentOption?.label ?? "";

    const filtered = React.useMemo(() => {
      if (onSearch || !query) return options;
      const needle = normalize(query);
      return options.filter(
        (option) =>
          normalize(option.label).includes(needle) ||
          (option.description !== undefined && normalize(option.description).includes(needle)),
      );
    }, [onSearch, options, query]);
    const visible = React.useMemo(() => filtered.slice(0, maxResults), [filtered, maxResults]);

    const collection = React.useMemo(
      () =>
        createListCollection({
          items: visible,
          itemToValue: (item) => String(item.value),
          itemToString: (item) => item.label,
          isItemDisabled: (item) => !!item.disabled,
        }),
      [visible],
    );

    const onSearchRef = React.useRef(onSearch);
    React.useEffect(() => {
      onSearchRef.current = onSearch;
    });
    const lastSentRef = React.useRef<string | null>(null);
    React.useEffect(() => {
      if (!open) {
        lastSentRef.current = null;
        return;
      }
      if (!onSearchRef.current) return;
      const next = query ?? "";
      if (lastSentRef.current === next) return;
      const send = () => {
        lastSentRef.current = next;
        onSearchRef.current?.(next);
      };
      // Al abrir se busca de inmediato; al teclear, con retardo.
      if (lastSentRef.current === null || searchDelay <= 0) {
        send();
        return;
      }
      const timeout = setTimeout(send, searchDelay);
      return () => clearTimeout(timeout);
    }, [open, query, searchDelay]);

    const close = React.useCallback(() => {
      setOpen(false);
      setQuery(null);
    }, []);

    const combobox = useCombobox({
      // El id externo (Field/label) va al input vía `ids`, sin pisar el id de Zag.
      ids: id ? { input: id } : undefined,
      collection,
      value: hasValue ? [String(value)] : [],
      // El texto del input NO es controlado: controlarlo pierde teclas al
      // escribir rápido (lector de código de barras) porque cada tecla hace un
      // ida y vuelta por React. Se sincroniza con `setInputValue` más abajo.
      defaultInputValue: selectedLabel,
      disabled,
      invalid,
      open,
      openOnClick: true,
      inputBehavior: "autohighlight",
      onOpenChange: (details) => {
        if (details.open) setOpen(true);
        else close();
      },
      onInteractOutside: close,
      onInputValueChange: (details) => {
        if (details.reason === "input-change") setQuery(details.inputValue);
      },
      onValueChange: (details) => {
        const option = details.items[0] ?? null;
        if (!option) return;
        lastSelectedRef.current = option;
        setQuery(null);
        onChange?.(option.value, option);
      },
    });
    const reposition = combobox.reposition;
    const comboboxRef = React.useRef(combobox);
    React.useEffect(() => {
      comboboxRef.current = combobox;
    });

    // Cuando no se está escribiendo (al cerrar, o si el valor cambia desde
    // afuera), el campo vuelve a mostrar el registro elegido.
    React.useEffect(() => {
      if (query === null) comboboxRef.current.setInputValue(selectedLabel);
    }, [query, selectedLabel]);

    React.useEffect(() => {
      if (!open) return;
      const frame = window.requestAnimationFrame(() => reposition());
      return () => window.cancelAnimationFrame(frame);
    }, [open, reposition]);

    useOverlayDismiss(open, true, rootRef, contentRef, close);

    const clear = () => {
      lastSelectedRef.current = null;
      setQuery(null);
      comboboxRef.current.setInputValue("");
      onChange?.(null, null);
    };

    const truncated = filtered.length > visible.length;

    return (
      <ArkCombobox.RootProvider
        ref={assignRootRef}
        value={combobox}
        // Igual que Select: el panel se monta solo al abrir, para que un Dialog
        // abierto después no lo marque aria-hidden ni lo tape.
        lazyMount
        unmountOnExit
        className={cn("w-full", className)}
      >
        <ArkCombobox.Control
          aria-invalid={invalid || undefined}
          className={cn(
            fieldControlVariants({ variant, size }),
            "flex items-center gap-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
          )}
        >
          <ArkCombobox.Input
            aria-label={ariaLabel}
            {...ariaProps}
            placeholder={placeholder}
            onKeyDown={(event) => {
              if (event.key === "Escape" || event.key === "Tab") close();
            }}
            className="min-w-0 flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          />
          {clearable && hasValue && !disabled ? (
            <button
              type="button"
              aria-label="Quitar selección"
              onClick={clear}
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
          <ArkCombobox.Trigger
            aria-label="Mostrar opciones"
            onKeyDown={(event) => {
              if (event.key === "Escape" || event.key === "Tab") close();
            }}
            className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-hidden hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronsUpDown aria-hidden="true" className="size-4" />
          </ArkCombobox.Trigger>
        </ArkCombobox.Control>
        {name ? <input type="hidden" name={name} value={hasValue ? String(value) : ""} /> : null}
        <Portal>
          <ArkCombobox.Positioner>
            <ArkCombobox.Content
              ref={contentRef}
              aria-busy={loading || undefined}
              className={cn(
                floatingPanelStyles,
                "max-h-80 min-w-[var(--reference-width)] p-1.5",
                elevationRing,
                popoverAnimation,
              )}
            >
              {loading ? (
                <div role="status" className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
                  <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                  Buscando…
                </div>
              ) : visible.length === 0 ? (
                <div role="status" className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                visible.map((option) => (
                  <ArkCombobox.Item key={option.value} item={option} className={optionStyles}>
                    <span className="flex min-w-0 flex-col">
                      <ArkCombobox.ItemText className="truncate">{option.label}</ArkCombobox.ItemText>
                      {option.description ? (
                        <span className="truncate text-xs text-muted-foreground">{option.description}</span>
                      ) : null}
                    </span>
                    <ArkCombobox.ItemIndicator>
                      <Check aria-hidden="true" className="size-4 shrink-0" />
                    </ArkCombobox.ItemIndicator>
                  </ArkCombobox.Item>
                ))
              )}
              {!loading && truncated ? (
                <p className="border-t border-surface-border px-3 pb-1 pt-2 text-xs text-muted-foreground">
                  Mostrando {visible.length} de {filtered.length.toLocaleString("es-CO")}. Escribe para acotar.
                </p>
              ) : null}
            </ArkCombobox.Content>
          </ArkCombobox.Positioner>
        </Portal>
      </ArkCombobox.RootProvider>
    );
  },
);
SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
