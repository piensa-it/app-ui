import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Badge } from "@/components/ui/badge";

import type { FeatureTone } from "./feature-grid";
import type { LinkComponent } from "./public-header";

export interface CatalogProduct {
  name: string;
  /** Logo o isotipo, decorativo. */
  logo?: React.ReactNode;
  tagline: React.ReactNode;
  description?: React.ReactNode;
  /** Para agrupar con `groupBy="category"`. */
  category?: string;
  status?: { label: React.ReactNode; tone?: FeatureTone };
  href: string;
  /** Enlaces secundarios: documentación, precios. */
  links?: { label: React.ReactNode; href: string }[];
  /**
   * Color de la marca del producto como canales HSL (`"243 75% 58%"`), igual
   * que los tokens. Tiñe la tarjeta sin romper la regla de no usar hex.
   */
  accent?: string;
}

export interface ProductCatalogProps extends React.HTMLAttributes<HTMLDivElement> {
  products: CatalogProduct[];
  /** @default 3 */
  columns?: 2 | 3 | 4;
  /** `grid` o `compact` (fila de chips para «Otros productos»). @default "grid" */
  variant?: "grid" | "compact";
  groupBy?: "category";
  linkComponent?: LinkComponent;
}

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

const badgeVariant = { primary: "default", success: "success", warning: "warning", destructive: "destructive", muted: "secondary" } as const;

const columnClasses = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Catálogo de productos de Piensa IT (#202): la web de la empresa enlaza a cada
 * landing, y cada landing puede mostrar «Otros productos» con `compact`.
 */
const ProductCatalog = React.forwardRef<HTMLDivElement, ProductCatalogProps>(
  ({ products, columns = 3, variant = "grid", groupBy, linkComponent: Link = DefaultLink, className, ...props }, ref) => {
    const renderLink = (href: string, classes: string, children: React.ReactNode, extra?: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      isExternal(href) ? (
        <a href={href} target="_blank" rel="noopener" className={classes} {...extra}>
          {children}
        </a>
      ) : (
        <Link to={href} className={classes}>
          {children}
        </Link>
      );

    if (variant === "compact") {
      return (
        <div ref={ref} className={cn("flex flex-wrap gap-2", className)} {...props}>
          {products.map((product) => (
            <React.Fragment key={product.name}>
              {renderLink(
              product.href,
              cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground no-underline transition-colors hover:border-primary/40",
                focusRingOutside,
              ),
              <>
                {product.logo && <span aria-hidden="true" className="inline-flex size-4 [&>*]:size-4">{product.logo}</span>}
                <span className="font-medium">{product.name}</span>
                <span className="hidden text-muted-foreground sm:inline">· {product.tagline}</span>
              </>,
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }

    const card = (product: CatalogProduct) => (
      <li
        key={product.name}
        style={product.accent ? ({ "--product-accent": product.accent } as React.CSSProperties) : undefined}
        className={cn(
          "relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40",
          product.accent && "bg-[linear-gradient(135deg,hsl(var(--product-accent)/0.10),transparent_60%)] hover:border-[hsl(var(--product-accent)/0.5)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {product.logo && (
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg [&>*]:max-h-10 [&>*]:max-w-10">
                {product.logo}
              </span>
            )}
            <h3 className="font-heading text-lg font-semibold text-foreground">
              {/* El enlace cubre toda la tarjeta con un pseudo-elemento; los enlaces secundarios quedan encima. */}
              {renderLink(
                product.href,
                cn("rounded-sm no-underline after:absolute after:inset-0 after:rounded-xl", focusRingOutside),
                product.name,
              )}
            </h3>
          </div>
          {product.status ? (
            <Badge variant={badgeVariant[product.status.tone ?? "muted"]} size="sm">
              {product.status.label}
            </Badge>
          ) : (
            <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <p className="font-medium text-foreground">{product.tagline}</p>
        {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
        {product.links && product.links.length > 0 && (
          <div className="relative z-10 mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm">
            {product.links.map((link, index) => (
              <React.Fragment key={index}>
                {renderLink(link.href, cn("rounded-sm text-primary underline-offset-4 hover:underline", focusRingOutside), link.label)}
              </React.Fragment>
            ))}
          </div>
        )}
      </li>
    );

    const groups: [string | undefined, CatalogProduct[]][] = groupBy
      ? Array.from(
          products.reduce((map, product) => {
            const key = product.category ?? "";
            map.set(key, [...(map.get(key) ?? []), product]);
            return map;
          }, new Map<string, CatalogProduct[]>()),
        )
      : [[undefined, products]];

    return (
      <div ref={ref} className={cn("flex flex-col gap-10", className)} {...props}>
        {groups.map(([category, items]) => (
          <section key={category ?? "all"} className="flex flex-col gap-4">
            {category && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{category}</p>}
            <ul className={cn("grid gap-6", columnClasses[columns])}>{items.map(card)}</ul>
          </section>
        ))}
      </div>
    );
  },
);
ProductCatalog.displayName = "ProductCatalog";

export { ProductCatalog };
