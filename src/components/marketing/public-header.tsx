import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

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

export interface PublicHeaderProps {
  logoSrc: string;
  brandName: string;
  /** Ruta a la que navega el logo. */
  homeHref?: string;
  /** Pill opcional junto al logo (ej. "Personas" / "Empresas"). */
  badge?: string;
  /** Link cruzado opcional (ej. Personas → Empresas). */
  crossLink?: { to: string; label: string };
  /** Contenido del nav de escritorio (links, selector de idioma, CTA...). */
  desktopNav: ReactNode;
  /** Contenido del menú móvil. */
  mobileNav: ReactNode;
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
  homeHref = "/",
  badge,
  crossLink,
  desktopNav,
  mobileNav,
  linkComponent: Link = DefaultLink,
  position = "sticky",
  className = "",
}: PublicHeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <img src={logoSrc} alt="" className="size-9 shrink-0 rounded-lg object-contain" />
            <span className="truncate font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">{brandName}</span>
            {badge && (
              <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs text-primary">{badge}</span>
            )}
          </Link>

          <nav aria-label="Navegación principal" className="hidden items-center gap-2 md:flex">
            {crossLink && (
              <Link to={crossLink.to} className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                {crossLink.label}
              </Link>
            )}
            {desktopNav}
          </nav>

          <button
            type="button"
            className={cn(
              "grid size-control-default shrink-0 place-items-center rounded-md border border-transparent text-foreground transition-colors hover:border-border hover:bg-accent md:hidden",
              focusRingOutside,
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div data-marketing-motion="menu-in" className="border-t border-border py-3 md:hidden">
            <nav aria-label="Navegación móvil" className="flex flex-col gap-1">
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
          </div>
        )}
      </div>
    </header>
  );
};
