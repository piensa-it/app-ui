import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import type { LinkComponent } from "@/components/marketing/public-header";

export interface DocsNavItem {
  label: React.ReactNode;
  href: string;
  /** Página actual. */
  active?: boolean;
  /** Insignia corta: «New», «Beta». */
  badge?: React.ReactNode;
}

export interface DocsNavGroup {
  title?: React.ReactNode;
  items: DocsNavItem[];
}

export interface DocsTocItem {
  /** `id` del encabezado dentro de la página. */
  id: string;
  label: React.ReactNode;
  /** @default 2 */
  level?: 2 | 3;
}

export interface DocsPageLink {
  label: React.ReactNode;
  href: string;
}

export interface DocsLayoutLabels {
  nav: string;
  toc: string;
  previous: string;
  next: string;
  menu: string;
  breadcrumbs: string;
}

const defaultLabels: DocsLayoutLabels = {
  nav: "Documentación",
  toc: "En esta página",
  previous: "Anterior",
  next: "Siguiente",
  menu: "Menú de la documentación",
  breadcrumbs: "Ruta de navegación",
};

export interface DocsLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  nav: DocsNavGroup[];
  /** Encabezados de la página. Sin él, no hay columna de contenido derecha. */
  toc?: DocsTocItem[];
  breadcrumbs?: BreadcrumbItem[];
  prev?: DocsPageLink;
  next?: DocsPageLink;
  /** Contenido sobre la guía, bajo la miga de pan: título, descripción. */
  header?: React.ReactNode;
  labels?: Partial<DocsLayoutLabels>;
  linkComponent?: LinkComponent;
}

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

/**
 * Estructura común del portal del desarrollador (#213): menú lateral por
 * grupos, contenido, tabla de contenidos y anterior/siguiente. No incluye
 * header ni footer, que pone el sitio. En móvil el menú y la tabla de
 * contenidos se pliegan con `<details>` nativo: se navega sin JavaScript.
 */
const DocsLayout = React.forwardRef<HTMLDivElement, DocsLayoutProps>(
  ({ nav, toc, breadcrumbs, prev, next, header, labels: labelsProp, linkComponent: Link = DefaultLink, className, children, ...props }, ref) => {
    const labels = { ...defaultLabels, ...labelsProp };
    const hasToc = Boolean(toc && toc.length > 0);

    const navList = (
      <div className="flex flex-col gap-6">
        {nav.map((group, groupIndex) => (
          <div key={groupIndex} className="flex flex-col gap-1.5">
            {group.title && (
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm no-underline transition-colors",
                      item.active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                      focusRingOutside,
                    )}
                    {...(item.active ? ({ "aria-current": "page" } as object) : {})}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );

    const tocList = hasToc && (
      <ul className="flex flex-col gap-1.5 border-s border-border text-sm">
        {toc!.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ms-px block border-s border-transparent py-0.5 text-muted-foreground no-underline transition-colors hover:border-foreground hover:text-foreground",
                item.level === 3 ? "ps-6" : "ps-3",
                focusRingOutside,
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    );

    const summaryClass = cn(
      "flex cursor-pointer list-none items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden",
      focusRingOutside,
    );

    return (
      <div
        ref={ref}
        className={cn(
          "container mx-auto grid gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:px-8",
          hasToc && "xl:grid-cols-[15rem_minmax(0,1fr)_13rem]",
          className,
        )}
        {...props}
      >
        {/* Menú: plegable en móvil, fijo en escritorio. */}
        <nav aria-label={labels.nav} className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          <details className="group lg:hidden">
            <summary className={summaryClass}>
              {labels.menu}
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="pt-4">{navList}</div>
          </details>
          <div className="hidden lg:block">{navList}</div>
        </nav>

        <div className="flex min-w-0 flex-col gap-8">
          {(breadcrumbs || header) && (
            <div className="flex flex-col gap-4">
              {breadcrumbs && <Breadcrumb items={breadcrumbs} linkComponent={Link} aria-label={labels.breadcrumbs} />}
              {header}
            </div>
          )}

          {hasToc && (
            <details className="group xl:hidden">
              <summary className={summaryClass}>
                {labels.toc}
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <nav aria-label={labels.toc} className="pt-4">
                {tocList}
              </nav>
            </details>
          )}

          <article className="min-w-0">{children}</article>

          {(prev || next) && (
            <nav aria-label={`${labels.previous} / ${labels.next}`} className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              {prev ? (
                <Link to={prev.href} className={cn(pagerClass, "items-start")}>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                    {labels.previous}
                  </span>
                  <span className="font-medium text-foreground">{prev.label}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={next.href} className={cn(pagerClass, "items-end text-end sm:col-start-2")}>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {labels.next}
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className="font-medium text-foreground">{next.label}</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {hasToc && (
          <nav aria-label={labels.toc} className="hidden xl:sticky xl:top-20 xl:block xl:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{labels.toc}</p>
            {tocList}
          </nav>
        )}
      </div>
    );
  },
);
DocsLayout.displayName = "DocsLayout";

const pagerClass = cn(
  "flex flex-col gap-1 rounded-lg border border-border bg-card p-4 no-underline transition-colors hover:border-primary/40",
  focusRingOutside,
);

export { DocsLayout };
