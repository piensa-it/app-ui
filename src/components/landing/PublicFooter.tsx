import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png";

interface SocialLink {
  href: string;
  label: string;
  icon: ReactNode;
}

interface PublicFooterProps {
  /** Una línea describiendo la audiencia (Personas o Empresas). */
  description: string;
  socialLinks: SocialLink[];
  /** Textos de los links legales — con default en español porque LandingEmpresa no tiene i18n. */
  legalLabels?: { terms: string; privacy: string; cookies: string };
  onCookiePreferences: () => void;
}

const DEFAULT_LEGAL_LABELS = { terms: "Términos", privacy: "Tratamiento de datos", cookies: "Cookies" };

/**
 * Footer compartido entre Landing.tsx (Personas) y LandingEmpresa.tsx
 * (Empresas). Antes Personas tenía un footer de una sola fila (logo +
 * crédito + 3 links) y Empresas uno de 4 columnas con links de producto y
 * redes sociales, pero SIN los links legales (Términos/Tratamiento de
 * Datos/Cookies) — un hueco real de cumplimiento dado que ambas landings
 * públicas deberían enlazar a la misma política. Este componente adopta
 * la estructura de 4 columnas (más completa) para las dos, agregando los
 * legales que le faltaban a Empresas.
 */
export const PublicFooter = ({
  description,
  socialLinks,
  legalLabels = DEFAULT_LEGAL_LABELS,
  onCookiePreferences,
}: PublicFooterProps) => {
  return (
    <footer className="bg-muted/30 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="MisFin.co" className="h-8 w-auto" />
              <span className="font-bold text-lg">MisFin.co</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Soluciones</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Finanzas Personales
                </Link>
              </li>
              <li>
                <Link to="/empresas" className="hover:text-primary transition-colors">
                  Finanzas Empresariales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terminos" className="hover:text-primary transition-colors">
                  {legalLabels.terms}
                </Link>
              </li>
              <li>
                <Link to="/tratamiento-datos" className="hover:text-primary transition-colors">
                  {legalLabels.privacy}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onCookiePreferences}
                  className="hover:text-primary transition-colors"
                >
                  {legalLabels.cookies}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MisFin.co. Todos los derechos reservados.</p>
          <p className="mt-2">
            Desarrollado con ❤️ por{" "}
            <a href="https://piensait.com" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
              PiensaIT.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
