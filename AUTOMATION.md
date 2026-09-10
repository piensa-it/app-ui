# Repository automation

The public repository uses four free automation pillars.

## 1. Quality Gate

Runs on every pull request and on pushes to `main`. It validates PR metadata,
production dependency health, lint, TypeScript, tests, package boundaries,
bundle budgets, and the Storybook build.
The Browser Gate uses Playwright and Chromium to exercise Ark UI behavior,
reduced-motion policies, and selected visual baselines.

## 2. Security

CodeQL scans JavaScript and TypeScript on pull requests, `main`, and weekly
(`.github/workflows/security.yml`). Production dependencies are checked by
`npm audit --omit=dev --audit-level=high` in the Quality Gate
(`.github/workflows/ci.yml`). There is no Dependency Review workflow in this
repository — the only automated dependency vulnerability check is that
`npm audit` step.

## 3. Dependabot

Checks npm packages and GitHub Actions weekly. Compatible minor and patch npm
updates are grouped to reduce PR noise. Every automated PR still passes the
same Quality Gate and Security checks as a human contribution.

## 4. Release integrity

The pull request that bumps `version` in `package.json` runs one check no other
pull request runs: `release-gate` executes `npm run verify:react18`. It installs
React 18, type-checks the library, runs the suite, and compiles a real consumer
`.tsx` against the built `dist/` with `@types/react` 18. `peerDependencies`
declares `^18.3.1 || ^19.0.0`, and a support nobody exercises is a support in
name only — that is how the library stopped compiling under React 18 types for
three versions without anyone noticing (#172). It is deliberately not on every
push: the impact was measured, and `dist/index.d.ts` came out byte-identical
with and without that break, so no consumer ever received anything broken. When
the library becomes React 19 only (#174), this job goes away.

A published GitHub Release must use a semantic tag such as `v1.2.3` that
exactly matches `package.json`. The workflow checks out that immutable tag,
verifies that its commit belongs to `main`, repeats all package validation, and
only then requests permission to publish to GitHub Packages through the
protected `package-release` environment.

Repository administrators must configure that environment with required
maintainers and prevent administrators from bypassing its approval rule. An
approval authorizes one release execution; it does not authorize future
releases.

Repository administrators must additionally enable Dependabot alerts and
security updates, private vulnerability reporting, code scanning, and immutable
releases in GitHub Settings.
