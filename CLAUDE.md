# Mis Finanzas — Contexto del proyecto

## Stack
- **Frontend**: React 18 + TypeScript 5.8 + Vite 5 (SWC)
- **Estilos**: Tailwind CSS 3 + shadcn-ui
- **Fetching/cache**: TanStack React Query 5
- **Routing**: React Router DOM 6
- **Formularios**: React Hook Form + Zod
- **Backend**: Supabase (PostgreSQL + RLS + Edge Functions en Deno)
- **Auth**: Supabase Auth + edge function personalizada `auth-with-any-email`
- **Charts**: Recharts
- **Tests**: Vitest 4 + coverage habilitado

## Comandos clave

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run test         # Tests en modo watch
npm run test:run     # Tests una sola vez
npm run lint         # ESLint
```

## Estructura del proyecto

```
src/
├── components/       # Componentes UI reutilizables (shadcn + custom)
├── hooks/            # Hooks de datos: useTransactions, useCategories, etc.
├── pages/            # Páginas por ruta
├── integrations/
│   └── supabase/     # Cliente Supabase + tipos generados
├── utils/            # Funciones utilitarias (currency, dates, etc.)
└── __tests__/        # Tests unitarios (Vitest)

supabase/
├── functions/        # Edge Functions (Deno)
└── migrations/       # Migraciones SQL con RLS habilitado
```

## Patrones establecidos

- **Hooks de datos**: cada entidad tiene su hook en `src/hooks/use{Entidad}.ts` con React Query
- **Mutaciones**: usan `useMutation` con `invalidateQueries` al completar
- **Auth**: sesión manejada por Supabase, rutas protegidas con `<ProtectedRoute>`
- **DB**: acceso directo vía cliente Supabase desde el frontend (RLS protege los datos)
- **Validación**: Zod en formularios, RLS en base de datos como segunda línea

## Issues de escala conocidos (pendientes de resolver)

Estos problemas fueron identificados en auditoría — no agregar más código que los empeore:

1. **Sin paginación** — `useTransactions` carga todas las filas con `.select('*')` sin `.range()`. Crasheará con >5K transacciones por usuario.
2. **N+1 queries** — En `useTransactions.ts` hay queries separados para categoría/subcategoría por transacción. Necesita JOIN.
3. **Sin Error Boundary** — Un error en cualquier componente deja la app en blanco. Falta wrapper en `App.tsx`.
4. **JWT verify desactivado** — `supabase/config.toml` tiene `verify_jwt = false` en la edge function de auth.
5. **TypeScript laxo** — `strict: false` en tsconfig. Hay ~48 usos de `any` en el código.
6. **Cobertura de tests <1%** — Solo 1 archivo de test para 134 archivos fuente.

## Convenciones

- Nombres de archivos: `kebab-case` para archivos, `PascalCase` para componentes
- Tipos de Supabase: generados en `src/integrations/supabase/types.ts` — no editar manualmente
- Variables de entorno: prefijo `VITE_` para las que necesita el frontend
- Idioma del código: inglés; idioma de la UI y comentarios: español

## Skills disponibles para este proyecto

- `/scale-audit` — Audita problemas de escalabilidad (paginación, N+1, timeouts)
- `/test-quality` — Evalúa cobertura y calidad de los tests
- `/pr-ready` — Checklist pre-PR: lint, tests, types
- `/security-review` — Revisa cambios pendientes en busca de vulnerabilidades
