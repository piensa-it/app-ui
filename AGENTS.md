# @piensa-it/ui-library — Contexto del proyecto

> Este repo (`app-ui`) dejó de ser la app "Mis Finanzas". Ahora es la **librería de componentes UI** compartida de Piensa IT, instalable vía npm en los demás repos (MisFin, Lynx, etc.). No contiene lógica de negocio, auth ni Supabase — eso vive en el repo de cada aplicación.

## Stack

- **Frontend**: React 18 + TypeScript 5.8 + Vite 5 (SWC), en **modo librería** (no SPA)
- **Componentes**: [Ark UI](https://ark-ui.com) (`@ark-ui/react`, headless — mismo linaje que Chakra UI, construido sobre Zag.js), temado 100% con Tailwind directamente sobre sus atributos `data-scope`/`data-part`/`data-state` (sin capa de indirección tipo `pt`). Componentes de datos que Ark UI no cubre: `DataTable` sobre **TanStack Table** (headless) y `Chart` sobre **Recharts** (SVG, tematizable con CSS variables — a diferencia de Chart.js/canvas). Los componentes simples (Button, Card, Badge, Input) siguen siendo Tailwind puro.
- **Estilos**: Tailwind CSS 3, tokens vía CSS variables (theming por marca)
- **Documentación**: Storybook 10 — sitio público en https://piensait-ui.netlify.app, autodesplegado por Netlify en cada push a `main`
- **Tests**: Vitest 4 + Testing Library
- **Empaquetado**: `vite-plugin-dts` genera los `.d.ts`; build ESM + CJS

## Comandos clave

```bash
npm run dev              # Playground de desarrollo (src/App.tsx) — NO es lo que se publica
npm run storybook         # Sitio de documentación en localhost:6006, con hot reload
npm run build             # Genera dist/ — esto es lo que se publica a GitHub Packages
npm run build-storybook    # Genera storybook-static/ — esto es lo que se publica como docs
npm run test              # Tests en modo watch
npm run test:run          # Tests una sola vez
npm run lint              # ESLint
```

## Estructura del proyecto

```
tailwind-preset.js     # preset de Tailwind publicado (tokens compartidos entre repos)
.storybook/              # config del sitio de documentación (main.ts, preview.tsx)
src/
├── index.ts            # barrel de exports públicos — ÚNICO punto de entrada del paquete
├── styles/globals.css  # tokens de diseño (CSS vars) + directivas Tailwind
├── docs/                # páginas de documentación sin componente (Introducción, Tokens)
├── components/
│   ├── providers/UiProvider.tsx  # Toaster + AlertDialogHost (sin proveedor de tema — headless)
│   ├── ui/              # primitivas simples (Tailwind puro) + wrappers Ark UI temados
│   ├── layout/           # Layout, GlobalErrorBoundary
│   └── marketing/         # PublicHeader, PublicFooter, ImageCarouselBackdrop
│       └── *.stories.tsx   # cada componente vive junto a su story
├── lib/                  # utils.ts (cn), iconConfig.ts, style-helpers.ts (focus ring, animaciones de overlay)
├── App.tsx, main.tsx      # playground de desarrollo, no se publica
└── __tests__/             # tests de componentes
```

## Patrones establecidos

- **Sin acoplamiento a negocio**: ningún componente debe hacer fetch, hardcodear textos de una marca específica, o asumir un router concreto — todo eso se recibe por props (ver `PublicHeader`/`PublicFooter`, que reciben un `linkComponent` inyectable en vez de importar `react-router-dom` directamente).
- **Sin colores hardcodeados**: todo color usa clases Tailwind mapeadas a CSS variables (`bg-primary`, `text-muted-foreground`, `bg-success`...) definidas en `src/styles/globals.css`. Nunca un hex/rgb directo en un componente.
- **Export único**: cualquier componente nuevo se agrega a `src/index.ts`. Los consumidores importan solo desde la raíz del paquete, nunca desde rutas internas (`@piensa-it/ui-library/dist/...`).
- **Ark UI, verificar antes de tematizar**: cada componente headless de Ark expone sus propios atributos `data-scope`/`data-part`/`data-state` (documentados, pero variables entre componentes — ej. `data-selected` en Tabs pero `data-state="checked"` en Select). Antes de escribir el tema Tailwind de un componente nuevo, verifica la anatomía real: `node_modules/@ark-ui/react/dist/components/<componente>/<componente>.d.ts` (props de cada parte) y `grep -rho "data-[a-z-]*" node_modules/@zag-js/<componente>/dist/*.js` (atributos que realmente se renderizan). Adivinar el nombre de un atributo fue la causa de varios bugs visuales durante la migración desde PrimeReact — no repetir ese error.
- **Todo componente exportado tiene story**: `<componente>.stories.tsx` junto al componente, `tags: ["autodocs"]`, `title: "<Categoría>/<Componente>"`. Sin story, el componente no aparece en la documentación pública — no lo consideres "terminado" hasta que tenga una.

## Convenciones

- Nombres de archivos: `kebab-case` para archivos, `PascalCase` para componentes
- Idioma del código: inglés; idioma de la UI, comentarios y JSDoc: español
- Cada componente exportado debe tener al menos un test de humo en `src/__tests__/` y una story en su carpeta
- No agregar dependencias de routing, data-fetching o backend (React Query, Supabase, etc.) — esas viven en el boilerplate de cada app, no aquí

## Publicación

- **Paquete npm**: se publica a **GitHub Packages** (`@piensa-it` scope) al crear un Release en GitHub sobre `main` (dispara `.github/workflows/publish.yml`). Antes de crear el Release: bump de `version` en `package.json` vía PR normal. Ver README.md > "Publicar una nueva versión".
- **Sitio de documentación**: se redespliega solo, en cada push a `main` (sitio Netlify `piensait-ui`, config en `netlify.toml`), sin necesidad de release ni bump de versión — siempre refleja el código fuente actual.
