import { ReactNode } from "react";

export interface LayoutProps {
  children: ReactNode;
  /** Contenido del lado izquierdo del header (logo + nombre del producto). Normalmente un <Link>. */
  brand: ReactNode;
  /** Acciones del lado derecho del header (menú de usuario, CTA, selector de idioma...). */
  headerActions?: ReactNode;
  /** Contenido del footer. Si se omite, no se renderiza footer. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Layout base de aplicación: header sticky + contenido + footer opcional.
 * Agnóstico de marca — cada producto pasa su propio logo/nombre vía `brand`
 * y sus acciones vía `headerActions`. Usa los tokens de Tailwind del design
 * system (bg-background, border-border, etc.), así que respeta el theming
 * por CSS variables de cada consumidor.
 */
export const Layout = ({ children, brand, headerActions, footer, className }: LayoutProps) => {
  return (
    <div className={`flex min-h-screen w-full bg-ground ${className ?? ""}`}>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-surface">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">{brand}</div>
            <div className="flex items-center gap-2">{headerActions}</div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>

        {footer && (
          <footer className="border-t border-border bg-surface py-4">
            <div className="text-center text-sm text-muted-foreground">{footer}</div>
          </footer>
        )}
      </div>
    </div>
  );
};
