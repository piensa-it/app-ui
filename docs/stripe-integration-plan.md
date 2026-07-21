# Plan: suscripción Premium con Stripe

Estado: 📋 planeado, sin implementar. Este documento es la fuente de verdad
del diseño; el backlog (`docs/backlog.md` P5) solo referencia el estado
de alto nivel.

## Decisiones ya tomadas (2026-07-20)

| Decisión | Elección | Motivo |
|---|---|---|
| Precio | USD 2/mes · USD 20.40/año (15% dto.) | Definido por el propietario |
| Checkout | **Stripe Elements embebido** (no Checkout hospedado) | El formulario de tarjeta vive dentro de misfin.co, sin redirigir a `checkout.stripe.com` |
| Pago fallido | Período de gracia + reintentos automáticos de Stripe (Smart Retries) | Mejor experiencia que bajar el plan en el primer fallo (puede ser un fallo temporal del banco) |
| Impuestos | No usar Stripe Tax por ahora | Precio plano; el volumen actual no justifica el costo/complejidad de Stripe Tax |
| Portal de cliente | Usar el **Customer Portal hospedado de Stripe** para cancelar/actualizar tarjeta/ver facturas | Es gratis y viene incluido; construir esa UI a mano no aporta valor frente a Elements, que sí es la primera impresión del checkout |

## Por qué Elements y no Checkout hospedado (para referencia futura)

Con Checkout hospedado, Stripe aloja toda la página de pago — se implementa
en días, Stripe absorbe el cumplimiento PCI y no hay que mantener un
formulario propio. Con Elements embebido el formulario vive en un modal de
misfin.co (consistente con el patrón ya usado para login/signup en
`Landing.tsx`), pero implica:

- Instalar `@stripe/stripe-js` y `@stripe/react-stripe-js` en el frontend.
- Construir el flujo de confirmación de pago (`stripe.confirmPayment` /
  `confirmCardPayment`) y manejar sus estados de error (tarjeta rechazada,
  3D Secure, etc.) en la UI propia.
- Más superficie de código propio para probar, pero mejor consistencia
  visual con el resto de la app.

## Modelo de datos

Nueva tabla `public.subscriptions` (una fila por usuario, se actualiza con
cada evento de Stripe — no se versiona histórico aquí, para eso están los
`invoice.*` que Stripe ya guarda en su dashboard):

```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) unique,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  status text not null default 'none' check (status in (
    'none', 'incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
  )),
  billing_interval text check (billing_interval in ('month', 'year')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Nota de nombres: **no** se llama `payment_methods` — ese nombre ya existe
en el esquema (`public.payment_methods`) para las cuentas/tarjetas
*financieras* que el usuario registra manualmente en la app (algo
completamente distinto a un método de pago guardado en Stripe). Cualquier
tabla nueva relacionada con Stripe debe evitar esa colisión de nombres.

`plan = 'premium'` combinado con `status in ('active', 'past_due')` es lo
que determina acceso Premium (el `past_due` es justamente el período de
gracia mientras Stripe reintenta el cobro).

RLS: el usuario puede `select` su propia fila (`user_id = auth.uid()`); no
puede `insert`/`update`/`delete` directamente — todos los cambios de estado
llegan por el webhook con `service_role`, igual que el patrón ya usado en
`email_staging`/`process-email-queue`.

Tabla de idempotencia para el webhook (Stripe puede reenviar el mismo
evento más de una vez):

```sql
create table public.stripe_webhook_events (
  stripe_event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
```

## Edge Functions

| Función | Auth | Propósito |
|---|---|---|
| `create-subscription` | JWT del usuario (`verify_jwt = true`) | Crea (o reutiliza) el `Customer` de Stripe para ese usuario, crea la `Subscription` con `payment_behavior: default_incomplete`, devuelve el `client_secret` del `PaymentIntent` para que el frontend confirme el pago con Stripe Elements |
| `stripe-webhook` | Firma de Stripe (`STRIPE_WEBHOOK_SECRET`, **no** JWT — mismo patrón que `process-email-transaction`) | Verifica la firma, chequea `stripe_webhook_events` para idempotencia, y actualiza `subscriptions` según el evento: `customer.subscription.created/updated/deleted`, `invoice.payment_failed`, `invoice.payment_succeeded` |
| `stripe-customer-portal` | JWT del usuario | Crea una sesión del Customer Portal hospedado de Stripe y devuelve la URL para redirigir (solo para gestionar la suscripción existente: cancelar, cambiar tarjeta, ver facturas — no para el checkout inicial) |

Secrets nuevos en Supabase (mismo mecanismo que `EMAIL_WEBHOOK_SECRET`/
`CRON_SECRET` ya usado):

- `STRIPE_SECRET_KEY` (privado, servidor)
- `STRIPE_WEBHOOK_SECRET` (privado, servidor — para verificar la firma)
- `VITE_STRIPE_PUBLISHABLE_KEY` (público, va en el frontend — variable de
  entorno de Netlify, no de Supabase, siguiendo la convención `VITE_*` del
  proyecto)

## Frontend

- Instalar `@stripe/stripe-js` + `@stripe/react-stripe-js`.
- Nuevo hook `useSubscription()` (patrón igual a `useCategories`/
  `useBudgets`) que lee `subscriptions` vía React Query y expone
  `isPremium`, `status`, `currentPeriodEnd`.
- Nuevo componente `SubscribeDialog` (mismo patrón visual que el `Dialog`
  de auth en `Landing.tsx`/`PricingSection`): toggle mensual/anual
  (ya existe en `PricingSection`, se reutiliza), `PaymentElement` de
  Stripe dentro del modal, botón "Confirmar pago".
- Botón "Gestionar suscripción" en Perfil que llama a
  `stripe-customer-portal` y redirige — evita construir cancelación/cambio
  de tarjeta a mano.
- `PricingSection` (Landing) y el equivalente dentro de la app autenticada
  deben usar los IDs reales de `Price` de Stripe (hoy son solo texto).

## Aplicación de límites del plan gratuito (fase separada)

Hoy el plan gratuito ("hasta 50 transacciones/mes, 1 cuenta, 5 categorías")
es solo copy de marketing en `PricingSection` — no se aplica en ningún
lado del código. Antes de habilitar el cobro, hay que decidir *dónde* se
valida: ¿en cada hook de mutación (`useTransactions`, `usePaymentMethods`,
`useCategories`) consultando `useSubscription()`? ¿o con una función de
Postgres/trigger que cuente filas por usuario y bloquee el insert si
`plan = 'free'` y excede el límite? La segunda opción es más robusta
(no depende de que el frontend recuerde chequear), pero es más trabajo.
Se deja como ítem separado (P5-6) para no bloquear el resto del plan.

## Fases de implementación

1. **Cuenta de Stripe (manual, del propietario)** — crear cuenta, activar
   modo test, crear el producto "MisFin Premium" con dos `Price` (mensual
   USD 2, anual USD 20.40), copiar las API keys de test. *Este paso no lo
   puedo hacer yo — requiere acceso a crear la cuenta de Stripe.*
2. Migración: tablas `subscriptions` + `stripe_webhook_events` + RLS.
3. Edge functions: `create-subscription`, `stripe-webhook`,
   `stripe-customer-portal`.
4. Frontend: `useSubscription`, `SubscribeDialog` con Stripe Elements,
   conectar `PricingSection` a los Price IDs reales, botón de portal en
   Perfil.
5. Probar en modo test de Stripe: suscripción exitosa, tarjeta que falla
   (`4000000000000341`), reintento con [Test Clocks de
   Stripe](https://stripe.com/docs/billing/testing/test-clocks) para
   simular el ciclo de facturación completo sin esperar 30 días reales.
6. (Separado, P5-6) Aplicar los límites del plan gratuito en el código.
7. Pasar a modo live: nuevas API keys, nuevo webhook endpoint apuntando a
   producción, `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` reales.

## Siguiente paso concreto

Para poder avanzar con el paso 2 en adelante, necesito que hagas el paso 1
(cuenta de Stripe en modo test + producto + precios) y me compartas:
`STRIPE_SECRET_KEY` (test), el `price_id` mensual y el `price_id` anual.
Con eso empiezo la migración y las edge functions.
