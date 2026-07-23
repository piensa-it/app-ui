# @piensa-it/ui-library

Librería de componentes UI y lineamientos de FrontEnd de **Piensa IT**. Fuente única de verdad para la capa de presentación (React + TypeScript + Tailwind CSS + Ark UI) usada en todos los sitios y aplicaciones de la compañía (MisFin, Lynx, y los que sigan).

> Este repo reemplaza al antiguo boilerplate de aplicación (`app-base-template`). Ya no contiene lógica de negocio, autenticación ni integración con Supabase — solo componentes visuales, tokens de diseño y utilidades de FrontEnd puras. Esos otros aspectos (routing, data fetching, auth) siguen viviendo en el boilerplate de cada aplicación; este repo es el "Repositorio Paralelo de Librería de Componentes" al que ese boilerplate delega toda la UI.

---

## Stack

- React 18 + TypeScript 5 (strict)
- Tailwind CSS 3 + [Ark UI](https://ark-ui.com) (headless, `@ark-ui/react`) — ver "¿Por qué Ark UI?" abajo
- [TanStack Table](https://tanstack.com/table) para `DataTable` (lógica de orden/paginación, headless)
- [Recharts](https://recharts.org) para `Chart` (SVG, tematizable con CSS variables)
- Vite 5 en modo librería (build ESM + CJS + `.d.ts` con `vite-plugin-dts`)
- Storybook 10 — sitio de documentación de componentes
- Vitest 4 + Testing Library
- framer-motion, lucide-react

### ¿Por qué Ark UI y no shadcn/ui o PrimeReact?

La librería empezó sobre shadcn/ui (Radix), pero necesitábamos componentes de datos complejos (tabla con paginación/orden, selector de fecha, gráficas, carga de archivos) que Radix no cubre out-of-the-box, así que pasó por una etapa intermedia sobre PrimeReact 10. PrimeReact resolvía la cobertura de componentes, pero su modo `unstyled` resultó frágil para tematizar 100% con Tailwind: atributos `data-*`/`aria-*` inconsistentes entre componentes, inputs nativos que había que ocultar a mano, y varios bugs de estilo descubiertos en QA visual en vivo.

**Ahora usamos [Ark UI](https://ark-ui.com)** (del equipo de Chakra UI, construido sobre máquinas de estado de Zag.js): headless igual que Radix, pero con un contrato de atributos `data-scope`/`data-part`/`data-state` **consistente y documentado** en todos los componentes — se tematiza directamente con variantes de Tailwind (`data-[state=open]:...`) sin ninguna capa de indirección tipo `pt`. Cubre casi todo lo que cubría PrimeReact (Select, Combobox, DatePicker, Dialog, Popover, Accordion, Tabs, FileUpload, Toast...). Lo único que Ark UI no trae es tabla de datos y gráficas — para eso se suman **TanStack Table** (headless, el estándar de facto) y **Recharts** (SVG real, se tematiza con las mismas CSS variables del resto de la librería — a diferencia de Chart.js, que dibuja en `<canvas>` y no puede leer clases/variables de Tailwind).

## Documentación de componentes

**https://piensait-ui.netlify.app** — catálogo navegable de todos los componentes, categorizado (**UI**, **Layout**, **Marketing**), con ejemplos en vivo, controles interactivos para probar props, tabla de props autogenerada desde TypeScript, y una página de **Tokens** con la paleta de colores/tipografía/radios. Es la fuente de verdad de "cómo se ve e implementa cada componente" — los demás repos (MisFin, Lynx, etc.) enlazan a esta URL desde su nav/footer para que cualquier persona del equipo (no solo devs) pueda consultarla.

Se genera con [Storybook](https://storybook.js.org/) a partir del código fuente de `src/` (no del paquete publicado en npm), y se **redespliega automáticamente en cada push a `main`** vía Netlify (sitio `piensait-ui`, configurado por `netlify.toml`: build `npm run build-storybook`, publish `storybook-static`). Es un flujo totalmente aparte del paquete npm — no requiere versión ni Release.

Las decisiones normativas del sistema viven en [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
y el inventario de madurez y hoja de ruta en
[COMPONENT_STATUS.md](./COMPONENT_STATUS.md).

## Instalación en otro repo

La librería se publica como paquete privado en **GitHub Packages** bajo el scope `@piensa-it`.

1. En el repo consumidor, crea (o edita) `.npmrc` en la raíz:

   ```
   @piensa-it:registry=https://npm.pkg.github.com
   ```

2. Autenticación (una vez por máquina/CI): exporta un token de GitHub con permiso `read:packages` como `NODE_AUTH_TOKEN`, o corre `npm login --scope=@piensa-it --registry=https://npm.pkg.github.com`.

3. Instala:

   ```bash
   npm install @piensa-it/ui-library
   ```

## Uso

```tsx
// una sola vez, en el entrypoint de la app (main.tsx / _app.tsx)
import "@piensa-it/ui-library/styles.css";
```

Envuelve tu app en `UiProvider` — monta el `Toaster` y el `AlertDialogHost` globales (no hace falta agregarlos aparte). Como todos los componentes son headless (Ark UI), no hace falta ningún setup de tema adicional: el look sale de las CSS variables importadas en `styles.css`.

```tsx
import { UiProvider, Button, Card, CardContent, Layout } from "@piensa-it/ui-library";

function App() {
  return (
    <UiProvider>
      <Layout brand={<span>Mi Producto</span>}>
        <Card>
          <CardContent>
            <Button>Continuar</Button>
          </CardContent>
        </Card>
      </Layout>
    </UiProvider>
  );
}
```

Importa siempre desde la raíz del paquete (`@piensa-it/ui-library`), nunca desde rutas internas — así podemos reorganizar la librería sin romper a los consumidores.

## Theming por marca (white-labeling)

Los componentes no tienen colores hardcodeados: todo sale de variables CSS (`--primary`, `--background`, `--success`, etc. — ver `src/styles/globals.css`). Cada producto sobreescribe esas variables con su propia paleta, sin tocar un solo componente:

La librería incluye seis paletas listas para usar. Aplica el atributo en un
ancestro de la aplicación o de una sección concreta:

```tsx
<div data-ui-palette="ocean">
  <UiProvider>{children}</UiProvider>
</div>
```

Valores disponibles: `indigo`, `ocean`, `violet`, `emerald`, `ruby` y `amber`.
La paleta modifica identidad, foco, selección y énfasis; no cambia el significado
universal de `success`, `warning` o `destructive`.

Para una identidad completamente propia, sobreescribe los tokens:

```css
/* estilos globales de tu app, después de importar styles.css de la librería */
:root {
  --primary: 158 64% 32%;           /* verde MisFin, por ejemplo */
  --primary-foreground: 0 0% 100%;
}
```

La tipografía predeterminada usa Geist Variable. También se incluyen Inter,
DM Sans y la fuente del sistema. Selecciona una familia en el ancestro:

```tsx
<div data-ui-font="inter">{children}</div>
```

Valores disponibles: `geist`, `inter`, `dm-sans` y `system`. Una aplicación
también puede reemplazar los tokens sin modificar componentes:

```css
:root {
  --font-sans: "Mi fuente de interfaz", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Mi fuente de marca", var(--font-sans);
}
```

La escala semántica se publica en el preset como `text-ui-caption`,
`text-ui-body-sm`, `text-ui-body`, `text-ui-title-sm`, `text-ui-title` y
`text-ui-display`.

## Iconos

La librería expone un catálogo curado de Lucide directamente desde su raíz:

```tsx
import { Icon, IconTile, SearchIcon, SuccessIcon } from "@piensa-it/ui-library";

<Icon icon={SearchIcon} size="lg" label="Buscar" />
<Icon icon={SearchIcon} size={28} strokeWidth={1.75} absoluteStrokeWidth />
<IconTile
  icon={SuccessIcon}
  containerSize="lg"
  variant="outline"
  shape="rounded"
  color="success"
/>
```

Los aliases terminan en `Icon` para no colisionar con componentes como `Chart`.
`Icon` normaliza tamaños y colores; `IconTile` añade fondos semánticos.
Los tamaños disponibles son `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl` y
`3xl`. Para necesidades puntuales, `size` también acepta una medida numérica
en píxeles; `strokeWidth` controla el grosor y `absoluteStrokeWidth` mantiene
ese grosor visual al escalar.
`IconTile` permite `variant="soft | outline | elevated | ghost"` y
`shape="square | rounded | circle"` para elegir entre fondos suaves, cuadrados
bordeados, superficies elevadas o contenedores circulares.

Si tu app usa Tailwind y quiere usar los mismos tokens (`bg-primary`, `text-muted-foreground`...) en SU PROPIO código, no solo en los componentes de la librería, extiende nuestro preset en vez de redefinir los colores:

```js
// tailwind.config.js de la app consumidora
import uiLibraryPreset from "@piensa-it/ui-library/tailwind-preset";

export default {
  presets: [uiLibraryPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

## Desarrollo local

```bash
npm install
npm run dev               # playground en localhost:8080 (prueba rápida y sucia)
npm run storybook          # sitio de documentación en localhost:6006 (con hot reload)
npm run test                # tests en watch mode
npm run lint
npm run build                # genera dist/ (lo que se publica a npm)
npm run build-storybook       # genera storybook-static/ (lo que se publica como docs)
```

`npm run dev` NO es lo que se publica — sirve únicamente para previsualizar componentes mientras se desarrollan (`src/App.tsx`). El paquete publicado se genera a partir de `src/index.ts` en modo build. `npm run storybook` es el modo recomendado para desarrollar un componente nuevo: cada story es un caso de uso documentado, con controles para probar props sin escribir código.

## Estructura

```
tailwind-preset.js       # preset de Tailwind publicado (tokens compartidos)
.storybook/               # config del sitio de documentación (main.ts, preview.tsx)
src/
├── index.ts              # barrel de exports públicos — único punto de entrada del paquete
├── styles/globals.css     # tokens de diseño (CSS vars) + directivas Tailwind
├── docs/                  # páginas de documentación sin componente (Introducción, Tokens)
├── components/
│   ├── providers/UiProvider.tsx  # Toaster + AlertDialogHost (sin proveedor de tema — headless)
│   ├── ui/                # primitivas simples (Tailwind puro) + wrappers Ark UI temados (Select, Dialog, DataTable con TanStack, Chart con Recharts...)
│   ├── layout/             # Layout, GlobalErrorBoundary
│   └── marketing/          # PublicHeader, PublicFooter, ImageCarouselBackdrop
│       └── *.stories.tsx    # cada componente vive junto a su story de Storybook
├── lib/
│   ├── utils.ts             # cn() — merge de clases Tailwind
│   ├── style-helpers.ts       # constantes de estilo compartidas (focus ring, animaciones de overlay...)
│   └── iconConfig.ts         # mapa de clases para tamaños/colores de íconos
├── App.tsx, main.tsx         # playground de desarrollo (no se publica)
└── __tests__/                # tests de componentes
```

## Agregar un nuevo componente

1. Si es un wrapper sobre un componente de [Ark UI](https://ark-ui.com/docs/components), créalo en `src/components/ui/`: importa el namespace del componente (`import { X as ArkX } from "@ark-ui/react/x"`), compón sus partes (`Root`, `Trigger`, `Content`...) y tematízalas con clases Tailwind sobre los atributos `data-*` que expone cada parte. **Antes de escribir el componente, verifica la anatomía y los atributos reales** — no los adivines: revisa `node_modules/@ark-ui/react/dist/components/<componente>/<componente>.d.ts` (props exactas de cada parte) y `node_modules/@zag-js/<componente>/dist/*.d.ts` (`data-*` que realmente se renderizan, vía `grep -rho "data-[a-z-]*"`). Adivinar el nombre de un atributo fue la causa de varios bugs visuales durante la migración desde PrimeReact.

2. Si es un componente propio (no de Ark UI), créalo en `src/components/<categoría>/`, sin dependencias de negocio (nada de fetch a Supabase, rutas hardcodeadas, textos de una marca específica) — todo eso se recibe por props.

3. Expórtalo desde `src/index.ts`.

4. Agrega al menos un test de humo en `src/__tests__/`.

5. Agrega un `<componente>.stories.tsx` junto al componente (ver los existentes como referencia), con `tags: ["autodocs"]` y `title: "<Categoría>/<Componente>"` (`UI`, `Layout` o `Marketing` — o una categoría nueva si aplica). Corre `npm run storybook` para verlo en vivo antes de subir el PR: sin story, el componente no aparece en la documentación y nadie más del equipo sabrá que existe.

## Publicar una nueva versión

1. PR que actualiza `"version"` en `package.json` (semver) + los cambios.
2. Merge a `main`.
3. Crear un **Release** en GitHub sobre ese commit (el tag lo crea el Release). Esto dispara `.github/workflows/publish.yml`, que corre lint + tests + build y publica a GitHub Packages.

## Calidad

`.github/workflows/ci.yml` corre en cada PR: `npm audit`, lint, `tsc --noEmit`, tests y build. Un PR no debería mergearse si alguno falla.
