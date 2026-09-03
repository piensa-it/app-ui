import * as React from "react";
import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { backdropAnimation, dialogContentAnimation, elevationRing, overlayBackdrop } from "@/lib/style-helpers";

export interface DialogProps extends Omit<ArkDialog.RootProps, "open" | "onOpenChange"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Elementos externos que no cuentan como «fuera» del diálogo. Solo sirve
   * para capas que YA existen al abrir: Zag las espera un segundo y, si la
   * función sigue devolviendo `null`, rechaza la promesa (error en consola en
   * cada apertura). Para poppers de terceros que se montan después (un
   * DropdownMenu de Radix, un datepicker externo) veta en `onInteractOutside`
   * cuando `event.detail.target` está dentro de esa capa:
   *
   * ```tsx
   * <Dialog onInteractOutside={(e) => {
   *   if ((e.detail.target as Element).closest("[data-radix-popper-content-wrapper]")) e.preventDefault();
   * }} />
   * ```
   */
  persistentElements?: ArkDialog.RootProps["persistentElements"];
  /** Oculta el botón de cierre (X) en la esquina superior derecha. @default false */
  hideCloseButton?: boolean;
  className?: string;
}

/**
 * Modal sobre Ark UI (headless), con API declarativa (`open`/`onOpenChange`)
 * y composición por hijos (`DialogHeader`, `DialogTitle`, `DialogFooter`...),
 * consistente con el resto de la librería.
 */
const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    { open, onOpenChange, className, children, hideCloseButton = false, modal = true, onRequestDismiss, onFocusOutside, ...props },
    ref,
  ) => (
    <ArkDialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      modal={modal}
      lazyMount
      unmountOnExit
      // Zag cierra en cascada las capas abiertas ENCIMA de una que se retira
      // (`layer:request-dismiss`) y trata como «fuera» el foco que otra capa
      // devuelve al cerrarse. El estado `open` lo gobierna la app: un diálogo
      // abierto justo cuando su origen termina de cerrarse no debe desaparecer.
      // Se llama al handler del consumidor y luego se veta.
      onRequestDismiss={(event) => {
        onRequestDismiss?.(event);
        event.preventDefault();
      }}
      onFocusOutside={(event) => {
        onFocusOutside?.(event);
        event.preventDefault();
      }}
      {...props}
    >
      <Portal>
        <ArkDialog.Backdrop className={cn("fixed inset-0 z-50", overlayBackdrop, backdropAnimation)} />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-md">
          <ArkDialog.Content
            ref={ref}
            className={cn(
              "relative max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-xl border border-surface-border bg-raised p-inset shadow-lg outline-none sm:max-w-lg sm:rounded-xl",
              elevationRing,
              dialogContentAnimation,
              className,
            )}
          >
            {children}
            {hideCloseButton ? null : (
              <ArkDialog.CloseTrigger
                className={cn(
                  "absolute right-3 top-3 inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors sm:right-4 sm:top-4",
                  "hover:bg-surface-hover hover:text-foreground",
                  "hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                <X aria-hidden="true" className="size-5" />
                <span className="sr-only">Cerrar</span>
              </ArkDialog.CloseTrigger>
            )}
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  ),
);
Dialog.displayName = "Dialog";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2xs text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-md flex flex-col-reverse gap-xs sm:flex-row sm:justify-end", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <ArkDialog.Title
      ref={ref}
      className={cn("font-heading text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <ArkDialog.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
