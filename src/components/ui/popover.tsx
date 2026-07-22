import * as React from "react";
import { OverlayPanel, type OverlayPanelProps } from "primereact/overlaypanel";

import { cn } from "@/lib/utils";
import { overlayPanelTransition } from "@/lib/overlay-transitions";

interface PopoverContextValue {
  panelRef: React.RefObject<OverlayPanel>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

/** Agrupa un `PopoverTrigger` y un `PopoverContent` sobre PrimeReact OverlayPanel. */
function Popover({ children }: { children: React.ReactNode }) {
  const panelRef = React.useRef<OverlayPanel>(null);
  return <PopoverContext.Provider value={{ panelRef }}>{children}</PopoverContext.Provider>;
}

interface PopoverTriggerProps {
  children: React.ReactElement;
}

/** Elemento que abre/cierra el popover al hacer click. Espera un único hijo. */
function PopoverTrigger({ children }: PopoverTriggerProps) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("PopoverTrigger debe usarse dentro de un Popover.");
  return React.cloneElement(children, {
    onClick: (event: React.SyntheticEvent) => {
      children.props.onClick?.(event);
      ctx.panelRef.current?.toggle(event);
    },
  });
}

export type PopoverContentProps = Omit<OverlayPanelProps, "ref">;

const PopoverContent = React.forwardRef<OverlayPanel, PopoverContentProps>(
  ({ className, children, ...props }, forwardedRef) => {
    const ctx = React.useContext(PopoverContext);
    if (!ctx) throw new Error("PopoverContent debe usarse dentro de un Popover.");
    return (
      <OverlayPanel
        ref={(node) => {
          // @ts-expect-error -- RefObject es de solo lectura desde afuera, pero necesitamos escribirlo aquí.
          ctx.panelRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<OverlayPanel | null>).current = node;
        }}
        className={cn(className)}
        transitionOptions={overlayPanelTransition}
        {...props}
      >
        {children}
      </OverlayPanel>
    );
  },
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
