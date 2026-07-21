# Diseño — Ingesta de movimientos desde correo electrónico

## Objetivo

Alimentar automáticamente los movimientos financieros a partir de notificaciones de bancos, tarjetas, billeteras y comercios, con confirmación del usuario, deduplicación idempotente y sin registrar nada silenciosamente cuando la información es dudosa.

## Flujo end-to-end

Desde 2026-07-19 la ingesta es **asíncrona**: el webhook solo valida y encola;
un consumidor separado hace la extracción. Esto evita que un pico de correos
(varias compras seguidas) golpee la base y la API de Anthropic dentro de la
misma petición del webhook — ver "Cola asíncrona" más abajo.

```
Correo del banco ─► usuario lo reenvía a trx@misfin.co
                          │
              SendGrid Inbound Parse (webhook)
                          │  header x-webhook-secret
                          ▼
        Edge Function process-email-transaction (flujo A)
          1. Autenticación (secreto webhook)
          2. Identificación del usuario (user_emails registrados)
          3. Persistencia en email_staging (status=pending)
          4. Encola {stagedEmailId} en pgmq (email_queue_send) y responde
                          │
                          │   pg_cron dispara cada minuto
                          ▼
        Edge Function process-email-queue (consumidor)
          1. Autenticación por secreto compartido (x-cron-secret, Vault)
          2. Lee lote de la cola (email_queue_read, lote de 10)
          3. Parsers deterministas (por entidad → genérico)
          4. Fallback IA (opcional, confianza 0.6)
          5. Dedup por hash (índice único user_id+dedup_hash)
          6. Sugerencia: status=pending_confirmation + extraction
          7. Auditoría en audit_logs; borra el mensaje de la cola
                          │
                          ▼
        UI "Correos y sugerencias" (/email-staging)
          Confirmar │ Corregir │ Descartar   (decisión del usuario)
          "Reprocesar" (flujo B, síncrono, mismo pipeline vía JWT)
                          │
                          ▼
        transactions (source='email') + status=confirmed
```

La lógica de extracción (pasos 3-7 del consumidor) vive en un solo lugar,
`_shared/email-processing/processStagedEmail.ts`, y la reutilizan tanto el
consumidor de la cola como el reproceso manual desde la UI (que sí necesita
respuesta inmediata, por eso no pasa por la cola).

## Cola asíncrona (pgmq + pg_cron)

- **Cola**: `email_ingestion`, creada con la extensión `pgmq` (mensajería
  ligera sobre Postgres, sin infraestructura nueva que mantener).
- **Wrappers en `public`**: `email_queue_send/read/delete/archive`,
  `SECURITY DEFINER`, ejecutables **solo por `service_role`** (revocados de
  `PUBLIC`, `anon` y `authenticated` — mismo criterio que el resto de
  funciones internas, ver `docs/security-review.md`).
- **Disparo**: job `process-email-queue-tick` de `pg_cron`, cada minuto,
  llama por HTTP (`pg_net`) al consumidor con el secreto guardado en
  Supabase Vault (`cron_process_email_queue_secret`) — nunca en texto plano
  en el repo ni en la migración.
- **Reintentos**: `pgmq` usa visibilidad (`vt`, 90s): si el consumidor falla
  procesando un mensaje, no lo borra y el mensaje vuelve a estar disponible
  tras expirar la visibilidad. Tras 5 intentos (`read_ct >= 5`) se archiva y
  el correo queda `status=error` para no reintentar indefinidamente.
- **Carrera con "Reprocesar"**: si el usuario reprocesa manualmente un correo
  mientras sigue en la cola, el consumidor detecta que `status` ya no es
  `pending` y borra el mensaje sin reprocesar.
- Migración: `supabase/migrations/20260719170000_email_ingestion_queue.sql`.

## Contrato de parsers

`supabase/functions/_shared/email-parsing/` — TypeScript puro (sin APIs de Deno ni de navegador), usado por la edge function y testeado con Vitest.

```ts
interface EmailParser {
  id: string;                                // p. ej. "bancolombia-v1"
  canParse(email: EmailInput): boolean;      // ¿aplica? (remitente/asunto)
  parse(email: EmailInput): ParseResult;     // extracción + confianza 0..1
}
```

- `PARSERS` es un registro ordenado: específicos primero, `generic-v1` siempre de último. **Agregar un banco nuevo = agregar un archivo** en `parsers/` y registrarlo; nada más cambia.
- `ExtractedTransaction` captura: tipo, valor, moneda, fecha, descripción, comercio, entidad, últimos 4 dígitos del producto, referencia y categoría sugerida.
- Normalización compartida (`normalize.ts`): HTML→texto, montos regionales (`$1.234.567,89` / `$1,234,567.89`), fechas en español, últimos 4 dígitos.

## Confianza

- Parser específico: base 0.9, degradado si faltan fecha/comercio.
- Fallback IA: 0.6 fijo. Genérico: ~0.55–0.6.
- `CONFIDENCE_THRESHOLD = 0.75`: por encima, la sugerencia llega completa y lista para confirmar; por debajo se marca `needsReview` (la UI muestra "Revisar datos").
- **Nunca se auto-confirma en v1**: toda transacción requiere acción del usuario. Es la salvaguarda contra falsos positivos.

## Deduplicación

`computeDedupHash` (FNV-1a 64 bits) prioriza identificadores fuertes:

1. `Message-ID` externo del correo, si existe.
2. Remitente + referencia de la transacción.
3. Heurística: remitente + valor + fecha + comercio.

El índice único parcial `(user_id, dedup_hash)` en `email_staging` hace el reprocesamiento idempotente a nivel de BD: el duplicado se marca `status=duplicate` apuntando al original y no genera sugerencia.

## Estados (`email_staging.status`)

| Estado | Significado |
|---|---|
| `pending` | Recibido, aún sin procesar |
| `pending_confirmation` | Sugerencia lista; espera al usuario |
| `confirmed` | Usuario confirmó; `transaction_id` enlazado |
| `ignored` | Sin contenido financiero o descartado por el usuario |
| `duplicate` | Duplicado de otro correo |
| `error` | Falló el procesamiento (`processing_error`) |

## Seguridad

- Webhook autenticado con `EMAIL_WEBHOOK_SECRET` (header `x-webhook-secret`); sin la variable solo se registra advertencia (periodo de gracia — configurarla es obligatorio antes de producción).
- Reprocesos desde la UI validan el JWT del usuario y su propiedad del correo (o rol super_admin).
- El header `From` es falsificable: solo direcciones registradas en `user_emails` alimentan sugerencias, se eliminó la auto-verificación de correos, y nada se registra sin confirmación humana.
- Logs sin contenido del correo ni datos personales (solo ids, estados y confianza).
- RLS: cada usuario ve únicamente sus correos y sugerencias.

## Datos almacenados por correo

Usuario propietario, proveedor, id externo del mensaje, remitente, asunto, cuerpo (para revisión del usuario), fecha, estado, resultado de extracción (jsonb), confianza, error, hash de deduplicación y transacción generada.

## Pendiente para activar el flujo real

1. Configurar `EMAIL_WEBHOOK_SECRET` en Supabase y el header en SendGrid (rotar la URL actual).
2. Decisión de producto: ¿conexión OAuth por usuario (Gmail/Outlook) además del reenvío? La arquitectura lo soporta: un conector nuevo solo debe construir `EmailInput` y llamar el mismo pipeline.
3. Asociación automática a la tarjeta por últimos 4 dígitos (hoy la extracción los captura y la UI los muestra; falta un campo `ultimos_4` en `payment_methods` para el match automático).
4. Parsers adicionales por entidad (Davivienda, Nequi, BBVA, …) siguiendo el contrato.

## Propuesta: alerta cuando un correo no se puede leer (P2-7, sin construir aún)

2026-07-21 — pedido del propietario: cuando la lógica determinista (y el
fallback de IA) no logran identificar un movimiento, hoy el correo solo
queda en silencio como `email_staging.status = 'ignored'` con
`processing_error` — nadie se entera salvo que entre manualmente a
`/email-staging`. La idea es que esos casos generen una alerta para
revisarlos en detalle y, con eso, ir agregando palabras clave/parsers
nuevos de forma dirigida (no adivinando).

Punto de enganche en el código: `processStagedEmail.ts` línea 50-63, justo
donde hoy se marca `status: "ignored"` — ahí ya se tiene `email`, `outcome.reason`
y el `userId`, todo lo necesario para una alerta con contexto.

**Problema real a decidir, no solo técnico:** el estado `ignored` hoy mezcla
dos casos distintos que no se pueden separar todavía:
- (a) el correo *sí* es una notificación bancaria pero ningún parser ni la
  IA supieron leerla — este es el caso que vale la pena alertar, es la
  señal para ampliar la lógica.
- (b) el correo *no* es una notificación financiera (promocional, estado de
  cuenta mensual, etc.) — esto es esperado y alertar por cada uno sería
  ruido.

Antes de construir esto hace falta decidir canal y cómo evitar el ruido de
(b) — ver pregunta al usuario en el chat.

**2026-07-21, respuesta del propietario:** además de alertar sobre correos
no reconocidos, pide que los **extractos** (resúmenes mensuales de cuenta/
tarjeta) también se lean, no solo notificaciones de movimiento individual —
son "información de interés de la plataforma para concentrar los datos
financieros del usuario". Esto es un tipo de correo distinto al que
maneja hoy el pipeline: un extracto no es una transacción puntual (`valor`,
`fecha`, `establecimiento`), es un resumen agregado (saldo, cupo disponible,
fecha de corte/pago, total facturado). El contrato `EmailParser` actual
(`ExtractedTransaction`) no tiene forma de representar eso — necesitaría un
segundo tipo de resultado o una tabla nueva (`account_statements` o similar)
en vez de forzarlo dentro de `email_staging`/`transactions`. Queda anotado
como decisión de diseño pendiente (ver backlog P2-8), no se construye aún.
