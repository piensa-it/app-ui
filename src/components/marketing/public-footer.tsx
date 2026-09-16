import type { ReactNode } from "react";
import type { LinkComponent } from "./public-header";

import { cn } from "@/lib/utils";

interface SocialLink {
  href: string;
  label: string;
  icon: ReactNode;
}

interface FooterColumn {
  title: string;
  links: { to: string; label: string }[];
}

interface FooterLegalLink {
  label: string;
  /** Pasa `to` para un link normal, o `onClick` para abrir un modal (ej. preferencias de cookies). */
  to?: string;
  onClick?: () => void;
}

interface FooterContactItem {
  /** Texto visible (dirección, correo, teléfono). */
  label: ReactNode;
  /** Enlace opcional (`mailto:`, `tel:`, `https://wa.me/...`). */
  href?: string;
  icon?: ReactNode;
}

export interface PublicFooterLabels {
  legal: string;
  social: string;
  contact: string;
  /** Texto tras el titular del copyright. */
  rightsReserved: string;
}

const defaultLabels: PublicFooterLabels = {
  legal: "Legal",
  social: "Síguenos",
  contact: "Contacto",
  rightsReserved: "Todos los derechos reservados.",
};

export interface PublicFooterProps {
  logoSrc: string;
  brandName: string;
  /** Una línea describiendo el producto/audiencia. */
  description: string;
  /** Columnas de links de producto (ej. "Soluciones"). Opcional. */
  columns?: FooterColumn[];
  /** Links legales (Términos, Privacidad, Cookies...). Opcional. */
  legalLinks?: FooterLegalLink[];
  socialLinks?: SocialLink[];
  /** Texto de crédito al final (ej. "Desarrollado por..."). Opcional, acepta nodos con link. */
  credit?: ReactNode;
  copyrightHolder?: string;
  /** Ubicación y medios de contacto, en su propia columna. */
  contact?: FooterContactItem[];
  /** Versión de la aplicación (ej. `corelink@0.1.436`), en letra monoespaciada al pie. */
  version?: ReactNode;
  /**
   * Año del copyright. Pásalo fijo al prerenderizar: si no, el HTML del
   * servidor queda con el año del build.
   * @default el año actual
   */
  year?: number;
  /** Textos fijos, para publicar el footer en otros idiomas. */
  labels?: Partial<PublicFooterLabels>;
  linkComponent?: LinkComponent;
  className?: string;
}

const DefaultLink: LinkComponent = ({ to, children, ...rest }) => (
  <a href={to} {...rest}>
    {children}
  </a>
);

/**
 * Footer público de 4 columnas: marca+descripción, columnas de producto,
 * legal y redes sociales. Todas las secciones son opcionales para poder
 * usarse también en versiones simplificadas (una sola fila).
 */
export const PublicFooter = ({
  logoSrc,
  brandName,
  description,
  columns = [],
  legalLinks = [],
  socialLinks = [],
  credit,
  copyrightHolder,
  contact = [],
  version,
  year = new Date().getFullYear(),
  labels: labelsProp,
  linkComponent: Link = DefaultLink,
  className,
}: PublicFooterProps) => {
  const hasLegal = legalLinks.length > 0;
  const hasSocial = socialLinks.length > 0;
  const labels = { ...defaultLabels, ...labelsProp };

  return (
    <footer className={cn("bg-muted/30 py-12", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img src={logoSrc} alt={brandName} className="h-8 w-auto" />
              <span className="text-lg font-bold">{brandName}</span>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold">{column.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hasLegal && (
            <div>
              <h3 className="mb-4 font-semibold">{labels.legal}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {legalLinks.map((link) =>
                  link.onClick ? (
                    <li key={link.label}>
                      <button type="button" onClick={link.onClick} className="transition-colors hover:text-primary">
                        {link.label}
                      </button>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link to={link.to ?? "#"} className="transition-colors hover:text-primary">
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {contact.length > 0 && (
            <div>
              <h3 className="mb-4 font-semibold">{labels.contact}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {contact.map((item, index) => {
                  const content = (
                    <>
                      {item.icon && <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden="true">{item.icon}</span>}
                      <span>{item.label}</span>
                    </>
                  );
                  return (
                    <li key={index}>
                      {item.href ? (
                        <a href={item.href} className="flex gap-2 transition-colors hover:text-primary">
                          {content}
                        </a>
                      ) : (
                        <span className="flex gap-2">{content}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {hasSocial && (
            <div>
              <h3 className="mb-4 font-semibold">{labels.social}</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {year} {copyrightHolder ?? brandName}. {labels.rightsReserved}
          </p>
          {credit && <p className="mt-2">{credit}</p>}
          {version && <p className="mt-2 font-mono text-xs">{version}</p>}
        </div>
      </div>
    </footer>
  );
};
