import * as React from "react";
import { Drawer as ArkDrawer } from "@ark-ui/react/drawer";
import { Portal } from "@ark-ui/react/portal";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  backdropAnimation,
  drawerContentAnimation,
  elevationRing,
  overlayBackdrop,
} from "@/lib/style-helpers";

/** Atributos HTML que llegan al panel (`role="dialog"`), no al Root de Ark. */
type SheetPanelAttributes = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "id" | "role" | "dir" | "draggable" | keyof ArkDrawer.RootProps
>;

export interface SheetProps
  extends
    Omit<ArkDrawer.RootProps, "open" | "onOpenChange">,
    SheetPanelAttributes {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Borde desde el que aparece el panel. @default "right" */
  position?: "left" | "right" | "top" | "bottom";
  /** Clases del panel (`role="dialog"`). El resto de atributos HTML (`style`, `data-*`…) también van al panel. */
  className?: string;
}

/**
 * Props que gobiernan el Drawer de Ark (máquina + presencia). Todo lo que no
 * esté aquí se aplica al panel: `style={{ "--ancho": … }}`, `data-mobile`,
 * `aria-describedby`… Lista tomada de `@zag-js/drawer` (`props`) y de
 * `UsePresenceProps` de Ark.
 */
const ROOT_PROP_KEYS = new Set<string>([
  "defaultTriggerValue",
  "id",
  "ids",
  "dir",
  "modal",
  "initialFocusEl",
  "finalFocusEl",
  "open",
  "defaultOpen",
  "getRootNode",
  "snapPoints",
  "swipeDirection",
  "snapToSequentialPoints",
  "swipeVelocityThreshold",
  "closeThreshold",
  "preventDragOnScroll",
  "closeOnEscape",
  "closeOnInteractOutside",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onTriggerValueChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus",
  "defaultSnapPoint",
  "snapPoint",
  "onSnapPointChange",
  "triggerValue",
  // UsePresenceProps
  "present",
  "lazyMount",
  "unmountOnExit",
  "immediate",
  "skipAnimationOnMount",
  "onExitComplete",
]);

function splitSheetProps(props: Record<string, unknown>) {
  const root: Record<string, unknown> = {};
  const content: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    (ROOT_PROP_KEYS.has(key) ? root : content)[key] = value;
  }
  return [
    root as ArkDrawer.RootProps,
    content as SheetPanelAttributes,
  ] as const;
}

const SIZE_BY_POSITION: Record<NonNullable<SheetProps["position"]>, string> = {
  left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
  right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
  top: "inset-x-0 top-0 w-full",
  bottom: "inset-x-0 bottom-0 w-full",
};

// Ark UI usa direcciones lógicas ("start"/"end", conscientes de RTL) en vez
// de "left"/"right" para el prop `swipeDirection` del Drawer.
const SWIPE_DIRECTION_BY_POSITION: Record<
  NonNullable<SheetProps["position"]>,
  "up" | "down" | "start" | "end"
> = {
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
  (
    {
      open,
      onOpenChange,
      className,
      children,
      position = "right",
      modal = true,
      onRequestDismiss,
      onFocusOutside,
      ...props
    },
    ref,
  ) => {
    const [rootProps, contentProps] = splitSheetProps(props);
    return (
      <ArkDrawer.Root
        open={open}
        onOpenChange={(details) => onOpenChange(details.open)}
        swipeDirection={SWIPE_DIRECTION_BY_POSITION[position]}
        modal={modal}
        lazyMount
        unmountOnExit
        // Mismo veto que en Dialog: ni la cascada de Zag al retirar una capa
        // inferior ni el foco que devuelve otra capa al cerrarse son una
        // intención de cerrar este panel; el estado `open` lo gobierna la app.
        onRequestDismiss={(event) => {
          onRequestDismiss?.(event);
          event.preventDefault();
        }}
        onFocusOutside={(event) => {
          onFocusOutside?.(event);
          event.preventDefault();
        }}
        {...rootProps}
      >
        <Portal>
          <ArkDrawer.Backdrop
            className={cn(
              "fixed inset-0 z-50",
              overlayBackdrop,
              backdropAnimation,
            )}
          />
          <ArkDrawer.Positioner className="fixed inset-0 z-50">
            <ArkDrawer.Content
              ref={ref}
              draggable={false}
              {...contentProps}
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
    );
  },
);
Sheet.displayName = "Sheet";

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-left", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <ArkDrawer.Title
    ref={ref}
    className={cn(
      "font-heading text-lg font-semibold text-foreground",
      className,
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <ArkDrawer.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
