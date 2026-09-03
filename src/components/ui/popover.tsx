import * as React from "react";
import { Popover as ArkPopover } from "@ark-ui/react/popover";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { assignForwardedRef, useOverlayDismiss } from "@/lib/overlay-dismiss";

export type PopoverProps = ArkPopover.RootProps;

interface PopoverDismissContextValue {
  setTriggerRef: (node: HTMLButtonElement | null) => void;
  setContentRef: (node: HTMLDivElement | null) => void;
}

const PopoverDismissContext = React.createContext<PopoverDismissContextValue | null>(null);

/** Agrupa un `PopoverTrigger` y un `PopoverContent` sobre Ark UI (headless). */
const Popover = ({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const open = controlledOpen ?? internalOpen;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const dismissContext = {
    setTriggerRef: (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
    },
    setContentRef: (node: HTMLDivElement | null) => {
      contentRef.current = node;
    },
  };

  const dismiss = React.useCallback(() => setInternalOpen(false), []);
  useOverlayDismiss(open, controlledOpen === undefined, triggerRef, contentRef, dismiss);

  return (
    <PopoverDismissContext.Provider value={dismissContext}>
      <ArkPopover.Root
        open={open}
        onOpenChange={(details) => {
          if (controlledOpen === undefined) setInternalOpen(details.open);
          onOpenChange?.(details);
        }}
        {...props}
      >
        {children}
      </ArkPopover.Root>
    </PopoverDismissContext.Provider>
  );
};

export type PopoverTriggerProps = ArkPopover.TriggerProps;

/** Elemento que abre/cierra el popover al hacer click. */
const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>((props, ref) => {
  const dismiss = React.useContext(PopoverDismissContext);
  const assignRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      dismiss?.setTriggerRef(node);
      assignForwardedRef(ref, node);
    },
    [dismiss, ref],
  );
  return <ArkPopover.Trigger ref={assignRef} asChild {...props} />;
});
PopoverTrigger.displayName = "PopoverTrigger";

export type PopoverContentProps = ArkPopover.ContentProps;

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(({ className, ...props }, ref) => {
  const dismiss = React.useContext(PopoverDismissContext);
  const assignRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      dismiss?.setContentRef(node);
      assignForwardedRef(ref, node);
    },
    [dismiss, ref],
  );
  return (
    <ArkPopover.Positioner>
      <ArkPopover.Content
        ref={assignRef}
        className={cn(
          "z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-surface-border bg-raised p-4 text-popover-foreground shadow-md outline-none",
          elevationRing,
          popoverAnimation,
          className,
        )}
        {...props}
      />
    </ArkPopover.Positioner>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };
