import { supabase } from "@/integrations/supabase/client";

/**
 * Registra un evento en `audit_logs` (P4-19). Es "best-effort": si el insert
 * falla NO se propaga el error para no romper la operación principal del
 * usuario (crear/editar/eliminar) — la auditoría es secundaria a que la
 * acción funcione. El fallo se registra en consola para no perderlo del todo.
 *
 * `user_id` se resuelve solo si no se pasa, para ahorrar un getUser() extra
 * cuando el llamador ya lo tiene a mano.
 */
export async function logAudit(params: {
  accion: string;
  entidad: string;
  entidadId?: string | null;
  detalle?: Record<string, unknown> | null;
  userId?: string;
}): Promise<void> {
  try {
    let userId = params.userId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;
    }

    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      accion: params.accion,
      entidad: params.entidad,
      entidad_id: params.entidadId ?? null,
      detalle: params.detalle ?? null,
    });
    if (error) throw error;
  } catch (err) {
    // No relanzamos: la auditoría no debe tumbar la mutación principal.
    console.warn("[audit] no se pudo registrar el evento", params.accion, err);
  }
}
