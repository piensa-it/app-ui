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

Checks npm packages and GitHub Actions monthly. Compatible minor and patch npm
updates are grouped to reduce PR noise. Playwright is excluded: it is upgraded
by hand together with the CI image and the Linux snapshots. Dependabot PRs do
not run tests in Actions; to merge one, check it out, run `npm run pruebas` and
push the signed `.pruebas-evidencia.json` (see DEPLOYMENT.md).

## 4. Release integrity

`verify:react18` (#172) is part of `npm run pruebas`, so every signed change
proves React 18 still works. `publish.yml` refuses to publish a Release whose
commit has no valid signature. When the library becomes React 19 only (#174),
that step goes away.

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
