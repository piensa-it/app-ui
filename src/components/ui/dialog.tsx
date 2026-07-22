import * as React from "react";
import { Dialog as PrimeDialog, type DialogProps as PrimeDialogProps } from "primereact/dialog";

import { cn } from "@/lib/utils";
import { dialogTransition } from "@/lib/overlay-transitions";

export interface DialogProps extends Omit<PrimeDialogProps, "visible" | "onHide" | "header" | "footer"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal sobre PrimeReact Dialog, con API declarativa (`open`/`onOpenChange`)
 * y composición por hijos (`DialogHeader`, `DialogTitle`, `DialogFooter`...),
 * consistente con el resto de la librería.
 */
const Dialog = React.forwardRef<PrimeDialog, DialogProps>(
  ({ open, onOpenChange, className, children, modal = true, dismissableMask = true, ...props }, ref) => (
    <PrimeDialog
      ref={ref}
      visible={open}
      onHide={() => onOpenChange(false)}
      modal={modal}
      dismissableMask={dismissableMask}
      className={cn(className)}
      transitionOptions={dialogTransition}
      {...props}
    >
      {children}
    </PrimeDialog>
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

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("font-heading text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
DialogDescription.displayName = "DialogDescription";

export { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
