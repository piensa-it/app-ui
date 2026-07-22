import * as React from "react";
import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { backdropAnimation, dialogContentAnimation, elevationRing, overlayBackdrop } from "@/lib/style-helpers";

export interface ConfirmAlertOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

type AlertState = (ConfirmAlertOptions & { open: boolean }) | null;

/**
 * Store mínimo (pub-sub) para exponer `confirmAlert(...)` como API
 * imperativa global — Ark UI es headless y no trae, a diferencia de
 * PrimeReact `ConfirmDialog`, una cola de diálogos administrada
 * internamente, así que la implementamos nosotros sobre `Dialog`.
 */
let state: AlertState = null;
const listeners = new Set<() => void>();

function setState(next: AlertState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

/**
 * Abre un diálogo de confirmación modal (`role="alertdialog"`), con foco
 * inicial en el botón "más seguro" (cancelar) y sin cierre por click afuera,
 * según el patrón WAI-ARIA para alertdialog.
 * @example confirmAlert({ title: "¿Eliminar el registro?", variant: "destructive", onConfirm: () => remove(id) })
 */
function confirmAlert(options: ConfirmAlertOptions) {
  setState({ ...options, open: true });
}

/**
 * `<AlertDialogHost />` se monta una única vez (ya incluido dentro de
 * `UiProvider`, no hace falta agregarlo manualmente). Habilita
 * `confirmAlert(...)` en cualquier parte de la app.
 */
function AlertDialogHost() {
  const current = React.useSyncExternalStore(subscribe, getSnapshot);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const close = () => setState(current ? { ...current, open: false } : null);

  return (
    <ArkDialog.Root
      role="alertdialog"
      open={current?.open ?? false}
      onOpenChange={(details) => {
        if (!details.open) close();
      }}
      closeOnInteractOutside={false}
      initialFocusEl={() => cancelRef.current}
      lazyMount
      unmountOnExit
    >
      <Portal>
        <ArkDialog.Backdrop className={cn("fixed inset-0 z-50", overlayBackdrop, backdropAnimation)} />
        <ArkDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <ArkDialog.Content
            className={cn(
              "w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg outline-none",
              elevationRing,
              dialogContentAnimation,
            )}
          >
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <ArkDialog.Title className="font-heading text-lg font-semibold leading-none tracking-tight">
                {current?.title}
              </ArkDialog.Title>
              {current?.description ? (
                <ArkDialog.Description className="text-sm text-muted-foreground">
                  {current.description}
                </ArkDialog.Description>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ArkDialog.CloseTrigger asChild>
                <Button
                  ref={cancelRef}
                  variant="outline"
                  onClick={() => {
                    current?.onCancel?.();
                  }}
                >
                  {current?.cancelLabel ?? "Cancelar"}
                </Button>
              </ArkDialog.CloseTrigger>
              <Button
                variant={(current?.variant === "destructive" ? "destructive" : "default") as ButtonProps["variant"]}
                onClick={() => {
                  current?.onConfirm();
                  close();
                }}
              >
                {current?.confirmLabel ?? "Aceptar"}
              </Button>
            </div>
          </ArkDialog.Content>
        </ArkDialog.Positioner>
      </Portal>
    </ArkDialog.Root>
  );
}

export { AlertDialogHost, confirmAlert };
