import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon";

import type { LinkComponent } from "./public-header";

/** Tono semántico de una tarjeta o de su insignia. */
export type FeatureTone = "primary" | "success" | "warning" | "destructive" | "muted";

export interface FeatureItem {
  title: React.ReactNode;
  /** Acepta nodos, para `code` en línea o énfasis. */
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Insignia de estado arriba a la derecha (Deliver «Fase 1»). */
  badge?: { label: React.ReactNode; tone?: FeatureTone };
  /** Chip monoespaciado sobre el título (AdapterDian `/invoices/v1`). */
  tag?: React.ReactNode;
  /** Viñetas dentro de la tarjeta. */
  bullets?: React.ReactNode[];
  /** Etiquetas cortas al pie (piensait.com «ERP & POS · EDI X12»). */
  tags?: string[];
  /** Pie «etiqueta: valor» (Deliver «Llega a …»). */
  meta?: { label: React.ReactNode; value: React.ReactNode };
  /** Tinte de la tarjeta y del ícono. @default "primary" */
  tone?: FeatureTone;
  /** Atenúa la tarjeta (piensait.com: países «en evaluación»). */
  dimmed?: boolean;
  /** Convierte la tarjeta en enlace. */
  href?: string;
}

export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: FeatureItem[];
  /** Columnas en escritorio; en móvil siempre es una. @default 3 */
  columns?: 2 | 3 | 4 | 5;
  /**
   * - `card`: tarjetas separadas.
   * - `list`: ícono a la izquierda, sin caja (Deliver confiabilidad).
   * - `joined`: celdas unidas por bordes, sin separación (AdapterDian, piensait.com).
   * - `compact`: celdas pequeñas sin ícono, para 6 a 9 items (CoreLink).
   * @default "card"
   */
  variant?: "card" | "list" | "joined" | "compact";
  /** Numera las tarjetas «01, 02…» (CoreLink, Lynx). Convive con el ícono. */
  numbered?: boolean;
  /** Centra la última fila cuando no se completa, en vez de dejar un hueco. @default true */
  centerLastRow?: boolean;
  linkComponent?: LinkComponent;
}

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

const toneText: Record<FeatureTone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

const toneTint: Record<FeatureTone, string> = {
  primary: "from-primary/10",
  success: "from-success/10",
  warning: "from-warning/10",
  destructive: "from-destructive/10",
  muted: "from-muted",
};

const badgeVariant: Record<FeatureTone, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  primary: "default",
  success: "success",
  warning: "warning",
  destructive: "destructive",
  muted: "secondary",
};

// Ancho de cada celda con `gap-6` (1.5rem). Se usa flex y no grid para poder
// centrar la última fila incompleta.
const gappedWidth = {
  2: "md:w-[calc((100%-1.5rem)/2)]",
  3: "md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]",
  4: "md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]",
  5: "md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-6rem)/5)]",
} as const;

// `joined` no tiene separación: las celdas comparten borde con `-ml-px -mt-px`.
const joinedWidth = {
  2: "md:w-1/2",
  3: "md:w-1/2 lg:w-1/3",
  4: "md:w-1/2 lg:w-1/4",
  5: "md:w-1/2 lg:w-1/5",
} as const;

/**
 * Rejilla de capacidades, módulos, canales o garantías. Cubre las variantes de
 * las landings de Piensa IT con los mismos datos: tarjetas, lista, celdas
 * unidas y compacta.
 */
const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  (
    { items, columns = 3, variant = "card", numbered = false, centerLastRow = true, linkComponent: Link = DefaultLink, className, ...props },
    ref,
  ) => {
    const joined = variant === "joined";
    return (
      <div
        ref={ref}
        role="list"
        className={cn(
          "flex flex-wrap",
          joined ? "pl-px pt-px" : variant === "compact" ? "gap-4" : "gap-6",
          centerLastRow && "justify-center",
          className,
        )}
        {...props}
      >
        {items.map((item, index) => {
          const tone = item.tone ?? "primary";
          const number = numbered ? String(index + 1).padStart(2, "0") : undefined;
          const width = joined ? joinedWidth[columns] : variant === "compact" ? gappedWidthCompact[columns] : gappedWidth[columns];

          const body = (
            <>
              {(item.icon || number || item.badge) && variant !== "list" && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {number && (
                      <span className="font-mono text-sm font-semibold text-muted-foreground" aria-hidden="true">
                        {number}
                      </span>
                    )}
                    {item.icon && variant !== "compact" && (
                      <IconTile icon={item.icon} color={tone} containerColor={tone} containerSize="md" />
                    )}
                  </div>
                  {item.badge && (
                    <Badge variant={badgeVariant[item.badge.tone ?? "muted"]} size="sm">
                      {item.badge.label}
                    </Badge>
                  )}
                </div>
              )}
              {item.tag && (
                <span className="w-fit rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-xs text-foreground">
                  {item.tag}
                </span>
              )}
              <h3 className={cn("font-heading font-semibold text-foreground", variant === "compact" ? "text-base" : "text-lg")}>
                {item.title}
              </h3>
              {item.description && (
                <div className="text-sm leading-relaxed text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground">
                  {item.description}
                </div>
              )}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {item.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden="true" className={cn("mt-2 size-1 shrink-0 rounded-full bg-current", toneText[tone])} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {(item.tags?.length || item.meta) && (
                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-muted-foreground">
                  {item.meta && (
                    <span>
                      <span className="font-medium text-foreground">{item.meta.label}</span> {item.meta.value}
                    </span>
                  )}
                  {item.tags?.map((tag) => (
                    <span key={tag} className="font-semibold uppercase tracking-[0.12em]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          );

          const cellClasses = cn(
            "flex w-full flex-col gap-3",
            width,
            item.dimmed && "opacity-60",
            variant === "card" &&
              cn("rounded-xl border border-border bg-card bg-gradient-to-br to-transparent p-6 shadow-sm", toneTint[tone]),
            variant === "joined" && "-ml-px -mt-px border border-border bg-card p-6",
            variant === "compact" && "rounded-lg border border-border bg-card p-4",
            variant === "list" && "flex-row gap-4 py-2",
            item.href && "transition-colors hover:border-primary/40",
          );

          const content =
            variant === "list" ? (
              <>
                {(item.icon || number) && (
                  <div className="shrink-0">
                    {item.icon ? (
                      <IconTile icon={item.icon} color={tone} containerColor={tone} />
                    ) : (
                      <span className="font-mono text-sm font-semibold text-muted-foreground">{number}</span>
                    )}
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-2">{body}</div>
              </>
            ) : (
              body
            );

          return (
            <div key={index} role="listitem" className={cellClasses}>
              {item.href ? (
                <Link to={item.href} className={cn("-m-2 flex flex-1 flex-col gap-3 rounded-lg p-2 no-underline", focusRingOutside)}>
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    );
  },
);
FeatureGrid.displayName = "FeatureGrid";

const gappedWidthCompact = {
  2: "sm:w-[calc((100%-1rem)/2)]",
  3: "sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]",
  4: "sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]",
  5: "sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4rem)/5)]",
} as const;

export { FeatureGrid };
