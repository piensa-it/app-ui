import * as React from "react";
import { Toast as PrimeToast, type ToastMessageOptions } from "primereact/toast";

let toastRef: React.RefObject<PrimeToast> | null = null;

/**
 * `<Toaster />` se monta una única vez (ya incluido dentro de `UiProvider`,
 * no hace falta agregarlo manualmente). Habilita las notificaciones globales
 * vía el objeto `toast` exportado de este módulo — reemplaza a `sonner`.
 */
function Toaster() {
  const ref = React.useRef<PrimeToast>(null);
  toastRef = ref;
  return <PrimeToast ref={ref} position="bottom-right" />;
}

function show(options: ToastMessageOptions) {
  toastRef?.current?.show({ life: 4000, ...options });
}

/**
 * API de notificaciones globales, análoga a `sonner`.
 * @example toast.success({ summary: "Guardado", detail: "Los cambios se guardaron correctamente." })
 */
const toast = {
  success: (options: Omit<ToastMessageOptions, "severity">) => show({ severity: "success", ...options }),
  error: (options: Omit<ToastMessageOptions, "severity">) => show({ severity: "error", ...options }),
  warn: (options: Omit<ToastMessageOptions, "severity">) => show({ severity: "warn", ...options }),
  info: (options: Omit<ToastMessageOptions, "severity">) => show({ severity: "info", ...options }),
};

export { Toaster, toast };
