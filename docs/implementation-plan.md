# Plan de implementación — Plataforma de finanzas personales

Fecha: 2026-07-17 · Rama: `feat/personal-finance-platform` · Autor: revisión técnica asistida

## 1. Estado actual del proyecto

- **Stack**: React 18 + TS 5.8 + Vite 5 (SWC), Tailwind + shadcn-ui, TanStack Query 5, React Router 6, RHF + Zod, Supabase (Postgres + RLS + Edge Functions Deno), Recharts, Vitest 4.
- **Baseline verificado**: `npm run build` ✓ · `npm run test:run` 17/17 ✓ (1 solo archivo de test) · `npm run lint` con 60 errores y 8 warnings preexistentes (mayoría `@typescript-eslint/no-explicit-any`).
- **Git**: rama `main` limpia y al día con origin. Ramas `dev`, `uat`, `feature/1` y varias `edit/*` remotas.
- **TypeScript laxo**: `strict: false`, `noImplicitAny: false`, ~38 usos de `any`.

## 2. Arquitectura encontrada

- SPA que habla directo con Supabase desde el navegador; RLS es la capa de autorización real.
- Un hook de datos por entidad (`useTransactions`, `useCategories`, `usePaymentMethods`, `usePaymentReminders`, `useEmailStaging`, gamificación, etc.), con React Query y mutaciones con `invalidateQueries`.
- Auth: Supabase Auth + edge functions personalizadas (`auth-with-any-email`, OTP, reset). `<ProtectedRoute>` protege rutas.
- Ingesta de correo v1: webhook SendGrid → `process-email-transaction` (extracción vía IA "Lovable") → `email_staging` → creación directa de transacción.
- Sin capa de servicios/dominio: los cálculos de flujo de caja están duplicados en `Index.tsx` y `Reports.tsx`.

## 3. Funcionalidades existentes

| Módulo | Estado |
|---|---|
| Registro/login (multi-email + OTP), reset password | Funcional |
| Transacciones (CRUD, filtros, adjuntos, categoría/subcategoría) | Funcional |
| Categorías y subcategorías (default + personalizadas) | Funcional |
| Medios de pago (`payment_methods` con saldo y cupo) | Funcional, sin vínculo FK con transacciones |
| Recordatorios de pago | Funcional |
| Cuenta familiar (`family_accounts`, `family_members`) | Funcional (base multi-espacio ya existe) |
| Gamificación, logros, notificaciones | Funcional |
| Ingesta de correos (`email_staging` + webhook) | Parcial: sin dedup, sin confianza, sin confirmación del usuario, webhook sin autenticación |
| Reportes y dashboard | Parcial: cálculos duplicados, sin comparativos consistentes |
| **Movimientos recurrentes** (`RecurringExpenses.tsx`) | **Fachada**: estado local hardcodeado, no persiste |
| **Establecimientos** (`Establishments.tsx`) | **Fachada**: estado local hardcodeado |
| Créditos, Suscripciones | Simuladores locales (sin persistencia, por diseño aparente) |
| **Presupuestos** | **No existe** (hay `BudgetComparisonChart` sin fuente real) |
| **Cuentas financieras completas** | Parcial: `payment_methods` cubre una parte |
| **Transferencias, ajustes y pago de tarjetas** | No existen (`tipo` solo permite ingreso/gasto) |

## 4. Problemas encontrados

1. **Webhook `process-email-transaction` público** (`verify_jwt=false`) sin secreto compartido: cualquiera puede inyectar correos/transacciones. **Crítico.**
2. Sin Error Boundary: cualquier excepción de render deja la app en blanco.
3. Sin paginación en `useTransactions` (carga todo el historial).
4. N+1 en mutaciones de transacciones (lookup de categoría por nombre en cada create/update). La lectura ya usa JOIN.
5. `email_staging` sin hash de deduplicación, sin id externo, sin confianza ni estados; el correo crea la transacción directamente sin confirmación.
6. Logs de la edge function imprimen headers y contenido completos; riesgo de filtrar datos sensibles.
7. Cálculos financieros duplicados entre Dashboard y Reportes.
8. Pantallas que aparentan funcionar sin backend (Recurrentes, Establecimientos).
9. `transactions.medio_pago` es texto libre, sin FK a `payment_methods`; los saldos no se pueden calcular de forma confiable.
10. Sin modelo de tarjeta de crédito: una compra con tarjeta hoy bajaría el "dinero" como si fuera efectivo, y pagar la tarjeta contaría como segundo gasto (doble conteo).
11. TS laxo + `any`; cobertura de tests <1%.

## 5. Riesgos

- Migraciones sobre el proyecto Supabase productivo sin respaldo (mitigación: migraciones aditivas e idempotentes, sin `DROP`; aplicar con respaldo previo).
- Endurecer el webhook puede romper el flujo SendGrid actual (mitigación: secreto por variable de entorno, con periodo de gracia documentado).
- `types.ts` es generado; se edita a mano en esta rama y **debe regenerarse** (`supabase gen types`) tras aplicar migraciones.

## 6. Propuesta de arquitectura

Mantener la arquitectura actual (SPA + Supabase + RLS) e introducir:

- **Capa de dominio en `src/services/`**: funciones puras y testeables. `cashflow.ts` (cálculos centralizados de ingresos/gastos/saldos/deuda), `recurring.ts` (fechas e idempotencia). Los componentes solo presentan.
- **Parsers de correo en `supabase/functions/_shared/email-parsing/`**: TypeScript puro sin APIs de Deno, usables por la edge function y testeables con Vitest. Contrato `EmailParser` + registro por entidad + extractor genérico + fallback IA (existente).
- **Idempotencia en BD**: índices únicos parciales (dedup de correos, generación recurrente) y RPC transaccional para transferencias.
- **Evolución multi-espacio**: ya existe `family_accounts`; las tablas nuevas mantienen `user_id` y quedan listas para un `space_id` futuro. Nada empresarial ahora.

## 7. Modelo financiero: tarjetas de crédito

Decisiones de producto confirmadas por el propietario (2026-07-17):

- **Naturaleza de cuentas**: toda cuenta es `activo` (ahorros, corriente, efectivo, billetera, inversión) o `pasivo` (tarjeta de crédito). Derivada del `tipo`.
- **Compra con tarjeta = gasto en la fecha de compra**: cuenta en gastos del periodo y presupuestos, **no** reduce el dinero disponible; aumenta la deuda de la tarjeta y reduce el cupo disponible.
- **Pago de la tarjeta = transferencia** activo → pasivo: reduce banco y deuda; **no es gasto** (evita doble conteo). Intereses y cuota de manejo sí son gasto (categoría Deudas).
- **Indicadores**: `disponible` = suma de saldos de activos; `deuda` = Σ compras+intereses − pagos por tarjeta; `patrimonio neto` = activos − pasivos; `cupo disponible` = cupo_total − deuda.
- **Compras a cuotas (diferidos)**: el gasto se reconoce completo en el mes de compra; el plan de cuotas con proyección de flujo de efectivo queda para la Fase 3 (decisión: "gasto total al comprar", alcance fase 1 "básico ahora, cuotas después").

## 8. Modelo de datos propuesto (delta)

Tablas nuevas (todas con RLS por `user_id = auth.uid()`):

- `budgets`: id, user_id, category_id (null ⇒ global), periodo (date día 1; null ⇒ aplica todos los meses), monto, umbral_alerta (%), activo.
- `recurring_transactions`: id, user_id, tipo, nombre, valor, moneda, category_id, subcategory_id, payment_method_id, frecuencia (daily/weekly/biweekly/monthly/yearly), fecha_inicio, fecha_fin, proxima_fecha, activo.
- `audit_logs`: id, user_id, accion, entidad, entidad_id, detalle jsonb, created_at (lectura solo propia; insert autenticado o service role).

Cambios aditivos a tablas existentes:

- `transactions`: + `payment_method_id` FK, + `recurring_transaction_id` FK, + `recurring_period` date, + `transfer_group_id` uuid, + `source` ('manual'|'email'|'recurring'); `tipo` amplía CHECK a ('ingreso','gasto','transferencia','ajuste'). Índice único parcial `(recurring_transaction_id, recurring_period)` ⇒ recurrencia idempotente.
- `payment_methods` (actúa como *FinancialAccount*): + `entidad`, + `saldo_inicial`, + `fecha_corte` (día), + `fecha_pago` (día); `tipo` amplía CHECK con ('cuenta_ahorros','cuenta_corriente','billetera_digital','inversion').
- `email_staging` (actúa como *EmailMessage* + *TransactionSuggestion*): + `status` ('pending','pending_confirmation','confirmed','ignored','duplicate','error'), + `confidence`, + `provider`, + `external_message_id`, + `transaction_reference`, + `dedup_hash` (índice único parcial por usuario), + `extraction` jsonb.
- RPC `create_transfer(p_from, p_to, p_valor, p_fecha, p_descripcion)`: par de movimientos `transferencia` atómico con `transfer_group_id` común. Cubre transferencias entre cuentas y pago de tarjetas.

*Merchant*: `establecimiento` sigue como texto; tabla normalizada queda para Fase 3.

## 9. Plan por fases

**Fase 0 — Seguridad y estabilidad**: Error Boundary global; secreto de webhook (`EMAIL_WEBHOOK_SECRET`) + limpieza de logs sensibles; paginación en `useTransactions`.

**Fase 1 — Núcleo financiero con tarjetas (modelo básico)**: migraciones; cuentas con naturaleza activo/pasivo; vínculo transacción→cuenta; transferencias/pago de tarjeta con RPC; deuda y cupo calculados; servicio central de flujo de caja usado por Dashboard y Reportes (disponible, deuda, patrimonio neto); presupuestos (CRUD + % consumido + alerta por umbral); recurrentes persistidos con generación idempotente.

**Fase 2 — Ingesta de correo v2**: contrato de parsers + genérico + parser ejemplo bancario; dedup por hash/id externo; umbral de confianza (≥0.75 ⇒ sugerencia lista para confirmar con datos completos; <0.75 ⇒ sugerencia para revisión); UI de confirmación/corrección/rechazo; asociación a tarjeta por últimos 4 dígitos; auditoría.

**Fase 3 — Documentada, no implementada**: plan de cuotas/diferidos con proyección de flujo de efectivo mensual; conexión OAuth Gmail/Outlook por usuario; tabla `merchants`; `space_id` multi-espacio; TS estricto gradual; E2E.

## 10. Criterios de aceptación

1. Crear cuentas (entidad, saldo inicial, corte/pago, cupo) y registrar ingresos/gastos/transferencias/ajustes; las transferencias no cuentan como ingreso/gasto.
2. Compra con tarjeta: sube gasto del mes y deuda de la tarjeta, no baja el disponible; pago de tarjeta baja banco y deuda sin generar gasto.
3. Dashboard y Reportes muestran las mismas cifras (mismo servicio, con tests).
4. Presupuestos por categoría/globales con % consumido y alerta al superar umbral.
5. Re-ejecutar generación de recurrentes no duplica (índice único + tests).
6. Reprocesar el mismo correo no duplica (hash + índice único + tests).
7. Sugerencias confirmables/corregibles/rechazables; nada se registra silenciosamente bajo el umbral.
8. `build`, `lint` (sin errores nuevos) y `test:run` en verde.

## 11. Decisiones técnicas tomadas

- **Reutilizar `payment_methods` como cuenta financiera** (evita migración de datos); renombrar solo en UI ("Cuentas y medios de pago").
- **Reutilizar `email_staging` como mensaje+sugerencia** (1:1 en esta fase).
- **Parsers compartidos sin APIs Deno** para testearlos con Vitest.
- **Idempotencia garantizada en BD**, no solo en aplicación.
- **Gasto de cuotas reconocido completo al comprar** (decisión de producto); proyección de cuotas en Fase 3.
- **No activar `strict` global ahora**; código nuevo se escribe estricto.
- **No conectar buzones reales** (sin autorización); se mantiene el flujo webhook con secreto.

## 12. Requiere confirmación del propietario del producto

- Configurar `EMAIL_WEBHOOK_SECRET` en Supabase y el header en SendGrid; rotar la URL actual del webhook.
- Proveedor definitivo de conexión de correo por usuario (Gmail OAuth vs. reenvío SendGrid).
- Umbral de confianza (propuesto 0.75) y política de no auto-confirmar (propuesto: nunca en v1).
- Futuro de simuladores (Créditos, Suscripciones) y Establecimientos.
- Aplicación de migraciones a producción (`supabase db push` con respaldo previo).
