import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import type { LinkComponent } from "@/components/marketing/public-header";

export interface BreadcrumbItem {
  label: React.ReactNode;
  /**
   * Ruta del paso. Se omite en el paso actual (o en cualquier paso que no
   * navegue a ningún sitio) — sin `href` se pinta como texto plano, nunca
   * como un link a ninguna parte.
   */
  href?: string;
}

export interface BreadcrumbProps {
  /** Pasos de la ruta, de la raíz al actual. El último se marca `aria-current="page"` siempre, tenga `href` o no. */
  items: BreadcrumbItem[];
  /** Componente de link a inyectar (react-router, next/link...). Por defecto usa `<a>`. Mismo contrato que `PublicHeader`. */
  linkComponent?: LinkComponent;
  /** @default "Ruta de navegación" */
  "aria-label"?: string;
  separator?: React.ReactNode;
  className?: string;
}

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

/**
 * Navegación de vuelta para pantallas de detalle: `nav` con `aria-label` y
 * una lista ordenada de pasos, el último con `aria-current="page"`. Ark UI no
 * trae este patrón — es marcado propio, sin dependencias.
 *
 * Sin acoplamiento a router: como `PublicHeader`, recibe `linkComponent` en
 * vez de asumir uno. Un paso sin `href` (típicamente el actual) se pinta
 * como texto, nunca como link muerto.
 */
const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      linkComponent: Link = DefaultLink,
      "aria-label": ariaLabel = "Ruta de navegación",
      separator = <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />,
      className,
    },
    ref,
  ) => {
    const lastIndex = items.length - 1;

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn("min-w-0", className)}>
        <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isCurrent = index === lastIndex;
            return (
              <li key={index} className="flex min-w-0 items-center gap-1.5">
                {index > 0 ? separator : null}
                {item.href && !isCurrent ? (
                  <Link
                    to={item.href}
                    className={cn(
                      "min-w-0 truncate rounded-sm hover:text-foreground hover:underline",
                      focusRingOutside,
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn("min-w-0 truncate", isCurrent && "font-medium text-foreground")}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
