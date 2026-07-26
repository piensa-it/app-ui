import * as React from "react";

export function assignForwardedRef<T>(ref: React.ForwardedRef<T>, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) ref.current = node;
}

export function useOverlayDismiss(
  open: boolean,
  enabled: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
  React.useEffect(() => {
    if (!open || !enabled) return;
    const handleOutside = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      onDismiss();
    };
    document.addEventListener("pointerdown", handleOutside, true);
    document.addEventListener("focusin", handleOutside, true);
    return () => {
      document.removeEventListener("pointerdown", handleOutside, true);
      document.removeEventListener("focusin", handleOutside, true);
    };
  }, [contentRef, enabled, onDismiss, open, triggerRef]);
}
