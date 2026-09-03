import type { ComponentType } from "react";
import { Toast as ArkToast, Toaster as ArkToaster, createToaster } from "@ark-ui/react/toast";
import { CheckCircle2, X, XCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { cx, elevationRing } from "@/lib/style-helpers";

const toaster = createToaster({ placement: "bottom-end", gap: 12, overlap: false });

const ICON_BY_TYPE: Record<string, ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

/**
 * `<Toaster />` se monta una única vez (ya incluido dentro de `UiProvider`,
 * no hace falta agregarlo manualmente). Habilita las notificaciones globales
 * vía el objeto `toast` exportado de este módulo, análogo a `sonner` —
 * reemplaza al `Toaster` sobre PrimeReact Toast.
 */
function Toaster() {
  return (
    <ArkToaster toaster={toaster} className="fixed z-[100] flex flex-col gap-2 outline-none">
      {(toast: ArkToast.Options) => {
        const Icon = ICON_BY_TYPE[toast.type ?? "info"];
        return (
          <ArkToast.Root
            key={toast.id}
            className={cn(
              "flex w-80 items-start gap-3 rounded-md border border-border bg-raised p-4 text-sm shadow-lg",
              elevationRing,
              cx(
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-bottom-2",
              ),
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  toast.type === "success" && "text-success",
                  toast.type === "error" && "text-destructive",
                  toast.type === "warning" && "text-warning",
                  toast.type === "info" && "text-primary",
                  toast.type === "loading" && "animate-spin text-muted-foreground",
                )}
              />
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {toast.title ? (
                <ArkToast.Title className="font-medium leading-none">{toast.title}</ArkToast.Title>
              ) : null}
              {toast.description ? (
                <ArkToast.Description className="text-muted-foreground">{toast.description}</ArkToast.Description>
              ) : null}
            </div>
            {toast.closable !== false ? (
              <ArkToast.CloseTrigger
                aria-label="Cerrar notificación"
                className={cn(
                  "shrink-0 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
              >
                <X className="h-4 w-4" />
              </ArkToast.CloseTrigger>
            ) : null}
          </ArkToast.Root>
        );
      }}
    </ArkToaster>
  );
}

/** Duración por defecto de cada notificación, alineada con sonner. */
export const TOAST_DEFAULT_DURATION = 4000;

export interface ToastOptions {
  summary?: string;
  detail?: string;
  /**
   * Milisegundos en pantalla. @default 4000 (igual para success, error, warn e
   * info; Zag traía 2 s para success y 5 s para el resto, y los toasts largos
   * se acumulan y colisionan con consultas por nombre no exactas en e2e).
   */
  duration?: number;
  closable?: boolean;
}

function toOptions({ summary, detail, duration = TOAST_DEFAULT_DURATION, ...rest }: ToastOptions) {
  return { title: summary, description: detail, duration, ...rest };
}

/**
 * API de notificaciones globales, análoga a `sonner`.
 * @example toast.success({ summary: "Guardado", detail: "Los cambios se guardaron correctamente." })
 */
const toast = {
  success: (options: ToastOptions) => toaster.success(toOptions(options)),
  error: (options: ToastOptions) => toaster.error(toOptions(options)),
  warn: (options: ToastOptions) => toaster.warning(toOptions(options)),
  info: (options: ToastOptions) => toaster.info(toOptions(options)),
};

export { Toaster, toast };
