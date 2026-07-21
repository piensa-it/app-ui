# Arquitectura — Mis Finanzas

## Visión general

SPA (React 18 + Vite) que habla directamente con Supabase desde el navegador. No hay backend propio: la autorización la aplican las políticas RLS de Postgres y las operaciones privilegiadas viven en Edge Functions (Deno).

```
┌────────────────────────────────────────────────┐
│ React SPA                                      │
│  pages/ ──► hooks/ (React Query) ──► supabase-js│
│              │                                  │
│              └──► services/ (lógica pura)       │
└───────────────┬────────────────────────────────┘
                │ HTTPS (publishable key + JWT)
┌───────────────▼────────────────────────────────┐
│ Supabase                                       │
│  Postgres + RLS  ·  Auth  ·  Edge Functions    │
│  Vista account_balances · RPC create_transfer  │
└───────────────▲────────────────────────────────┘
                │ webhook (x-webhook-secret)
        SendGrid Inbound Parse (correos)
```

## Capas

- **`src/pages/`** — una página por ruta; solo presentación y estado de UI.
- **`src/hooks/`** — un hook por entidad (`useTransactions`, `useBudgets`, `useRecurringTransactions`, `useAccountBalances`, `useEmailStaging`, …). Encapsulan React Query + mutaciones con `invalidateQueries`.
- **`src/services/`** — lógica de dominio pura y testeable, sin dependencias de React ni Supabase:
  - `cashflow.ts`: única fuente de verdad de cálculos financieros (resúmenes de periodo, agrupación por categoría, series mensuales, posición activo/pasivo, ejecución de presupuestos).
  - `recurring.ts`: cálculo de ocurrencias y próximas fechas de recurrentes.
- **`supabase/functions/`** — Edge Functions. `_shared/email-parsing/` es TypeScript puro (sin APIs Deno) compartido entre la función de ingesta y los tests de Vitest.
- **`supabase/migrations/`** — SQL aditivo con RLS. La BD garantiza idempotencia (índices únicos) y atomicidad (RPC `create_transfer`).

## Modelo financiero

- Toda cuenta (`payment_methods`) tiene **naturaleza**: `pasivo` si es `tarjeta_credito`, `activo` en el resto.
- `transactions.tipo ∈ {ingreso, gasto, transferencia, ajuste}`:
  - Solo `ingreso`/`gasto` cuentan en flujo de caja y presupuestos.
  - `transferencia` (dos filas ligadas por `transfer_group_id`, dirección `in`/`out`) mueve dinero entre cuentas propias; cubre traslados y **pagos de tarjeta**.
  - `ajuste` corrige saldos sin afectar ingresos/gastos.
- **Compra con tarjeta de crédito**: `gasto` asociado a la tarjeta → sube gasto del periodo y deuda; no toca el disponible.
- Saldos calculados en la vista `account_balances` (con `security_invoker` para respetar RLS): activo = `saldo_inicial` + movimientos; tarjeta = deuda acumulada y `cupo_disponible`.
- Indicadores: `disponible` (Σ activos), `deuda` (Σ pasivos), `patrimonio neto` (disponible − deuda).

## Idempotencia y consistencia

- Recurrentes: índice único `(recurring_transaction_id, recurring_period)` — regenerar jamás duplica.
- Correos: índice único `(user_id, dedup_hash)` — reprocesar jamás duplica.
- Transferencias: RPC transaccional `create_transfer` (o se crean las dos patas o ninguna).
- Cálculos de UI centralizados en `services/cashflow.ts` para que Dashboard y Reportes muestren cifras idénticas.

## Multi-espacio (futuro)

Ya existe `family_accounts`/`family_members`. Las tablas nuevas usan `user_id` y quedan preparadas para incorporar un `space_id` (hogar/empresa) sin migración destructiva. No se implementó nada empresarial en esta fase.

## Deuda técnica conocida

- `tsconfig` no estricto (~37 `any` legados); el código nuevo se escribe estricto.
- `types.ts` de Supabase editado a mano en esta rama: **regenerar** con `supabase gen types typescript` tras aplicar migraciones.
- Lista de transacciones con tope de 5.000 filas; paginación por rangos y agregados en servidor documentados como siguiente optimización.
- `Reports.tsx` usa el campo legado `categories.presupuesto`; unificarlo con la tabla `budgets` está pendiente.
- Pantallas simulador (Créditos, Suscripciones) y Establecimientos siguen sin persistencia (documentado; no se ocultó funcionalidad).

---

## ADR-001: ¿El stack actual escala? ¿Vale la pena migrar antes de lanzar?

**Estado:** Aceptado · **Fecha:** 2026-07-21 · **Decide:** propietario del producto

### Contexto

Pregunta explícita del propietario, antes del lanzamiento: ¿el stack elegido
(React 18 + Vite + Supabase) es escalable y está bien diseñado a nivel de
patrones, o conviene migrar a otro stack ahora que arrancar de nuevo es más
barato que después de tener usuarios reales y datos en producción?

Es la pregunta correcta en el momento correcto — este es literalmente el
punto más barato del proyecto para cambiar de stack si hiciera falta.

### Decisión

**No migrar de stack.** React + Vite + Supabase es una combinación madura y
probada en producción para SaaS de este tamaño (cientos a decenas de miles
de usuarios). Ninguno de los problemas reales identificados abajo se debe a
la *elección* de stack — todos son de *implementación* y se resuelven de
forma incremental, sin reescribir nada. Migrar ahora tendría un costo de
oportunidad alto (retrasar el lanzamiento varias semanas/meses) sin resolver
ningún problema real de fondo.

### Evaluación por capa

**Frontend — React 18 + Vite + TS + Tailwind/shadcn.** Elección estándar de
la industria, ecosistema enorme, curva de aprendizaje baja para futuros
colaboradores. Es una SPA 100% client-side (sin SSR) — para una app que
vive casi toda detrás de login (dashboard, transacciones, reportes) esto no
penaliza SEO; la única superficie pública (Landing) ya tiene metadatos
estáticos en `index.html` (OG, JSON-LD, `hreflang` pendiente en P4-22)
independientes del render de React. Riesgo real, no de arquitectura sino de
implementación: el bundle de producción pesa **2.49 MB (611 KB gzip) en un
solo archivo** — Vite ya lo marca como advertencia en cada build. En
conexiones móviles de LatAm esto sí pega en la tasa de rebote de usuarios
nuevos en la Landing. Se soluciona con `dynamic import()` por ruta
(code-splitting), no con cambiar de framework — ver P4-26 más abajo.

**Fetching de datos — TanStack React Query 5.** Patrón correcto: cache,
invalidación manual explícita (`invalidateQueries` tras cada mutación),
`isLoading` centralizado. Punto débil menor: los `queryKey` son strings
sueltos (`["transactions"]`, `["account-balances"]`) en vez de una factory
central — funciona bien a este tamaño, pero si el número de hooks sigue
creciendo conviene una convención tipada (`queryKeys.transactions.all`)
para evitar invalidaciones que se les olviden a futuros cambios.

**Backend — Supabase (Postgres + RLS + Edge Functions Deno), sin backend
propio.** El patrón "SPA habla directo con Postgres, RLS como autorización"
es legítimo y bien ejecutado acá: las políticas RLS son la fuente de verdad
de quién puede ver/escribir qué, y las Edge Functions aíslan lo que
necesita privilegios (`auth-with-any-email`, ingesta de correos, ahora
Stripe). La cola `pgmq` + `pg_cron` que se armó para la ingesta de correos
es exactamente el patrón correcto para absorber picos sin bloquear al
usuario — buena señal de madurez del diseño, no algo típico de un proyecto
recién salido de un scaffold. Postgres con RLS escala perfectamente bien
para el volumen de una app de finanzas personales (miles de filas por
usuario, no millones); el pooler de Supabase (Supavisor/PgBouncer) maneja
las conexiones concurrentes sin que el equipo tenga que operar nada. Riesgo
real, no de stack: **sin paginación de rango real**, la lista de
transacciones tiene un tope duro de 5.000 filas (`useTransactions.ts`) —
ya documentado como P1-9, y es el ítem con más impacto real si un usuario
llega a acumular mucho historial.

**Auth.** Supabase Auth + una función Edge propia (`auth-with-any-email`)
para permitir múltiples correos por cuenta — complejidad adicional
justificada por un requisito real de producto, no accidental. Pendiente
real de seguridad ya conocido (P0-3/P4-6): esa función tiene
`verify_jwt = false`, hay que auditarla puntualmente.

**Testing.** Cobertura real ~1.25% (medida esta semana al montar el
quality gate de CI). Es el hueco más grande del proyecto en este momento —
no por elección de stack, sino porque se priorizó construir funcionalidad.
`services/cashflow.ts` y `services/recurring.ts` ya son lógica pura sin
dependencias de React ni Supabase — son los más baratos de cubrir y los
que más protegen (cálculos financieros). Antes de seguir agregando
funcionalidad (Stripe, i18n completo) conviene invertir aquí.

### Patrones de diseño: qué está bien, qué se puede mejorar

**Bien ejecutado — replicar:**
- `services/cashflow.ts` como lógica de dominio pura, sin I/O — es el
  patrón más sano del repo. Cada vez que se agregue una regla de negocio
  nueva, debería vivir ahí, no dentro de un hook o un componente.
- Un hook por entidad (`useTransactions`, `useBudgets`, …) — nivel de
  abstracción correcto, fácil de ubicar código.
- RPC transaccional (`create_transfer`) para operaciones que deben ser
  atómicas — evita el problema clásico de "se creó la mitad de la
  transferencia" si algo falla a medio camino.
- Índices únicos como mecanismo de idempotencia (recurrentes, dedup de
  correos) — la base de datos garantiza la invariante, no la memoria de la
  aplicación.

**Mejorable, no urgente:**
- Los hooks de datos mezclan fetching + mutaciones + `toast.error` en el
  mismo archivo — acopla la capa de datos a la UI (sonner). Hoy no importa
  porque solo hay un frontend, pero dificultaría reusar esta lógica en, por
  ejemplo, una futura app móvil.
- `useTransactions.createTransaction`/`updateTransaction` resuelven la
  categoría por **nombre** (`eq("nombre", transaction.categoria)`) en vez
  de recibir el `category_id` directo, aunque el formulario ya lo tiene
  disponible en el `<Select>`. Cuesta 1-2 queries extra por mutación y es
  un smell de diseño (contrato debería ser por ID, no por texto). Quick
  win real — ver P4-27.
- `Landing.tsx` pasó de ~1230 a ~1250+ líneas en un solo archivo (layout +
  i18n + validación + modal de auth completo). No es un problema de
  escalar tráfico, es de escalar *mantenimiento*: cada cambio (como los de
  hoy) obliga a leer un archivo enorme. Partirlo en subcomponentes
  (`AuthDialog`, `HeroSection`, `TestimonialsSection`, ya `PricingSection`
  extraída) es deseable pero no bloqueante para lanzar.

### Alternativas consideradas (por completitud, no por necesidad real)

| Opción | Complejidad | Qué resolvería que no se resuelva ya | Costo |
|---|---|---|---|
| **A. Mantener stack, invertir incremental** (elegida) | Baja | Todo lo identificado arriba, sin reescribir | Días/semanas, sin bloquear el lanzamiento |
| B. Migrar a Next.js (SSR/ISR) | Media-Alta | SEO de la Landing — pero ya se resuelve con metadatos estáticos + la app real vive detrás de login, donde SSR no aporta | Semanas de reescritura, cero beneficio neto hoy |
| C. Backend propio (Node/NestJS) en vez de Supabase directo | Alta | Nada que RLS + Edge Functions no resuelvan ya para este tamaño; agrega infraestructura a operar (servidores, deploys, escalado) | Meses; sería sobre-ingeniería para el volumen actual |
| D. Cambiar de Postgres/Supabase a otra BD | Muy alta | Nada — Postgres escala de sobra para finanzas personales hasta decenas de miles de usuarios | Reescritura completa del backend; no se justifica |

### Consecuencias

- Se sigue construyendo sobre el stack actual sin fricción.
- Los puntos de mejora identificados quedan en el backlog priorizados por
  impacto real (abajo), no como "deuda técnica genérica".
- Esta decisión se puede revisar más adelante si el volumen de usuarios
  cambia radicalmente el panorama (por ejemplo, si se necesitara SSR real
  por SEO agresivo, o multi-región) — no hay nada en el diseño actual que
  impida migrar por partes el día que haga falta (RLS y Edge Functions no
  atan a un frontend específico).

### Ítems de backlog que salen de este análisis

Ver `docs/backlog.md`: P1-9 (paginación real, ya existía, se sube prioridad
por este análisis), P4-26 (code-splitting del bundle), P4-27 (pasar
`category_id` directo en vez de resolver por nombre en `useTransactions`).
