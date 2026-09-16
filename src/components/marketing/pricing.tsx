import * as React from "react";
import { Tabs as ArkTabs } from "@ark-ui/react/tabs";
import { Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------------ */
/* Formato de precios                                                        */
/* ------------------------------------------------------------------------ */

export interface PriceFormat {
  /** Código ISO 4217: `COP`, `USD`. */
  currency: string;
  /** Locale fijo, para que servidor y navegador formateen igual. @default "es-CO" */
  locale?: string;
  /** @default 0 */
  maximumFractionDigits?: number;
}

function formatPrice(value: number | string, format?: PriceFormat) {
  if (typeof value === "string" || !format) return String(value);
  return new Intl.NumberFormat(format.locale ?? "es-CO", {
    style: "currency",
    currency: format.currency,
    maximumFractionDigits: format.maximumFractionDigits ?? 0,
  }).format(value);
}

/* ------------------------------------------------------------------------ */
/* PricingPlans: tarjetas de planes (Deliver /precios)                       */
/* ------------------------------------------------------------------------ */

export interface PricingPlan {
  name: React.ReactNode;
  /** Número (se formatea con `format`) o texto («A la medida»). */
  price: number | string;
  /** «al mes», «al año». */
  period?: React.ReactNode;
  description?: React.ReactNode;
  /** Líneas de detalle: incluidos, precio por unidad, adicional. */
  details?: { label: React.ReactNode; value?: React.ReactNode }[];
  features?: React.ReactNode[];
  /** Plan destacado, con su insignia («Más elegido»). */
  highlighted?: boolean | React.ReactNode;
  /** Botón o enlace del plan. Opcional. */
  action?: React.ReactNode;
}

export interface PricingCategory {
  /** Texto de la pestaña: «WhatsApp». */
  label: string;
  plans: PricingPlan[];
  note?: React.ReactNode;
}

export interface PricingPlansProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Una categoría pinta los planes directo; varias, con pestañas en pastilla. */
  categories: PricingCategory[];
  format?: PriceFormat;
  /** Nota al pie de todas las categorías. */
  note?: React.ReactNode;
  /** Categoría inicial. */
  defaultCategory?: string;
}

function PlanCard({ plan, format }: { plan: PricingPlan; format?: PriceFormat }) {
  const badge = plan.highlighted && plan.highlighted !== true ? plan.highlighted : null;
  return (
    <li
      className={cn(
        "relative flex flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm",
        plan.highlighted ? "border-primary ring-1 ring-primary" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-lg font-semibold text-foreground">{plan.name}</h3>
        {badge && <Badge size="sm">{badge}</Badge>}
      </div>
      <p className="flex items-baseline gap-1.5">
        <span className="font-heading text-3xl font-semibold tracking-tight tabular-nums text-foreground">{formatPrice(plan.price, format)}</span>
        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
      </p>
      {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
      {plan.details && plan.details.length > 0 && (
        <dl className="flex flex-col divide-y divide-border border-y border-border text-sm">
          {plan.details.map((detail, index) => (
            <div key={index} className="flex items-baseline justify-between gap-3 py-2">
              <dt className="text-muted-foreground">{detail.label}</dt>
              {detail.value !== undefined && <dd className="text-end font-medium tabular-nums text-foreground">{detail.value}</dd>}
            </div>
          ))}
        </dl>
      )}
      {plan.features && plan.features.length > 0 && (
        <ul className="flex flex-col gap-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      )}
      {plan.action && <div className="mt-auto pt-2 [&>*]:w-full">{plan.action}</div>}
    </li>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

const planColumns = (count: number) =>
  count >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : count === 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "";

/**
 * Planes en tarjetas, con pestañas por categoría (canal, producto) cuando hay
 * más de una. Todas las categorías están en el HTML: sin JavaScript se leen
 * los precios de la primera y las demás existen para buscadores.
 */
const PricingPlans = React.forwardRef<HTMLDivElement, PricingPlansProps>(
  ({ categories, format, note, defaultCategory, className, ...props }, ref) => {
    const grid = (category: PricingCategory) => (
      <div className="flex flex-col gap-4">
        <ul className={cn("grid gap-6", planColumns(category.plans.length))}>
          {category.plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} format={format} />
          ))}
        </ul>
        {category.note && <Note>{category.note}</Note>}
      </div>
    );

    return (
      <div ref={ref} className={cn("flex flex-col gap-6", className)} {...props}>
        {categories.length === 1 ? (
          grid(categories[0])
        ) : (
          <ArkTabs.Root defaultValue={defaultCategory ?? categories[0]?.label} className="flex flex-col gap-8">
            <ArkTabs.List className="mx-auto flex flex-wrap justify-center gap-1 rounded-full border border-border bg-surface p-1">
              {categories.map((category) => (
                <ArkTabs.Trigger
                  key={category.label}
                  value={category.label}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground",
                    focusRingOutside,
                  )}
                >
                  {category.label}
                </ArkTabs.Trigger>
              ))}
            </ArkTabs.List>
            {categories.map((category) => (
              <ArkTabs.Content key={category.label} value={category.label} className="outline-hidden">
                {grid(category)}
              </ArkTabs.Content>
            ))}
          </ArkTabs.Root>
        )}
        {note && <Note>{note}</Note>}
      </div>
    );
  },
);
PricingPlans.displayName = "PricingPlans";

/* ------------------------------------------------------------------------ */
/* PricingTable: tabla por rangos de volumen (AdapterDian #precios)          */
/* ------------------------------------------------------------------------ */

export interface PricingColumn {
  key: string;
  header: React.ReactNode;
  /** `price` formatea números con `format`; `highlight` resalta en verde (ahorro). */
  kind?: "text" | "number" | "price" | "highlight";
  /** En móvil, la columna se muestra bajo la primera en vez de en su propia celda. */
  mergeOnMobile?: boolean;
}

export interface PricingTableGroup {
  /** Rótulo del grupo: «Emisión». */
  title: React.ReactNode;
  description?: React.ReactNode;
  columns: PricingColumn[];
  rows: Record<string, React.ReactNode | number>[];
  /** A todo el ancho o a media columna en escritorio. @default "full" */
  width?: "full" | "half";
}

export interface PricingTableProps extends React.HTMLAttributes<HTMLDivElement> {
  groups: PricingTableGroup[];
  format?: PriceFormat;
  note?: React.ReactNode;
}

const cellValue = (value: React.ReactNode | number, column: PricingColumn, format?: PriceFormat) =>
  column.kind === "price" && typeof value === "number" ? formatPrice(value, format) : value;

/**
 * Planes por rango de volumen en tablas agrupadas, cada grupo con sus propias
 * columnas. Tabla semántica (`<table>`); en móvil las columnas con
 * `mergeOnMobile` se funden bajo la primera, sin scroll horizontal.
 */
const PricingTable = React.forwardRef<HTMLDivElement, PricingTableProps>(({ groups, format, note, className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-6", className)} {...props}>
    <div className="grid gap-6 lg:grid-cols-2">
      {groups.map((group, groupIndex) => {
        const [first, ...rest] = group.columns;
        return (
          <section
            key={groupIndex}
            className={cn("overflow-hidden rounded-xl border border-border bg-card", group.width !== "half" && "lg:col-span-2")}
          >
            <header className="flex flex-col gap-1 border-b border-border px-5 py-4">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">{group.title}</h3>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
            </header>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-start text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {group.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        "px-5 py-2.5 font-medium",
                        column.kind && column.kind !== "text" ? "text-end" : "text-start",
                        column.mergeOnMobile && "hidden sm:table-cell",
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th scope="row" className="px-5 py-3 text-start font-medium text-foreground">
                      {cellValue(row[first.key], first, format)}
                      {rest
                        .filter((column) => column.mergeOnMobile)
                        .map((column) => (
                          <span key={column.key} className="block text-xs font-normal text-muted-foreground sm:hidden">
                            {cellValue(row[column.key], column, format)}
                          </span>
                        ))}
                    </th>
                    {rest.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-5 py-3 tabular-nums",
                          column.kind && column.kind !== "text" ? "text-end" : "text-start",
                          column.kind === "highlight" ? "font-medium text-success" : "text-foreground",
                          column.kind === "price" && "font-semibold",
                          column.mergeOnMobile && "hidden sm:table-cell",
                        )}
                      >
                        {cellValue(row[column.key], column, format)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
    {note && <Note>{note}</Note>}
  </div>
));
PricingTable.displayName = "PricingTable";

export { PricingPlans, PricingTable };
