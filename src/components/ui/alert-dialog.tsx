import { ConfirmDialog, confirmDialog, type ConfirmDialogProps } from "primereact/confirmdialog";

import { dialogTransition } from "@/lib/overlay-transitions";

/**
 * `<AlertDialogHost />` se monta una única vez (ya incluido dentro de
 * `UiProvider`, no hace falta agregarlo manualmente). Habilita
 * `confirmAlert(...)` en cualquier parte de la app — reemplaza al antiguo
 * `AlertDialog` declarativo basado en Radix.
 */
function AlertDialogHost(props: ConfirmDialogProps) {
  return <ConfirmDialog transitionOptions={dialogTransition} {...props} />;
}

export interface ConfirmAlertOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Abre un diálogo de confirmación modal.
 * @example confirmAlert({ title: "¿Eliminar el registro?", variant: "destructive", onConfirm: () => remove(id) })
 */
function confirmAlert({
  title,
  description,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmAlertOptions) {
  confirmDialog({
    header: title,
    message: description,
    acceptLabel: confirmLabel,
    rejectLabel: cancelLabel,
    acceptClassName: variant === "destructive" ? "bg-destructive text-destructive-foreground" : undefined,
    accept: onConfirm,
    reject: onCancel,
  });
}

export { AlertDialogHost, confirmAlert };
