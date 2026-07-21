import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '1rem' }}>
          <div style={{ maxWidth: '28rem', width: '100%', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #fee2e2', padding: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
              Ups, algo salió mal
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Ha ocurrido un error inesperado. Nuestro equipo ya ha sido notificado.
            </p>
            {this.state.error && (
              <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem', textAlign: 'left', marginBottom: '1.5rem', overflowX: 'auto', fontSize: '0.75rem', color: '#4b5563', fontFamily: 'monospace' }}>
                {this.state.error.message}
              </div>
            )}
            <button 
              onClick={() => window.location.href = "/"}
              style={{ width: '100%', padding: '0.5rem 1rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
