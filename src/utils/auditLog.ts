/**
 * Traducciones legibles para `audit_logs.accion` (P4-19). Cualquier acción
 * nueva que no esté en el mapa se muestra "humanizada" (guiones bajos →
 * espacios, primera letra mayúscula) en vez de romper o mostrar un id
 * críptico — así no hay que tocar este archivo cada vez que se agrega un
 * evento nuevo en otra parte del código.
 */
const ACTION_LABELS: Record<string, string> = {
  email_suggestion_created: "Sugerencia de transacción detectada por correo",
  email_suggestion_confirmed: "Sugerencia de correo confirmada como transacción",
  email_suggestion_rejected: "Sugerencia de correo descartada",
  // Transacciones (P4-19)
  transaction_created: "Transacción creada",
  transaction_updated: "Transacción editada",
  transaction_deleted: "Transacción eliminada",
  transfer_created: "Transferencia registrada",
  // Cuentas / medios de pago (P4-19)
  account_created: "Cuenta o medio de pago creado",
  account_updated: "Cuenta o medio de pago editado",
  account_deleted: "Cuenta o medio de pago eliminado",
  // Presupuestos (P4-19)
  budget_created: "Presupuesto creado",
  budget_updated: "Presupuesto editado",
  budget_deleted: "Presupuesto eliminado",
  // Establecimientos (P4-3)
  merchant_created: "Establecimiento creado",
  merchant_updated: "Establecimiento editado",
  merchant_deleted: "Establecimiento eliminado",
};

export function humanizeAuditAction(accion: string): string {
  if (ACTION_LABELS[accion]) return ACTION_LABELS[accion];
  const spaced = accion.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Formato relativo simple ("hace 3 horas") sin agregar date-fns como dependencia nueva. */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 60) return "hace un momento";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour} hora${diffHour === 1 ? "" : "s"}`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 30) return `hace ${diffDay} día${diffDay === 1 ? "" : "s"}`;

  return date.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
}
