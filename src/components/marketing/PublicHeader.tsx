import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

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
}

/**
 * Header público con comportamiento de scroll (blur + borde al hacer
 * scroll) y menú móvil. Sin acoplamiento a marca ni a router: recibe logo,
 * nombre y navegación por props, y el componente de link es inyectable.
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
      className={`fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm transition-all duration-300 ${
        scrolled ? "border-b border-border shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to={homeHref} className="flex min-w-0 items-center gap-2 no-underline">
            <img src={logoSrc} alt={brandName} className="h-9 w-9 shrink-0" />
            <span className="text-lg font-bold text-foreground">{brandName}</span>
            {badge && (
              <span className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs text-primary">{badge}</span>
            )}
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {crossLink && (
              <Link to={crossLink.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {crossLink.label}
              </Link>
            )}
            {desktopNav}
          </nav>

          <button
            className="p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-border py-4 md:hidden"
          >
            <nav className="flex flex-col gap-3">
              {crossLink && (
                <Link
                  to={crossLink.to}
                  className="py-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {crossLink.label}
                </Link>
              )}
              {mobileNav}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};
