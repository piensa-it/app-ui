import * as React from "react";
import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { backdropAnimation, dialogContentAnimation, elevationRing, overlayBackdrop } from "@/lib/style-helpers";

export interface DialogProps extends Omit<ArkDialog.RootProps, "open" | "onOpenChange"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  ({ open, onOpenChange, className, children, hideCloseButton = false, modal = true, ...props }, ref) => (
    <ArkDialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      modal={modal}
      lazyMount
      unmountOnExit
      {...props}
    >
      <Portal>
        <ArkDialog.Backdrop className={cn("fixed inset-0 z-50", overlayBackdrop, backdropAnimation)} />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <ArkDialog.Content
            ref={ref}
            className={cn(
              "relative max-h-[calc(100dvh-1rem)] w-full overflow-y-auto rounded-t-xl border border-surface-border bg-background p-5 shadow-lg outline-none sm:max-w-lg sm:rounded-xl sm:p-6",
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
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
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
