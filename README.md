# @piensa-it/ui-library

Librería de componentes UI y lineamientos de FrontEnd de **Piensa IT**. Fuente única de verdad para la capa de presentación (React + TypeScript + Tailwind CSS + shadcn/ui) usada en todos los sitios y aplicaciones de la compañía (MisFin, Lynx, y los que sigan).

> Este repo reemplaza al antiguo boilerplate de aplicación (`app-base-template`). Ya no contiene lógica de negocio, autenticación ni integración con Supabase — solo componentes visuales, tokens de diseño y utilidades de FrontEnd puras. Esos otros aspectos (routing, data fetching, auth) siguen viviendo en el boilerplate de cada aplicación; este repo es el "Repositorio Paralelo de Librería de Componentes" al que ese boilerplate delega toda la UI.

---

## Stack

- React 18 + TypeScript 5 (strict)
- Tailwind CSS 3 + shadcn/ui (Radix UI + class-variance-authority)
- Vite 5 en modo librería (build ESM + CJS + `.d.ts` con `vite-plugin-dts`)
- Vitest 4 + Testing Library
- framer-motion, lucide-react

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

```tsx
import { Button, Card, CardContent, Layout } from "@piensa-it/ui-library";

function Example() {
  return (
    <Layout brand={<span>Mi Producto</span>}>
      <Card>
        <CardContent>
          <Button>Continuar</Button>
        </CardContent>
      </Card>
    </Layout>
  );
}
```

Importa siempre desde la raíz del paquete (`@piensa-it/ui-library`), nunca desde rutas internas — así podemos reorganizar la librería sin romper a los consumidores.

## Theming por marca (white-labeling)

Los componentes no tienen colores hardcodeados: todo sale de variables CSS (`--primary`, `--background`, `--success`, etc. — ver `src/styles/globals.css`). Cada producto sobreescribe esas variables con su propia paleta, sin tocar un solo componente:

```css
/* estilos globales de tu app, después de importar styles.css de la librería */
:root {
  --primary: 158 64% 32%;           /* verde MisFin, por ejemplo */
  --primary-foreground: 0 0% 100%;
}
```

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
npm run dev      # levanta un playground en localhost:8080 con todos los componentes
npm run test      # tests en watch mode
npm run lint
npm run build     # genera dist/ (lo que se publica)
```

`npm run dev` NO es lo que se publica — sirve únicamente para previsualizar componentes mientras se desarrollan (`src/App.tsx`). El paquete publicado se genera a partir de `src/index.ts` en modo build.

## Estructura

```
tailwind-preset.js       # preset de Tailwind publicado (tokens compartidos)
src/
├── index.ts              # barrel de exports públicos — único punto de entrada del paquete
├── styles/globals.css     # tokens de diseño (CSS vars) + directivas Tailwind
├── components/
│   ├── ui/                # primitivas shadcn/ui (Button, Card, Badge, Input, Separator...)
│   ├── layout/             # Layout, GlobalErrorBoundary
│   └── marketing/          # PublicHeader, PublicFooter, ImageCarouselBackdrop
├── lib/
│   ├── utils.ts             # cn() — merge de clases Tailwind
│   └── iconConfig.ts         # mapa de clases para tamaños/colores de íconos
├── App.tsx, main.tsx         # playground de desarrollo (no se publica)
└── __tests__/                # tests de componentes
```

## Agregar un nuevo componente

1. Si es una primitiva shadcn/ui nueva (Dialog, Select, Tabs...), usa el CLI de shadcn — `components.json` ya está configurado:

   ```bash
   npx shadcn@latest add dialog
   ```

   Revisa el resultado antes de commitear: quita cualquier color hardcodeado y usa los tokens del theme (`bg-primary`, `text-muted-foreground`, etc.) en vez de valores fijos.

2. Si es un componente propio (no de shadcn), créalo en `src/components/<categoría>/`, sin dependencias de negocio (nada de fetch a Supabase, rutas hardcodeadas, textos de una marca específica) — todo eso se recibe por props.

3. Expórtalo desde `src/index.ts`.

4. Agrega al menos un test de humo en `src/__tests__/`.

## Publicar una nueva versión

1. PR que actualiza `"version"` en `package.json` (semver) + los cambios.
2. Merge a `main`.
3. Crear un **Release** en GitHub sobre ese commit (el tag lo crea el Release). Esto dispara `.github/workflows/publish.yml`, que corre lint + tests + build y publica a GitHub Packages.

## Calidad

`.github/workflows/ci.yml` corre en cada PR: `npm audit`, lint, `tsc --noEmit`, tests y build. Un PR no debería mergearse si alguno falla.
