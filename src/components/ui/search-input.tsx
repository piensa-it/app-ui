import * as React from "react";

import { cn } from "@/lib/utils";
import { inputVariants } from "@/lib/recipes/input";
import { CloseIcon, SearchIcon } from "@/icons";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "onChange" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Al pulsar Enter. Para buscar «al confirmar» en vez de al escribir. */
  onSearch?: (value: string) => void;
  /** @default "Buscar…" */
  placeholder?: string;
  /** Nombre accesible. @default "Buscar" */
  label?: string;
  /**
   * Atajo que abre o enfoca el buscador, para mostrarlo como pista («Ctrl K»).
   * La librería solo lo pinta; registrarlo es de la aplicación.
   */
  shortcut?: string;
  size?: "sm" | "md";
  /** @default "Limpiar búsqueda" */
  clearLabel?: string;
  className?: string;
}

/**
 * Campo de búsqueda: lupa, texto y un botón para limpiar en cuanto hay algo
 * escrito. Es el patrón que faltaba (#60) para la barra superior de `AppShell`
 * y para las barras de herramientas de las tablas.
 *
 * Es opcional por aplicación: `AppShell` tiene el hueco (`topbarStart`), y
 * cada producto decide si lo pone. Controlado: la aplicación decide si busca
 * al escribir (`onChange`) o al confirmar (`onSearch`).
 *
 * @example
 * ```tsx
 * <SearchInput value={consulta} onChange={setConsulta} placeholder="Buscar movimientos…" shortcut="Ctrl K" />
 * ```
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value, onChange, onSearch, placeholder = "Buscar…", label = "Buscar", shortcut, size = "md", clearLabel = "Limpiar búsqueda", className, onKeyDown, ...props },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className={cn("relative flex items-center", className)}>
        <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label={label}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Enter") onSearch?.(value);
            if (event.key === "Escape" && value) {
              event.preventDefault();
              onChange("");
            }
          }}
          className={cn(
            inputVariants({ size }),
            // Sitio para la lupa a la izquierda, y para el botón de limpiar o
            // la pista del atajo a la derecha.
            "pl-9",
            value || shortcut ? "pr-16" : "pr-3",
            // El `search` nativo trae su propia equis en algunos navegadores;
            // aquí la pone la librería, igual en todos.
            "[&::-webkit-search-cancel-button]:hidden",
          )}
          {...props}
        />
        {value ? (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            className={cn(
              "absolute right-2 grid size-6 place-items-center rounded-sm text-muted-foreground",
              "transition-colors duration-fast hover:bg-surface-hover hover:text-foreground",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <CloseIcon aria-hidden="true" className="size-4" />
          </button>
        ) : shortcut ? (
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-2 rounded border border-border bg-surface px-1.5 py-px font-mono text-[0.625rem] text-muted-foreground"
          >
            {shortcut}
          </kbd>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
