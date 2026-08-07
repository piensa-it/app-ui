# Repository automation

The public repository uses four free automation pillars.

## 1. Quality Gate

Runs on every pull request and on pushes to `main`. It validates PR metadata,
production dependency health, lint, TypeScript, tests, package boundaries,
bundle budgets, and the Storybook build.
The Browser Gate uses Playwright and Chromium to exercise Ark UI behavior,
reduced-motion policies, and selected visual baselines.

## 2. Security

CodeQL scans JavaScript and TypeScript on pull requests, `main`, and weekly.
Dependency Review blocks newly introduced dependencies with moderate-or-higher
known vulnerabilities. Production dependencies are also checked by `npm audit`.

## 3. Dependabot

Checks npm packages and GitHub Actions weekly. Compatible minor and patch npm
updates are grouped to reduce PR noise. Every automated PR still passes the
same Quality Gate and Security checks as a human contribution.

## 4. Release integrity

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
