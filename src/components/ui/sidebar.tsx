import * as React from "react";
import { Drawer as ArkDrawer } from "@ark-ui/react/drawer";
import { Portal } from "@ark-ui/react/portal";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { backdropAnimation, drawerContentAnimation, elevationRing } from "@/lib/style-helpers";

export interface SheetProps extends Omit<ArkDrawer.RootProps, "open" | "onOpenChange"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Borde desde el que aparece el panel. @default "right" */
  position?: "left" | "right" | "top" | "bottom";
  className?: string;
}

const SIZE_BY_POSITION: Record<NonNullable<SheetProps["position"]>, string> = {
  left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

// Ark UI usa direcciones lógicas ("start"/"end", conscientes de RTL) en vez
// de "left"/"right" para el prop `swipeDirection` del Drawer.
const SWIPE_DIRECTION_BY_POSITION: Record<NonNullable<SheetProps["position"]>, "up" | "down" | "start" | "end"> = {
  left: "start",
  right: "end",
  top: "up",
  bottom: "down",
};

/**
 * Panel deslizante lateral sobre Ark UI Drawer (headless). A diferencia del
 * uso típico de `Drawer` (bottom sheet arrastrable en móvil), aquí se usa
 * como panel lateral clásico: `draggable={false}` deshabilita el gesto de
 * swipe-to-dismiss, dejando solo apertura/cierre programático vía
 * `open`/`onOpenChange`, igual que el resto de overlays de la librería.
 */
const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ open, onOpenChange, className, children, position = "right", modal = true, ...props }, ref) => (
    <ArkDrawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      swipeDirection={SWIPE_DIRECTION_BY_POSITION[position]}
      modal={modal}
      lazyMount
      unmountOnExit
      {...props}
    >
      <Portal>
        <ArkDrawer.Backdrop className={cn("fixed inset-0 z-50 bg-black/50", backdropAnimation)} />
        <ArkDrawer.Positioner className="fixed inset-0 z-50">
          <ArkDrawer.Content
            ref={ref}
            draggable={false}
            className={cn(
              "fixed flex flex-col gap-4 border-border bg-background p-6 shadow-lg outline-none",
              position === "left" && "border-r",
              position === "right" && "border-l",
              position === "top" && "border-b",
              position === "bottom" && "border-t",
              SIZE_BY_POSITION[position],
              elevationRing,
              drawerContentAnimation(position),
              className,
            )}
          >
            {children}
            <ArkDrawer.CloseTrigger
              className={cn(
                "absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity",
                "hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              )}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </ArkDrawer.CloseTrigger>
          </ArkDrawer.Content>
        </ArkDrawer.Positioner>
      </Portal>
    </ArkDrawer.Root>
  ),
);
Sheet.displayName = "Sheet";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <ArkDrawer.Title
      ref={ref}
      className={cn("font-heading text-lg font-semibold text-foreground", className)}
      {...props}
    />
  ),
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <ArkDrawer.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
SheetDescription.displayName = "SheetDescription";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
