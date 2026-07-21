# Política — Gobierno de datos de contactabilidad de usuarios

Pedido del propietario, 2026-07-21: antes de acumular una base centralizada
de usuarios (correo, celular, país, ciudad) que sirva como insumo de
marketing, se necesitan reglas claras de: qué campos son sensibles, quién
puede acceder a ellos, cuántas veces se puede reutilizar un mismo teléfono
o correo entre cuentas, y cómo detectar registros fraudulentos.

**Este documento es una propuesta de diseño, no una política ya
implementada.** Marca explícitamente qué existe hoy en el código vs. qué
falta construir.

## 1. Campos sensibles de contactabilidad

| Campo | Tabla | Sensibilidad | Estado hoy |
|---|---|---|---|
| `email` (principal) | `auth.users` | Alta — identifica y contacta | Único a nivel de Supabase Auth (constraint estándar) |
| `celular` | `profiles` | Alta — identifica y contacta, dato de WhatsApp/SMS | **Sin unicidad, sin verificar** (ver `docs/phone-verification-design.md`) |
| correos secundarios | `user_emails` | Alta | Con OTP de verificación ya implementado |
| `pais`, `ciudad` | `profiles` | Media — geolocalización aproximada | Sin protección especial hoy |
| `fecha_nacimiento` | `profiles` | Alta — dato sensible por edad, ya usado solo para validar mayoría de edad | Solo se usa en el signup (validación 18+), no se expone en ningún reporte |

Ningún dato financiero (transacciones, saldos) se considera "de
contactabilidad", pero sí es sensible por otras razones — eso ya lo cubre
RLS por `user_id = auth.uid()` en todas las tablas financieras.

## 2. Consentimiento de marketing (no existe hoy — propuesta)

Hoy el proyecto **no tiene ningún campo persistido de consentimiento de
marketing**. Lo que existe es solo a nivel de navegador (`localStorage`,
Consent Mode v2 de GTM en `src/lib/consent.ts`) — no sirve para decidir si
se le puede escribir a un usuario por correo/WhatsApp con fines
comerciales, porque no queda asociado a la cuenta ni es auditable.

Propuesta: agregar a `user_config` (o una tabla nueva `user_consents` si se
prevé versionar el texto aceptado, recomendado dado que ya se planea una
EULA diferenciada free/pago en P7-3):

```sql
marketing_email_consent boolean NOT NULL DEFAULT false,
marketing_whatsapp_consent boolean NOT NULL DEFAULT false,
consent_version text,              -- qué versión de EULA/política aceptó
consent_accepted_at timestamptz,
```

Regla de negocio ya insinuada en la conversación con el propietario: el
plan gratuito "acepta publicidad" como parte de su modelo — si eso se
confirma, el consentimiento de marketing para el plan free no sería
opcional sino parte de las condiciones de uso del plan (a diferenciar
claramente del consentimiento para el plan pago, que si accede a un modelo
sin publicidad no debería recibir marketing salvo opt-in explícito). Esto
depende de la decisión de P7-3 (EULA) — no construir el campo de consentimiento
sin cerrar antes esa definición de producto, para no tener que migrar dos
veces.

## 3. Control de acceso a los datos de contacto

Hoy: RLS restringe cada tabla a `user_id = auth.uid()` — un usuario nunca
ve los datos de otro por la app normal. El único rol con acceso ampliado
es `super_admin` (ya existe, usado en reprocesos de correos).

Riesgo identificado: si en algún momento se construye un panel interno de
marketing/administración que consulte `profiles`/`user_emails` de forma
agregada (por ejemplo, para exportar una lista de correos a una campaña),
eso **no debería hacerse con consultas SQL directas de un desarrollador o
un rol amplio sin registro**. Propuesta:

- Cualquier acceso masivo a campos de contacto (no un solo registro propio)
  debe pasar por una función/vista específica, ejecutada solo por
  `service_role` o `super_admin`, y **quedar auditada** en `audit_logs`
  (hoy `audit_logs` solo registra eventos de ingestión de correos —
  extenderlo a también registrar accesos administrativos a datos de
  contacto es un ítem de backlog nuevo, ver P7-6).
- Nunca exportar campos de contacto a herramientas de terceros (ej. una
  plataforma de email marketing) sin que ese acceso quede en el mismo
  registro de auditoría.

## 4. Reutilización de un mismo celular o correo entre cuentas

Hoy no hay ningún límite: `celular` no tiene constraint de unicidad, así
que nada impide que la misma persona (o alguien más) cree varias cuentas
con el mismo número. El único límite real hoy es el de `email` en
`auth.users`, que Supabase Auth ya hace único por defecto.

Contexto importante: la "Cuenta familiar" (`FamilyAccount.tsx`) está
planeada como **un solo login compartido con invitación de miembros por
correo**, no como cuentas separadas — o sea que no hay un caso de uso
legítimo hoy que dependa de permitir el mismo celular en múltiples cuentas
independientes. Dicho esto, sí hay casos legítimos que una regla estricta
podría romper si no se piensa bien (una pareja que comparte el mismo
número de celular familiar pero quiere manejar sus finanzas por separado,
por ejemplo).

Propuesta (a validar con el propietario, no implementada):

- Límite blando, no bloqueo duro: si un celular ya verificado se usa para
  registrar una tercera cuenta o más en un período corto (p. ej. 3 cuentas
  en 30 días), marcar las cuentas para revisión manual en vez de
  rechazarlas automáticamente — evita bloquear casos legítimos (familia
  compartiendo número) mientras sigue detectando abuso real.
- Aplicar la misma lógica a patrones de correo: alias con `+` (
  `usuario+1@gmail.com`, `usuario+2@gmail.com`) que en la práctica son la
  misma bandeja — hoy no se normalizan ni se detectan.

## 5. Señales de fraude en el registro

Hoy solo existe rate limiting de **login** (no de registro), por IP, en
`auth-with-any-email` (máx. 5 fallos en 15 min). El signup en sí no tiene
ningún límite ni heurística de fraude.

Propuesta de señales a agregar (todas de severidad "revisar", no
"bloquear automáticamente" — el costo de un falso positivo en una app
financiera, donde bloquear a un usuario real es grave, es mayor que el de
revisar manualmente un caso sospechoso):

- Volumen de registros por IP en una ventana corta (ej. > 5 cuentas nuevas
  desde la misma IP en 1 hora) — típico de scripts, no de usuarios reales
  en la misma red.
- Dominios de correo desechables/temporales (listas públicas mantenidas,
  ej. `mailinator.com`, `10minutemail.com`) — rechazar o marcar en el
  signup.
- Celular y correo que no coinciden con el país declarado en formato
  (ej. celular con prefijo de otro país muy distinto al `pais` elegido) —
  señal débil, no bloqueante por sí sola.
- Reutilización de celular verificado en corto tiempo (ver punto 4).

Ninguna de estas señales existe hoy — quedan documentadas como backlog
(P7-7), no implementadas.

## Resumen de nuevos ítems de backlog derivados de este documento

Ver `docs/backlog.md`: P7-6 (auditoría de accesos administrativos a datos
de contacto), P7-7 (señales de fraude en registro), P7-8 (consentimiento
de marketing persistido, depende de P7-3).
