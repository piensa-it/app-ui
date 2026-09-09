import * as React from "react";
import { Search, X } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/lib/recipes/input";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Input } from "./input";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size">,
    VariantProps<typeof inputVariants> {
  /** Texto actual del campo (controlado). Se refleja en el input al instante, sin esperar el retardo. */
  value: string;
  /**
   * Avisa el valor **con retardo** (`delay`), no en cada tecla: es lo que
   * evita que un buscador conectado a una API dispare una consulta por
   * carácter. Si necesitas reaccionar sin retardo (p. ej. para resaltar
   * texto localmente mientras se escribe), usa `delay={0}`.
   */
  onChange: (value: string) => void;
  /**
   * Milisegundos sin teclear antes de avisar `onChange`. `0` avisa en cada
   * tecla — úsalo cuando el propio consumidor ya hace su propio debounce
   * (p. ej. contra un estado de URL) y este solo aportaría un segundo retardo.
   * @default 300
   */
  delay?: number;
  /** Se dispara al limpiar con el botón de la X, además de `onChange("")`. */
  onClear?: () => void;
  /** Nombre accesible del campo cuando no hay un `<label>` asociado (vía `Field` o `htmlFor`). */
  "aria-label"?: string;
  className?: string;
}

/**
 * Campo de búsqueda: icono, botón de limpiar cuando hay texto, y retardo
 * antes de avisar `onChange` (patrón repetido a mano en cada tabla — ver
 * `data-table-toolbar.tsx`, que no lo tenía). El valor visible se actualiza
 * al instante; `onChange` solo se llama tras `delay` ms sin teclear, así que
 * no es el sitio para sincronizar el valor con otro estado controlado en
 * cada tecla — para eso existe `delay={0}`.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      value,
      onChange,
      delay = 300,
      onClear,
      placeholder = "Buscar…",
      variant,
      size,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [text, setText] = React.useState(value);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // Sincroniza con un reinicio externo del valor (p. ej. "limpiar filtros"
    // en la pantalla que lo contiene). Solo corre cuando `value` cambia de
    // verdad — no en cada render — así que no pisa lo que el usuario está
    // tecleando mientras el retardo de su propia tecla sigue en curso.
    React.useEffect(() => {
      setText(value);
    }, [value]);

    React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

    const scheduleChange = (next: string) => {
      setText(next);
      clearTimeout(timeoutRef.current);
      if (delay <= 0) {
        onChange(next);
        return;
      }
      timeoutRef.current = setTimeout(() => onChange(next), delay);
    };

    const handleClear = () => {
      clearTimeout(timeoutRef.current);
      setText("");
      onChange("");
      onClear?.();
    };

    return (
      <div className={cn("relative", className)}>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="search"
          variant={variant}
          size={size}
          value={text}
          onChange={(event) => scheduleChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn("pl-9", text ? "pr-8" : undefined, "[&::-webkit-search-cancel-button]:hidden")}
          {...props}
        />
        {text ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            className={cn(
              "absolute right-1.5 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-hover hover:text-foreground",
              focusRingOutside,
            )}
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
