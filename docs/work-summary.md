# Resumen de trabajo — Plataforma de finanzas personales

Fecha: 2026-07-17 · Rama: `feat/personal-finance-platform` (a partir de `main` @ `5cc25e6`)

## Resumen ejecutivo

Se auditó todo el proyecto, se documentó el plan y se implementó el núcleo que faltaba para una plataforma de finanzas personales coherente: modelo de cuentas activo/pasivo con **tarjetas de crédito bien contabilizadas** (la compra es gasto del periodo y deuda de la tarjeta; el pago de la tarjeta es transferencia, no gasto — antes se duplicaba), presupuestos, recurrentes persistidos e idempotentes, cálculos financieros centralizados y testeados, e ingesta de correos v2 con parsers por entidad, deduplicación idempotente, confianza y confirmación explícita del usuario. Todo con migraciones aditivas, RLS y sin romper funcionalidades existentes.

## Estado inicial encontrado

- App funcional en transacciones, categorías, medios de pago, recordatorios, familia, gamificación y auth multi-correo.
- Recurrentes y Establecimientos eran **fachadas** (estado local hardcodeado); Presupuestos no existía.
- Ingesta de correos v1: webhook **público sin autenticación**, extracción solo IA, creaba transacciones directamente sin confirmación, sin deduplicación, con logs sensibles y auto-verificación insegura de correos.
- Traslados y pagos de tarjeta se registraban como **gasto + ingreso** (doble conteo del flujo de caja).
- Sin Error Boundary; carga de transacciones sin límite; cálculos duplicados entre Dashboard y Reportes; TS laxo; 1 archivo de test.

## Cambios realizados (módulos principales)

- **Migraciones** (`supabase/migrations/20260718*.sql`): cuentas extendidas (entidad, saldo inicial, corte/pago, nuevos tipos), `transactions` con cuenta/transferencias/origen/recurrencia, vista `account_balances`, RPC `create_transfer`, tablas `budgets`, `recurring_transactions`, `audit_logs`, extensión de `email_staging` (estados, confianza, dedup, extracción) e índices únicos de idempotencia.
- **Servicios** (`src/services/cashflow.ts`, `recurring.ts`): lógica financiera pura y testeada; única fuente de verdad.
- **Hooks**: `useBudgets`, `useRecurringTransactions` (generación idempotente), `useAccountBalances`; extendidos `useTransactions` (transferencias, cuenta, tope 5.000 filas) y `usePaymentMethods` (naturaleza, nuevos tipos).
- **Páginas**: nueva `Budgets`; `RecurringExpenses` reescrita contra BD real; `EmailStaging` ahora es de todos los usuarios con confirmar/corregir/descartar; `PaymentMethods` usa el RPC de transferencias; Dashboard con modelo activo/pasivo y saldo inicial; `ErrorBoundary` global en `App.tsx`; navegación actualizada.
- **Edge function `process-email-transaction`**: reescrita — secreto de webhook, JWT en reprocesos, parsers deterministas (`_shared/email-parsing/`: contrato + Bancolombia + genérico + normalización + hash FNV-1a), fallback IA opcional, estados de sugerencia, deduplicación, auditoría, logs seguros, sin envío de correos y sin auto-verificación.
- **Tests**: 57 pasando (flujo de caja y modelo de tarjeta, idempotencia de recurrentes, parsers/montos/fechas/dedup, más los existentes de moneda).
- **Docs**: `implementation-plan.md`, `architecture.md`, `email-ingestion-design.md`, `security-review.md`, este resumen y `.env.example`.

## Funcionalidades: completadas / parciales / pendientes

**Completadas**: cuentas con naturaleza y saldos calculados; ingresos/gastos/transferencias/ajustes; pago de tarjeta sin doble conteo; deuda y cupo disponible; presupuestos con umbral de alerta; recurrentes idempotentes; sugerencias de correo con confirmación/corrección/rechazo; deduplicación; auditoría; Error Boundary.

**Parciales**: paginación (tope de seguridad, falta por rangos); asociación automática de sugerencias a la tarjeta por últimos 4 dígitos (se extraen y muestran; falta campo de match en cuentas); `Reports.tsx` sigue usando el presupuesto legado de `categories.presupuesto` (unificar con `budgets`).

**Pendientes (Fase 3)**: compras a cuotas/diferidos con proyección de flujo (decisión tomada: gasto completo al comprar); conexión OAuth de buzones por usuario; tabla `merchants` y persistencia de Establecimientos; `space_id` multi-espacio; TS estricto gradual; migración opcional de traslados históricos (`categoría "Traslado"/"Pago tarjeta"` → tipo `transferencia`); server-side aggregates para historiales muy grandes.

## Verificación ejecutada

- `npm run test:run` → **57/57 pasando**.
- `npm run build` → ✓ compila (solo warning preexistente de chunks >500 kB).
- `npx tsc --noEmit` → sin errores.
- `npm run lint` → 59 errores / 8 warnings, **todos preexistentes** (baseline en `main`: 60/8; el código nuevo no agrega ninguno).
- Migraciones: **no aplicadas a la BD remota** (sin autorización para tocar producción). Son aditivas e idempotentes; ver "Pasos" abajo.
- No probado en navegador contra la BD real: las tablas nuevas no existen aún en el proyecto Supabase remoto, así que las pantallas nuevas (Presupuestos, Recurrentes, sugerencias) funcionarán tras aplicar las migraciones.

## Problemas conocidos / riesgos pendientes

- Hasta aplicar migraciones, las páginas nuevas mostrarán errores de tabla inexistente (la app existente no se ve afectada).
- `types.ts` fue extendido a mano: regenerar con `supabase gen types typescript --project-id <id>` tras migrar.
- `EMAIL_WEBHOOK_SECRET` sin configurar deja el webhook abierto (advertencia en logs) — configurarlo y rotar la URL de SendGrid.
- Multi-moneda en transferencias: el RPC usa la moneda de la cuenta origen; conversión entre cuentas de distinta moneda no implementada.
- Registros históricos de traslados (gasto+ingreso con categoría "Traslado") siguen inflando totales históricos; script de migración opcional pendiente de decisión.

## Variables de entorno requeridas

Ver `.env.example`: `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (frontend) y secrets de funciones `EMAIL_WEBHOOK_SECRET` (obligatorio para producción), `ANTHROPIC_API_KEY` (opcional, fallback IA con Claude), `RESEND_API_KEY`.

## Pasos para ejecutar localmente

```bash
npm install
cp .env.example .env   # completar valores de tu proyecto Supabase
# Aplicar migraciones (con respaldo previo si es producción):
npx supabase link --project-ref <project-id>
npx supabase db push          # o aplicar los .sql de supabase/migrations en orden
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
npm run dev                    # http://localhost:5173
npm run test:run && npm run lint && npm run build
```

## Pasos para probar la integración de correo

1. Configurar `EMAIL_WEBHOOK_SECRET` en Supabase (Edge Functions → Secrets) y desplegar: `npx supabase functions deploy process-email-transaction`.
2. En SendGrid Inbound Parse, apuntar al endpoint de la función agregando el header `x-webhook-secret`.
3. En la app: Perfil → registrar el correo desde el que reenviarás notificaciones.
4. Reenviar una notificación bancaria a `trx@misfin.co` (o simular con `curl -F` un form-data con `from`, `subject`, `text` y el header del secreto).
5. Abrir **Correos y sugerencias**: confirmar, corregir o descartar la sugerencia. Reenviar el mismo correo debe marcarse **Duplicado** (idempotencia).
6. Sin credenciales reales: los tests de `src/__tests__/email-parsing/` cubren el pipeline de extracción y deduplicación.

## Decisiones que debes revisar

1. Umbral de confianza 0.75 y política "nunca auto-confirmar" (recomendada para v1).
2. Configurar/rotar el secreto del webhook (bloqueante para producción).
3. Proveedor de conexión de buzones (OAuth vs. reenvío actual).
4. Migrar o no los traslados históricos al nuevo tipo `transferencia`.
5. Alcance de super_admin sobre correos de todos los usuarios.
6. Futuro de Créditos/Suscripciones (simuladores) y Establecimientos (fachada).

## Commits realizados

1. `docs: add project assessment and implementation plan`
2. `feat: add migrations for accounts, transfers, budgets, recurring and email ingestion v2`
3. `feat: add error boundary, cashflow/recurring services and email parser contract`
4. `feat: harden email webhook and rework processing into suggestion pipeline`
5. `feat: add account balances, budgets and recurring transaction hooks`
6. `feat: add budgets page and fix transfers/card payments to avoid double counting`
7. `feat: persist recurring transactions with idempotent generation`
8. `feat: user-facing email suggestions with confirm/correct/reject flow`
9. `feat: account nature model with credit card debt in dashboard balances`
10. `test: cover cashflow model, recurring idempotency and email parsing/dedup`
11. `docs: add architecture, email ingestion design and security review`
12. `docs: add work summary and env template`

13. `docs: add versioned product backlog`
14. `feat: add in-app help center with user manuals`

No se hizo push ni se abrió PR (requiere tu autorización).

## Adenda 2026-07-17 (2ª ronda)

- **Backlog versionado**: `docs/backlog.md` es ahora la fuente de verdad, con prioridades P0–P4 y estados.
- **Centro de ayuda**: nueva página `/ayuda` (menú lateral → sección **Ayuda → Manuales de usuario**) con 7 manuales en español simple: Primeros pasos, Cuentas y tarjetas de crédito, Ingresos/gastos y movimientos, Presupuestos, Recurrentes, Correos y sugerencias, Dashboard y reportes.
- **Regla permanente adoptada**: cada funcionalidad liberada agrega su manual (`src/content/manuals/*.md`, registrado en `src/lib/manuals.ts`) y actualiza el backlog.
- Los manuales se renderizan con un componente propio (`MarkdownContent`) sin dependencias nuevas y sin renderizar HTML crudo.
- Verificación de la ronda: tsc ✓ · build ✓ · tests 57/57 ✓ · lint 59/8 (sin errores nuevos).

## Adenda 2026-07-18 (3ª ronda — sesión autónoma nocturna)

Trabajé el backlog en el orden propuesto. Resultado:

- **P0 (migraciones/despliegue) — NO ejecutado, requiere tu acción**: la cuenta de Supabase conectada al MCP no contiene el proyecto de la app (`bymdreiwahvjejhjubrp`); solo tiene PiensaIT, askia y Sudivisa. No apliqué nada en proyectos ajenos. Cuando despiertes: `npx supabase link --project-ref bymdreiwahvjejhjubrp && npx supabase db push` (5 migraciones, aditivas), regenerar `types.ts`, desplegar la edge function y configurar `EMAIL_WEBHOOK_SECRET` (pasos completos en la sección "Pasos" de este documento).
- **P1-6 ✅**: el formulario de cuentas ahora captura entidad financiera, saldo inicial (activos), día de corte y día límite de pago (tarjetas) y últimos 4 dígitos.
- **P1-7 ✅**: `Reports.tsx` usa la tabla `budgets` como fuente principal (incluye presupuesto global) y mantiene el presupuesto legado de categorías como respaldo — Dashboard, Presupuestos y Reportes ya calculan con el mismo servicio.
- **P2-5 ✅**: nueva migración `20260718000500_account_last4.sql`; las sugerencias de correo se asocian automáticamente a la tarjeta por últimos 4 dígitos (insignia "****1234 → Tu tarjeta" y preselección al confirmar/corregir).
- **P2-4 🔨**: parsers de **Nequi** y **Davivienda/DaviPlata** agregados con tests; corregido un bug de `parseAmount` con separadores colgantes ("$75.000." al final de frase). BBVA y otros quedan pendientes.
- **Manuales actualizados** (regla P4-2 cumplida): "Cuentas y tarjetas" documenta los campos nuevos; "Correos y sugerencias" documenta entidades soportadas y el match por últimos 4.
- Verificación: tsc ✓ · build ✓ · tests **63/63** ✓ · lint 59/8 (sin errores nuevos).

Commits de la ronda: `feat: full account fields in form and card auto-match by last 4 digits`, `feat: unify budget analysis report with budgets table`, `feat: add Nequi and Davivienda email parsers with tests`, `docs: update backlog, manuals and work summary (round 3)`.
