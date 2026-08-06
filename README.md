# Piensa IT UI Library

An accessible React component library and design-system foundation built by
[Piensa IT](https://github.com/piensa-it).

[Explore the live Storybook](https://piensait-ui.netlify.app)

The library provides reusable UI components, design tokens, layouts, data
visualization, and motion primitives without coupling applications to a router,
backend, authentication provider, or product-specific business logic.

> The public API is currently in `0.x`. Review release notes before upgrading.

## Highlights

- React 18 and strict TypeScript
- Accessible headless behavior powered by Ark UI and Zag.js
- Tailwind CSS styling through semantic CSS variables
- White-label palettes, typography, dark mode, and reusable design tokens
- TanStack Table for data grids and Recharts for SVG charts
- Motion primitives with pause and `prefers-reduced-motion` support
- ESM, CommonJS, and generated TypeScript declarations
- Interactive Storybook documentation and automated accessibility tests

## Installation

Releases are currently distributed through GitHub Packages:

```ini
# .npmrc
@piensa-it:registry=https://npm.pkg.github.com
```

Authenticate with a GitHub token that can read packages, then install:

```bash
npm install @piensa-it/ui-library
```

Import the library styles once in your application entry point:

```tsx
import "@piensa-it/ui-library/styles.css";
```

## Quick start

```tsx
import {
  Button,
  Card,
  CardContent,
  Layout,
  UiProvider,
} from "@piensa-it/ui-library";
import "@piensa-it/ui-library/styles.css";

export function App() {
  return (
    <UiProvider>
      <Layout brand={<span>Acme</span>}>
        <Card>
          <CardContent>
            <Button>Continue</Button>
          </CardContent>
        </Card>
      </Layout>
    </UiProvider>
  );
}
```

Always import public APIs from the package root. Internal paths are not part of
the compatibility contract.

## Illustrations and motion

The library owns shared motion behavior: `enter`, `float`, `point`,
`celebrate`, and `warn`, along with duration, repetition, pause, and reduced
motion policies. Artwork and composable characters live in
[Piensa IT Illustrations](https://github.com/piensa-it/app-illustrations).

```tsx
import { Illustration } from "@piensa-it/ui-library";
import { PeepBust } from "@piensa-it/illustrations";

<Illustration motion="float" size="lg">
  <PeepBust variant="coffee" title="A person enjoying coffee" />
</Illustration>;
```

## Theming

Apply a bundled palette to an application or an individual section:

```tsx
<div data-ui-palette="ocean">
  <UiProvider>{children}</UiProvider>
</div>
```

Available palettes are `indigo`, `ocean`, `violet`, `emerald`, `ruby`, and
`amber`. Available font presets are `geist`, `inter`, `dm-sans`, and `system`.

Products can define their own identity by overriding semantic tokens after the
library stylesheet:

```css
:root {
  --primary: 158 64% 32%;
  --primary-foreground: 0 0% 100%;
  --font-sans: "Your UI font", ui-sans-serif, system-ui, sans-serif;
}
```

Applications using Tailwind can also consume the published preset:

```js
import uiLibraryPreset from "@piensa-it/ui-library/tailwind-preset";

export default {
  presets: [uiLibraryPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
```

## Architecture

```text
src/
├── index.ts               # only public package entry point
├── styles/globals.css     # semantic tokens and Tailwind layers
├── docs/                  # Storybook design-system documentation
├── components/
│   ├── providers/         # global UI hosts
│   ├── ui/                # primitives and themed headless components
│   ├── layout/            # application layout foundations
│   └── marketing/         # reusable public-facing compositions
└── lib/                   # utilities and shared style recipes
```

The package never fetches data, assumes a router, or includes product-specific
copy. Those concerns stay in consuming applications and are supplied through
props or injectable components.

## Development

```bash
npm install
npm run storybook
npm run typecheck
npm run lint
npm run test:run
npm run verify:package
npm run build-storybook
```

Storybook runs at `http://localhost:6006`. The Vite playground is available
through `npm run dev`, but is not part of the published package.

Design rules are documented in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), and
component maturity is tracked in [COMPONENT_STATUS.md](./COMPONENT_STATUS.md).

## Contributing

Every exported component needs a public export from `src/index.ts`, an
autodocumented Storybook story, and at least one smoke test. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.
The repository uses trunk-based development with GitHub Flow; see
[BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md).
Quality, security, dependency, and release controls are described in
[AUTOMATION.md](./AUTOMATION.md).

## Releases

After a version bump is merged into `main`, creating a GitHub Release triggers
the package publishing workflow. Each push to `main` also refreshes the public
Storybook on Netlify.

## License and third-party software

Original Piensa IT code is available under the [MIT License](./LICENSE).
Ark UI, Zag.js, TanStack Table, Recharts, Tailwind CSS, and the other foundations
retain their own open-source licenses. See
[THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md) for roles, attribution, and
license identifiers.

## About Piensa IT

[Piensa IT](https://github.com/piensa-it) builds thoughtful digital products
and reusable foundations for teams that care about quality, accessibility, and
maintainable design systems.
