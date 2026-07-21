# Diseño — Verificación de celular por OTP vía WhatsApp

**Estado:** Decidido (2026-07-21) — no implementado aún, requiere que el
propietario cree la cuenta del proveedor. Ver "Pendiente para activar" al
final.

## Decisión

**WhatsApp Business API en vez de SMS**, por dos razones:

1. **Costo**: en Colombia, un mensaje de autenticación por WhatsApp cuesta
   ≈ USD 0.0008, frente a ≈ USD 0.0525 por SMS (Twilio) — casi 66x más
   barato. Para 10.000 usuarios: ≈ USD 8-10 por WhatsApp vs. ≈ USD 525-650
   por SMS directo, o ≈ USD 1.000 si se usa Twilio Verify administrado.
2. **Flexibilidad para el usuario**: la mayoría de usuarios colombianos ya
   tienen WhatsApp activo y lo revisan más que los SMS; reduce fricción y
   mensajes que caen en spam/bloqueo del operador.

No se descarta SMS como *fallback* si el número no tiene WhatsApp — ver
"Fuera de alcance de la v1" más abajo.

## Contrato, reutilizando el patrón ya existente

El proyecto ya tiene un sistema de OTP (`send-otp`/`verify-otp` +
`email_verification_tokens`, usado hoy para correos secundarios vía
`UserEmailsManager.tsx`). La verificación de celular sigue el mismo
patrón, no uno nuevo:

```
Edge function send-phone-otp
  1. Recibe { celular } del usuario autenticado (JWT)
  2. Genera código de 6 dígitos, TTL 10 min
  3. Guarda hash del código en phone_verification_tokens (nueva tabla,
     mismo diseño que email_verification_tokens)
  4. Envía por WhatsApp Business API (plantilla de autenticación
     pre-aprobada por Meta — obligatorio, no se puede mandar texto libre
     para OTP)
  5. Rate limit: máx. 3 envíos por celular cada 15 min (mismo criterio que
     el rate limit de login en auth-with-any-email)

Edge function verify-phone-otp
  1. Recibe { celular, codigo }
  2. Compara hash, valida TTL y intentos (máx. 5 intentos por código)
  3. Si es válido: profiles.celular_verificado = true (columna nueva,
     ver migración pendiente), consume el token
  4. Auditoría en audit_logs (accion: 'phone_verified')
```

## Proveedor

Dos caminos, mismo contrato de edge function (solo cambia la llamada HTTP
de envío):

- **Twilio WhatsApp API**: mismo proveedor que ya se evaluó para SMS,
  simplemente se usa su canal de WhatsApp en vez del de SMS. Requiere
  registrar el número/plantilla de autenticación con Meta a través de
  Twilio (proceso de aprobación de plantilla, unos días).
- **Meta Cloud API directo** (sin intermediario): más barato aún, pero más
  configuración inicial (Meta Business Manager, verificación de negocio).

Recomendación: empezar con Twilio (ya se evaluó, un solo panel para SMS +
WhatsApp si algún día se necesita fallback) y migrar a Meta directo si el
volumen crece y el margen importa.

## Modelo de datos (migración pendiente, no aplicada)

```sql
ALTER TABLE public.profiles
  ADD COLUMN celular_verificado boolean NOT NULL DEFAULT false;

CREATE TABLE public.phone_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  celular varchar(20) NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- RLS: el usuario solo ve sus propios tokens; solo service_role escribe.
```

Cuando `celular` cambia en `ProfileDialog.tsx`, `celular_verificado` debe
volver a `false` (un número nuevo no está verificado hasta que se confirme)
— importante no olvidar esto en la implementación.

## Fuera de alcance de la v1

- Fallback a SMS si el número no tiene WhatsApp (agrega complejidad de
  detección; se evalúa si el volumen de fallos lo justifica).
- Usar el celular verificado como segundo factor de login (MFA) — eso es
  un cargo aparte de Supabase (Advanced MFA Phone, ~USD 75/mes) y un
  alcance distinto a "verificar que el dato de contacto es real".

## Pendiente para activar

1. El propietario crea/configura la cuenta de WhatsApp Business API
   (Twilio o Meta directo) y registra la plantilla de autenticación.
2. Configurar el secreto del proveedor en Supabase (mismo patrón que
   `RESEND_API_KEY`/`ANTHROPIC_API_KEY`).
3. Aplicar la migración de `celular_verificado` + `phone_verification_tokens`.
4. Construir las dos edge functions y conectar el botón "Reenviar" que ya
   quedó preparado (hoy deshabilitado a propósito) en `ProfileDialog.tsx`.
