import * as React from "react";

import { cn } from "@/lib/utils";

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** El logo de la aplicación, arriba del formulario. */
  brand?: React.ReactNode;
  /**
   * El panel de la derecha. Es un hueco, no una variante: recibe lo que sea,
   * y lo documentado es `ImageCarouselBackdrop`. Por debajo de `md`
   * desaparece —no se degrada a otra cosa— y el formulario ocupa el ancho.
   */
  aside?: React.ReactNode;
  /** Pie de la columna izquierda, normalmente un `PublicFooter` compacto. */
  footer?: React.ReactNode;
  /** El formulario: `LoginForm`, o el que la aplicación necesite. */
  children: React.ReactNode;
}

/**
 * La pantalla de entrada partida: marca, formulario y pie a la izquierda; el
 * panel de imagen a la derecha (#130).
 *
 * Es una **pantalla completa, no una ventana modal**, y esa es la decisión
 * de fondo: así la ruta es enlazable, el navegador autocompleta y ofrece
 * guardar la contraseña sin pelearse con una capa, el foco no queda
 * atrapado y el teclado de móvil no compite con un diálogo. El modal se
 * reserva para *volver* a entrar cuando la sesión caduca dentro de la
 * aplicación, que sí conserva la pantalla de detrás —y eso no estrena
 * componente: es un `LoginForm` dentro del `Dialog` que ya existe.
 *
 * No trae nada de autenticación: ni fetch, ni router, ni sesión.
 *
 * @example
 * ```tsx
 * <AuthLayout brand={<Logo />} aside={<ImageCarouselBackdrop images={fotos} />}>
 *   <LoginForm value={datos} onChange={setDatos} onSubmit={entrar} />
 * </AuthLayout>
 * ```
 */
export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ brand, aside, footer, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("grid min-h-screen bg-background text-foreground md:grid-cols-2", className)}
      {...props}
    >
      <div className="flex flex-col px-inset py-inset sm:px-ui-2xl">
        {brand ? <div className="shrink-0">{brand}</div> : null}
        {/* `flex-1` + centrado vertical: con poca altura el formulario se
            apoya arriba y la columna hace scroll, en vez de recortarse. */}
        <main className="flex flex-1 items-center justify-center py-inset">
          <div className="w-full max-w-sm">{children}</div>
        </main>
        {footer ? <div className="shrink-0">{footer}</div> : null}
      </div>
      {/* `aria-hidden` no: el panel puede llevar contenido con sentido (un
          lema, un enlace). Lo que hace en pantalla estrecha es no existir,
          que es distinto de existir escondido. */}
      {aside ? <div className="relative hidden overflow-hidden md:block">{aside}</div> : null}
    </div>
  ),
);
AuthLayout.displayName = "AuthLayout";
