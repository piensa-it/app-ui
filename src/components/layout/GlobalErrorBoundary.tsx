import { Component, ErrorInfo, ReactNode } from "react";

export interface GlobalErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  /** Se ejecuta al hacer click en la acción. Por defecto navega a "/". */
  onAction?: () => void;
  /** Se ejecuta además de console.error — úsalo para enviar el error a tu servicio de logging (Sentry, Datadog, etc.). */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Muestra el mensaje técnico del error. Actívalo solo en dev/staging. */
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary genérico para envolver el árbol completo de la app y
 * evitar pantallas en blanco ante errores no controlados. Sin dependencias
 * de negocio: título, mensaje y acción son configurables por el consumidor.
 */
export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const {
        title = "Ups, algo salió mal",
        description = "Ha ocurrido un error inesperado. Nuestro equipo ya ha sido notificado.",
        actionLabel = "Volver al inicio",
        onAction,
        showErrorDetails = false,
      } = this.props;

      return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
          <div className="w-full max-w-md rounded-lg border border-destructive/20 bg-card p-6 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{description}</p>
            {showErrorDetails && this.state.error && (
              <div className="mb-6 overflow-x-auto rounded bg-muted p-3 text-left font-mono text-xs text-muted-foreground">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={onAction ?? (() => (window.location.href = "/"))}
              className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
