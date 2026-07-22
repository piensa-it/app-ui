# @piensa-it/ui-library — Contexto del proyecto

> Este repo (`app-ui`) dejó de ser la app "Mis Finanzas". Ahora es la **librería de componentes UI** compartida de Piensa IT, instalable vía npm en los demás repos (MisFin, Lynx, etc.). No contiene lógica de negocio, auth ni Supabase — eso vive en el repo de cada aplicación.

## Stack

- **Frontend**: React 18 + TypeScript 5.8 + Vite 5 (SWC), en **modo librería** (no SPA)
- **Estilos**: Tailwind CSS 3 + shadcn-ui, tokens vía CSS variables (theming por marca)
- **Tests**: Vitest 4 + Testing Library
- **Empaquetado**: `vite-plugin-dts` genera los `.d.ts`; build ESM + CJS

## Comandos clave

```bash
npm run dev          # Playground de desarrollo (src/App.tsx) — NO es lo que se publica
npm run build        # Genera dist/ — esto es lo que se publica a GitHub Packages
npm run test         # Tests en modo watch
npm run test:run     # Tests una sola vez
npm run lint         # ESLint
```

## Estructura del proyecto

```
tailwind-preset.js     # preset de Tailwind publicado (tokens compartidos entre repos)
src/
├── index.ts            # barrel de exports públicos — ÚNICO punto de entrada del paquete
├── styles/globals.css  # tokens de diseño (CSS vars) + directivas Tailwind
├── components/
│   ├── ui/              # primitivas shadcn/ui
│   ├── layout/           # Layout, GlobalErrorBoundary
│   └── marketing/         # PublicHeader, PublicFooter, ImageCarouselBackdrop
├── lib/                  # utils.ts (cn), iconConfig.ts
├── App.tsx, main.tsx      # playground de desarrollo, no se publica
└── __tests__/             # tests de componentes
```

## Patrones establecidos

- **Sin acoplamiento a negocio**: ningún componente debe hacer fetch, hardcodear textos de una marca específica, o asumir un router concreto — todo eso se recibe por props (ver `PublicHeader`/`PublicFooter`, que reciben un `linkComponent` inyectable en vez de importar `react-router-dom` directamente).
- **Sin colores hardcodeados**: todo color usa clases Tailwind mapeadas a CSS variables (`bg-primary`, `text-muted-foreground`, `bg-success`...) definidas en `src/styles/globals.css`. Nunca un hex/rgb directo en un componente.
- **Export único**: cualquier componente nuevo se agrega a `src/index.ts`. Los consumidores importan solo desde la raíz del paquete, nunca desde rutas internas (`@piensa-it/ui-library/dist/...`).
- **shadcn/ui**: usar `npx shadcn@latest add <componente>` (components.json ya configurado) y luego adaptar colores/estructura a los tokens del proyecto antes de exportarlo.

## Convenciones

- Nombres de archivos: `kebab-case` para archivos, `PascalCase` para componentes
- Idioma del código: inglés; idioma de la UI, comentarios y JSDoc: español
- Cada componente exportado debe tener al menos un test de humo en `src/__tests__/`
- No agregar dependencias de routing, data-fetching o backend (React Query, Supabase, etc.) — esas viven en el boilerplate de cada app, no aquí

## Publicación

Se publica a **GitHub Packages** (`@piensa-it` scope) al crear un Release en GitHub sobre `main` (dispara `.github/workflows/publish.yml`). Antes de crear el Release: bump de `version` en `package.json` vía PR normal. Ver README.md > "Publicar una nueva versión".
