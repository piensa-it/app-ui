import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

import { ProductSignature, type ProductSignatureOptions } from "./product-signature";
import { resolveSignature } from "./resolve-signature";

import "./marketing.css";

export interface LinkComponentProps {
  to: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

/** Permite inyectar el <Link> de tu router (react-router, next/link, etc.). Por defecto usa <a>. */
export type LinkComponent = ComponentType<LinkComponentProps>;

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

export interface PublicHeaderLabels {
  openMenu: string;
  closeMenu: string;
  mainNav: string;
  mobileNav: string;
}

const defaultLabels: PublicHeaderLabels = {
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  mainNav: "Navegación principal",
  mobileNav: "Navegación móvil",
};

export interface PublicHeaderProps {
  /** Logo del producto. Opcional: con `signature` basta el nombre. */
  logoSrc?: string;
  /** Nombre del producto. Acepta nodos para casos especiales. */
  brandName: ReactNode;
  /**
   * Firma «by Piensa IT» junto al nombre, con el isotipo de Piensa IT
   * incluido. `true` usa los valores por defecto.
   */
  signature?: boolean | ProductSignatureOptions;
  /** Ruta a la que navega el logo. */
  homeHref?: string;
  /** Pill opcional junto al logo (ej. "Personas" / "Empresas"). */
  badge?: string;
  /** Link cruzado opcional (ej. Personas → Empresas). */
  crossLink?: { to: string; label: string };
  /** Enlaces de navegación de escritorio (anclas, páginas). */
  desktopNav?: ReactNode;
  /**
   * Contenido del menú móvil. Solo se usa con `mobileLayout="menu"`: sin él
   * no se pinta el botón de hamburguesa.
   */
  mobileNav?: ReactNode;
  /**
   * Acciones a la derecha, siempre visibles en escritorio: botones (1 o 2),
   * `ThemeToggle`, selector de idioma. En móvil dependen de `mobileLayout`.
   */
  actions?: ReactNode;
  /**
   * Cómo se adapta el header en móvil:
   * - `menu`: hamburguesa que abre `mobileNav` (y las `actions` debajo).
   * - `two-rows`: una segunda fila con `desktopNav` y `actions`.
   * - `actions-only`: se ocultan los enlaces y solo quedan las `actions`.
   * @default "menu" si hay `mobileNav`; si no, "two-rows"
   */
  mobileLayout?: "menu" | "two-rows" | "actions-only";
  /** Textos accesibles, para publicar el header en otros idiomas. */
  labels?: Partial<PublicHeaderLabels>;
  linkComponent?: LinkComponent;
  /** Comportamiento vertical del header. @default "sticky" */
  position?: "sticky" | "fixed" | "static";
  className?: string;
}

/**
 * Header público con comportamiento de scroll (blur + borde al hacer
 * scroll) y menú móvil. Sin acoplamiento a marca ni a router: recibe logo,
 * nombre y navegación por props, y el componente de link es inyectable.
 *
 * La entrada del menú móvil es CSS puro (`marketing.css`), no framer-motion
 * (#64): `data-marketing-motion="menu-in"` remonta con la sección y anima
 * opacidad + `translateY` una sola vez al montar (no necesita salida
 * animada — el menú se desmonta de golpe al cerrar, igual que antes).
 */
export const PublicHeader = ({
  logoSrc,
  brandName,
  signature,
  homeHref = "/",
  badge,
  crossLink,
  desktopNav,
  mobileNav,
  actions,
  mobileLayout = mobileNav === undefined ? "two-rows" : "menu",
  labels: labelsProp,
  linkComponent: Link = DefaultLink,
  position = "sticky",
  className = "",
}: PublicHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const labels = { ...defaultLabels, ...labelsProp };
  const signatureOptions = resolveSignature(signature);
  const hasMenu = mobileLayout === "menu" && mobileNav !== undefined;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        position === "static" ? "relative" : `${position} top-0`,
        "z-50 w-full border-b bg-surface/95 backdrop-blur-xl transition-[border-color,box-shadow,background-color] duration-normal",
        scrolled ? "border-border shadow-sm" : "border-transparent",
        className,
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            to={homeHref}
            className={cn(
              "flex min-w-0 items-center gap-2.5 rounded-md no-underline",
              focusRingOutside,
            )}
          >
            {logoSrc && <img src={logoSrc} alt="" className="size-9 shrink-0 rounded-lg object-contain" />}
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">{brandName}</span>
              {/* Espacio para el nombre accesible «Deliver by Piensa IT»; en flex no se ve. */}
              {signatureOptions && " "}
              {signatureOptions && <ProductSignature {...signatureOptions} className="self-center" />}
            </span>
            {badge && (
              <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs text-primary">{badge}</span>
            )}
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {(crossLink || desktopNav) && (
              <nav aria-label={labels.mainNav} className="hidden items-center gap-2 md:flex">
                {crossLink && (
                  <Link to={crossLink.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                    {crossLink.label}
                  </Link>
                )}
                {desktopNav}
              </nav>
            )}

            {actions && (
              <div
                data-part="actions"
                className={cn(
                  "items-center gap-2",
                  // En `menu` y `two-rows` las acciones móviles viven en el
                  // panel o en la segunda fila; en `actions-only`, aquí mismo.
                  mobileLayout === "actions-only" ? "flex" : "hidden md:flex",
                )}
              >
                {actions}
              </div>
            )}

            {hasMenu && (
              <button
                type="button"
                className={cn(
                  "grid size-control-default shrink-0 place-items-center rounded-md border border-transparent text-foreground transition-colors hover:border-border hover:bg-accent md:hidden",
                  focusRingOutside,
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? labels.closeMenu : labels.openMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {mobileLayout === "two-rows" && (crossLink || desktopNav || actions) && (
          <div data-part="second-row" className="flex flex-wrap items-center gap-2 border-t border-border py-2 md:hidden">
            {(crossLink || desktopNav) && (
              <nav aria-label={labels.mobileNav} className="flex items-center gap-1">
                {crossLink && (
                  <Link to={crossLink.to} className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                    {crossLink.label}
                  </Link>
                )}
                {desktopNav}
              </nav>
            )}
            {actions && <div className="ms-auto flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}

        {hasMenu && mobileMenuOpen && (
          <div data-marketing-motion="menu-in" className="border-t border-border py-3 md:hidden">
            <nav aria-label={labels.mobileNav} className="flex flex-col gap-1">
              {crossLink && (
                <Link
                  to={crossLink.to}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {crossLink.label}
                </Link>
              )}
              {mobileNav}
            </nav>
            {actions && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border px-3 pt-3">{actions}</div>}
          </div>
        )}
      </div>
    </header>
  );
};
