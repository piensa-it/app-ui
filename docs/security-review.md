# Revisión de seguridad — 2026-07-17

Rama: `feat/personal-finance-platform`

## Hallazgos y estado

### Críticos

1. **Webhook de correos sin autenticación** (`process-email-transaction`, `verify_jwt=false`).
   - Riesgo: cualquiera que conociera la URL podía inyectar correos y (en la versión anterior) crear transacciones directamente con service role.
   - **Corregido**: header `x-webhook-secret` contra `EMAIL_WEBHOOK_SECRET`; el endpoint ya no crea transacciones (solo sugerencias que el usuario confirma); reprocesos exigen JWT del dueño.
   - **Acción requerida (propietario)**: configurar `EMAIL_WEBHOOK_SECRET` en Supabase y SendGrid. Hasta entonces el webhook acepta tráfico con una advertencia en logs (periodo de gracia para no romper el flujo actual). Se recomienda además rotar la dirección/URL del inbound parse.

2. **Auto-verificación de correos desde el webhook** (versión anterior).
   - Riesgo: el header `From` de un correo es falsificable → un atacante podía verificar direcciones ajenas y alimentar movimientos.
   - **Corregido**: eliminada la auto-verificación; solo direcciones ya registradas alimentan sugerencias y nada entra sin confirmación del usuario.

3. **Logs con datos sensibles** (headers completos, cuerpos de correos, datos de transacciones).
   - **Corregido**: la función registra solo ids, estados y confianza.

### Medios

4. **Doble conteo financiero en traslados/pagos de tarjeta** (integridad de datos): se registraban como gasto+ingreso. **Corregido** con tipo `transferencia` + RPC atómico. Los registros históricos con categoría "Traslado"/"Pago tarjeta" permanecen y pueden migrarse (ver work-summary).
5. **Sin Error Boundary** — cualquier excepción dejaba la app en blanco. **Corregido** (`ErrorBoundary` global; en producción no muestra stack).
6. **Carga sin límite de transacciones** — DoS accidental del propio cliente. **Mitigado** con tope de 5.000 filas; paginación real documentada como pendiente.

### Verificados sin hallazgos

- **RLS**: todas las tablas nuevas (`budgets`, `recurring_transactions`, `audit_logs`) tienen RLS con `auth.uid() = user_id`; la vista `account_balances` usa `security_invoker`; `create_transfer` es `SECURITY INVOKER` (RLS aplica) y valida propiedad de ambas cuentas.
- **Aislamiento por usuario**: hooks filtran por `user_id` y RLS lo garantiza en el servidor; mutaciones incluyen `.eq("user_id", user.id)`.
- **Inyección SQL**: acceso vía supabase-js (parametrizado) y RPC con parámetros tipados; sin SQL concatenado.
- **XSS**: React escapa por defecto; el cuerpo de correos se muestra como texto (`<pre>{email.body_text}</pre>`), nunca como HTML (`body_html` no se renderiza).
- **Secretos**: `.env` solo contiene claves públicas (publishable); `.env` está fuera del repo (verificado en git); `.env.example` sin valores. Service role y API keys viven solo en secrets de Edge Functions.
- **CSRF**: no aplica al modelo token-bearer de Supabase (sin cookies de sesión).
- **Rate limiting**: existe `login_attempts` + `cleanup_old_login_attempts` para el flujo de auth personalizado.

### Pendientes (documentados, no bloqueantes)

- `auth-with-any-email` implementa login personalizado con `verify_jwt=false` (necesario por ser pre-auth). Merece una auditoría dedicada (manejo de OTP, expiraciones, enumeración de usuarios).
- CORS de las edge functions usa `*`; restringir al dominio de la app en producción.
- Dependencias: `npm audit` reporta vulnerabilidades moderadas en dependencias transitivas de tooling (no runtime). Actualización prudente pendiente.
- TS estricto desactivado: reduce la detección temprana de errores de null-safety.
- La política de `email_staging` permite a super_admins ver correos de todos los usuarios: revisar si ese alcance sigue siendo deseado ahora que cada usuario gestiona sus propias sugerencias.

## Adenda — 2026-07-19: grants por PUBLIC no revocados

Al validar la migración a la base "misfin" tras la carga masiva de datos, `get_advisors`
reportó que las 22 funciones que `20260719000100_security_hardening.sql` debía bloquear
para `anon`/`authenticated` seguían siendo ejecutables por `anon` vía `/rest/v1/rpc/...`.

**Causa**: el `REVOKE EXECUTE ... FROM anon, authenticated` no tiene efecto si el
privilegio real fue otorgado a `PUBLIC` (rol implícito del que todos heredan, incluido
`anon`) — que es el caso por defecto al crear una función en Postgres. Revocar de un rol
puntual no retira lo heredado de `PUBLIC`; hay que revocar de `PUBLIC` explícitamente.
Tres funciones adicionales (`calculate_user_level`, `set_updated_at`,
`update_updated_at_column`) tenían además un `GRANT` directo a `anon`/`authenticated`
(vía `ALTER DEFAULT PRIVILEGES` de Supabase), que tampoco se retira revocando de `PUBLIC`.

**Corregido** en `20260719160000_fix_public_grants.sql`: revoca de `PUBLIC`, `anon` y
`authenticated` explícitamente en las 17 funciones internas (solo deben dispararse por
trigger); revoca de `PUBLIC`/`anon` y vuelve a otorgar a `authenticated` en las 5
funciones que sí son RPC/RLS legítimas de cliente (`has_role`, `is_family_member`,
`is_family_owner`, `calculate_user_streak`, `create_transfer`). Verificado con
`has_function_privilege()` uno por uno tras aplicar: las 22 quedaron con el acceso
esperado. `get_advisors` ya no reporta el hallazgo para `anon`; las 5 funciones de
cliente siguen apareciendo en el advisor como "ejecutable por authenticated", lo cual es
intencional.

**Pendiente (no bloqueante)**: `auth_leaked_password_protection` — Supabase Auth tiene
desactivada la verificación contra HaveIBeenPwned. Es un toggle en Dashboard → Auth →
Policies (no es SQL), pendiente de que el propietario lo active.

## Adenda — 2026-07-19: cola de ingesta (pgmq/pg_cron) y `pg_net` en `public`

Al instalar `pgmq`/`pg_cron`/`pg_net` para la cola asíncrona de correos (ver
`docs/email-ingestion-design.md`), el advisor marcó `pg_net` instalado en el esquema
`public` (`extension_in_public`, WARN). Se intentó reubicar con
`alter extension pg_net set schema extensions` — Postgres lo rechaza:
`extension "pg_net" no soporta SET SCHEMA` (no es reubicable por diseño de la extensión).
Es una limitación conocida y común en proyectos Supabase que usan `pg_net`; se acepta
como advertencia informativa, no representa una vulnerabilidad explotable (no expone
tablas ni datos, solo agrega funciones de HTTP async al catálogo).

Los wrappers `email_queue_send/read/delete/archive` siguen el mismo patrón que el resto
de funciones internas: `SECURITY DEFINER`, revocados de `PUBLIC`/`anon`/`authenticated`,
otorgados solo a `service_role`. Verificado con `get_advisors`: no aparecen como
ejecutables por `anon` ni `authenticated`.

## Reglas operativas

- Nunca subir secretos al repositorio; usar variables de entorno/secrets.
- No registrar tokens, contraseñas, cuerpos de correos ni montos en logs de funciones.
- Migraciones solo aditivas; aplicar en producción con respaldo previo.
