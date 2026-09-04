# Piensa IT UI Library

An accessible React component library and design-system foundation built by
[Piensa IT](https://github.com/piensa-it).

[Explore the live Storybook](https://piensait-ui.netlify.app)

The library provides reusable UI components, design tokens, layouts, data
visualization, and motion primitives without coupling applications to a router,
backend, authentication provider, or product-specific business logic.

> The public API is currently in `0.x`. Review release notes before upgrading.

## Highlights

- React 18 and 19, with strict TypeScript
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

The bundled fonts (Geist, Inter, DM Sans) ship as a separate stylesheet, so an
application with its own typography does not pay for them. Import it only if
you use one of the bundled font presets:

```tsx
import "@piensa-it/ui-library/fonts.css";
```

### Cost

The package ships one module per source file, so a bundler only keeps what an
application imports. Measured on a Vite build that imports a single component:

| | 0.2.1 | 0.3.0 |
|---|---|---|
| Library code pulled in by `Button` | ~140 KB (whole package) | 2.8 KB |
| Library code pulled in by `DatePicker` | ~140 KB (whole package) | 10.8 KB |
| `styles.css` | 211 KB | 58 KB |

Third-party dependencies (`tailwind-merge`, `lucide-react`, Ark UI) are not
counted: they are resolved from the application's own `node_modules`.

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

### What a theme may move

Colour tokens are not all the same kind of thing, and the two that read alike
are the ones that cost the most: `--primary` is identity, `--accent` is the grey
of interaction — the background of ghost-button and menu-item hovers. A palette
that moves `--accent` turns every hover into saturated brand colour with
unreadable grey text inside.

| Class | Themable | Tokens |
|---|---|---|
| **Identity** | **yes** | `--primary`, `--primary-foreground`, `--ring`, `--subtle`, `--subtle-hover`, `--subtle-foreground`, `--chart-1` |
| Universal meaning | no | `--destructive`, `--success`, `--warning`, `--overlay`, `--shadow-color` |
| Interaction state | no | `--accent`, `--muted`, `--secondary` (and their foregrounds) |
| Structure | no | `--ground`, `--surface`, `--raised`, `--border`, `--input`, `--card`, `--popover` |
| Sidebar | no | `--sidebar-*` — its own plane, picked with `AppShell`'s `variant` |

Seven tokens. Everything else belongs to the system, not to the brand. Do not
forget `--ring`: leave it out and the focus ring stays the factory colour, the
one place on screen that never hears about the theme.

For a brand that is none of the six bundled palettes, `createPalette` builds the
seven from one colour. The tokens that must not move are not in its signature,
so they cannot be moved by accident:

```tsx
import { createPalette } from "@piensa-it/ui-library";

<div style={createPalette({ primary: "158 64% 32%" })}>
  <UiProvider>{children}</UiProvider>
</div>
```

With a runtime colour picker and a dark theme, an inline style cannot react to
`.dark`; use `paletteDeclarations` to write both into a rule instead.

Both halves of the theme — `:root` and `.dark` — ship inside `@layer base`, so
an application can override either one from its own `@layer base` and win. Until
0.6.0 the `.dark` block sat outside every layer, and since unlayered CSS always
beats layered CSS, an application's dark theme lost against the library's.

### Spacing scale

The spacing steps carry a `ui-` prefix: `p-ui-md`, `gap-ui-sm`, `-mt-ui-lg`.
The role names do not: `p-inset`, `space-y-stack`, `gap-field`.

The prefix is not cosmetic. In Tailwind 4 the spacing namespace always wins over
the container namespace, so a spacing key named `md` takes `max-w-md`, `w-md`,
`min-w-md` and `basis-md` with it — `max-w-2xl` resolved to 3rem instead of
42rem, with no warning and no compile error. Nothing overrides it: not
`theme.maxWidth`, not `@theme { --container-* }`, not `@utility`, not a plugin.
Not colliding in the first place is the only fix.

So `max-w-*` and friends are plain Tailwind again, and always were meant to be.
Upgrading from 0.5.0 or earlier, rename your spacing classes with the codemod:

```bash
node node_modules/@piensa-it/ui-library/scripts/codemod-espaciado.mjs "src/**/*.{ts,tsx,css}"
```

Pass `--dry` first to see what it would touch. It rewrites only the prefixes
that read the spacing scale, and deliberately leaves `max-w-*`, `w-*` and
`min-w-*` alone — those are the ones that start working again.

Applications using Tailwind can also consume the published preset:

```js
import uiLibraryPreset, { content as uiLibraryContent } from "@piensa-it/ui-library/tailwind-preset";

export default {
  presets: [uiLibraryPreset],
  content: [...uiLibraryContent, "./src/**/*.{ts,tsx}"],
};
```

`uiLibraryContent` points at the library's published modules and is required,
not optional. Tailwind 3 does not inherit `content` from a preset, so it has to
be spread explicitly.

Without it, the application and the library end up generating utilities in two
separate passes, and the order of the resulting CSS decides which one wins: a
plain utility written by the application (`.text-center`) is emitted *after* a
variant that belongs to the library (`sm:text-left` on `DialogHeader`) and
overrides it, regardless of specificity. Listing the library's modules puts
both in the same pass, where Tailwind's own ordering applies again.

## Overlays and third-party layers

`Dialog` and `Sheet` own their `open` state through the application. Two Zag
defaults are vetoed on purpose: closing a lower layer no longer cascades to the
layers above it (`onRequestDismiss`), and focus returning from another layer is
not treated as "focus outside" (`onFocusOutside`). Your handlers still run
first. Escape and clicking the backdrop keep closing the overlay.

`persistentElements` only works for elements that already exist when the
dialog opens: Zag waits about one second for the getter to return a node and
then rejects the promise, which logs an error on every open. For poppers that
mount later (a Radix `DropdownMenu`, an external datepicker) veto the dismissal
in `onInteractOutside` when the target lives inside that layer:

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  onInteractOutside={(event) => {
    const target = event.detail.target as Element | null;
    if (target?.closest("[data-radix-popper-content-wrapper]")) event.preventDefault();
  }}
/>
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

### Browser and visual tests

`npm run test:browser` runs them against your own machine's rendering. CI runs
them on Linux, and the two do not rasterise text the same way, so each platform
compares against its own baselines (`*-darwin.png`, `*-linux.png`).

To reproduce exactly what CI will see, run them inside the official Playwright
image — same Linux, same Chromium, same version as the runner:

```bash
npm run test:browser:docker           # check
npm run test:browser:docker:update    # regenerate the Linux baselines
npm run test:browser:docker -- -g armazon
```

The baselines it writes are byte-identical to the ones the CI runner produces,
which is what makes it worth the container: a visual change no longer needs a
push, a failed gate and an artifact download to get its Linux baseline. It also
means a red gate can be reproduced locally instead of guessed at.

Dependencies are installed into a Docker volume rather than the repository's
`node_modules`, because the esbuild and rolldown binaries macOS installs do not
run on Linux. They are reinstalled only when `package-lock.json` changes.

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

Version bumps no longer touch the visual baselines. Until 0.6.0 the sidebar
footer printed the library version, so every release shifted three shell
screenshots; `AppVersion` now shows only the application's own version, and
the library version moved behind `details`, for a help screen.

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
