# Contributing

Thanks for contributing to Piensa IT UI Library.

Development follows [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md). Create a
short-lived branch from `main`, use Conventional Commits, and open a pull
request. Direct pushes to `main` are not part of the workflow.

## Design principles

- Keep components independent from business logic, routers, backends, and
  product-specific copy.
- Use semantic design tokens instead of hardcoded colors.
- Preserve keyboard, screen-reader, reduced-motion, and focus behavior.
- Check the actual Ark UI and Zag.js anatomy before styling `data-*` states.
- Treat exports from `src/index.ts`, CSS tokens, and the Tailwind preset as
  public compatibility contracts.

## Component checklist

Every exported component must include:

- implementation and TypeScript props;
- an export from `src/index.ts`;
- a colocated Storybook story with `tags: ["autodocs"]`;
- at least one smoke test under `src/__tests__/`;
- accessible states and documentation for non-obvious behavior.

## Local validation

```bash
npm install
npm run storybook
npm run typecheck
npm run lint
npm run test:run
npm run test:browser
npm run verify:package
npm run build-storybook
```

Pull requests that change visuals should include screenshots or a recording.
Call out breaking API, token, preset, or peer-dependency changes explicitly.
