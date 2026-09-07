import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

export interface SidebarSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** @default "Buscar en el menú…" */
  placeholder?: string;
  /** Nombre accesible del campo. @default "Buscar en el menú" */
  label?: string;
  /** Nombre accesible del botón de limpiar. @default "Limpiar búsqueda" */
  clearLabel?: string;
}

/**
 * Buscador de opciones del menú lateral: un campo arriba de la navegación
 * que la aplicación usa para filtrar sus enlaces. La librería no conoce los
 * enlaces; solo pone el campo con los tokens del menú, la lupa, el botón de
 * limpiar y Escape.
 *
 * Con el menú plegado no se pinta: no hay sitio para escribir. En dos niveles
 * va en el panel de sección, que es donde está el árbol.
 *
 * @example
 * ```tsx
 * sidebar={
 *   <>
 *     <SidebarSearch value={busqueda} onChange={setBusqueda} />
 *     <SidebarNav>{enlacesFiltrados}</SidebarNav>
 *   </>
 * }
 * ```
 */
export const SidebarSearch = React.forwardRef<HTMLInputElement, SidebarSearchProps>(
  ({ value, onChange, placeholder = "Buscar en el menú…", label = "Buscar en el menú", clearLabel = "Limpiar búsqueda", className, ...props }, ref) => {
    const { collapsed } = useSidebar();
    if (collapsed) return null;

    return (
      <div className={cn("relative px-ui-2xs pb-ui-xs", className)}>
        <Search aria-hidden="true" className="pointer-events-none absolute left-ui-sm top-1/2 size-4 -translate-y-1/2 text-sidebar-muted" />
        <input
          ref={ref}
          type="search"
          value={value}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && value) {
              event.preventDefault();
              onChange("");
            }
          }}
          className={cn(
            "h-control-compact w-full rounded-md border border-sidebar-border bg-sidebar-hover pl-8 pr-8 text-ui-body-sm text-sidebar-foreground",
            "placeholder:text-sidebar-muted [&::-webkit-search-cancel-button]:hidden",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          )}
          {...props}
        />
        {value ? (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onChange("")}
            className="absolute right-ui-sm top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-sidebar-muted hover:text-sidebar-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);
SidebarSearch.displayName = "SidebarSearch";
