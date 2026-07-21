import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

interface PublicHeaderProps {
  /** "Personas" o "Empresas" (ya traducido por quien llama) — el pill junto al logo. */
  badge: string;
  /** Link cruzado a la otra landing pública (p. ej. Personas → /empresas). */
  crossLink: { to: string; label: string };
  /** Contenido del nav de escritorio (selector de idioma, links, botones de auth/CTA...). */
  desktopNav: ReactNode;
  /** Contenido del menú móvil — normalmente una versión apilada de lo mismo que desktopNav. */
  mobileNav: ReactNode;
}

/**
 * Header compartido entre Landing.tsx (Personas) y LandingEmpresa.tsx
 * (Empresas). Antes cada página construía su propio header desde cero —
 * duplicado, y ya divergido visualmente (fixed vs sticky, distinto fondo,
 * sin badge de audiencia en Personas). Ahora es un solo componente: logo,
 * badge de audiencia, comportamiento de scroll y menú móvil viven acá una
 * sola vez; cada página solo pasa su propio contenido de navegación/CTA.
 */
export const PublicHeader = ({ badge, crossLink, desktopNav, mobileNav }: PublicHeaderProps) => {
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
          <div className="flex items-center gap-2 min-w-0">
            <img src={logo} alt="MisFin.co" className="h-9 w-9 shrink-0" />
            <span className="font-bold text-lg text-foreground">MisFin</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded shrink-0">{badge}</span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <Link to={crossLink.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {crossLink.label}
            </Link>
            {desktopNav}
          </nav>

          <button
            className="md:hidden p-2"
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
            className="md:hidden py-4 border-t border-border"
          >
            <nav className="flex flex-col gap-3">
              <Link
                to={crossLink.to}
                className="text-sm text-muted-foreground hover:text-foreground py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {crossLink.label}
              </Link>
              {mobileNav}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};
