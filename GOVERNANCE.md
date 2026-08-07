# Governance

Piensa IT maintains this library as shared production infrastructure. Public
access allows anyone to inspect, fork, and propose changes; it does not grant
permission to push to `main` or publish packages.

## Decision authority

The maintainers listed in [`.github/CODEOWNERS`](./.github/CODEOWNERS) own the
public API, design tokens, package boundaries, security posture, and release
decisions. A maintainer may reject a compatible implementation when its
maintenance, accessibility, performance, or product risk is too high.

Automated and AI-assisted reviews are advisory. They can identify risks and
block a required status check, but they never replace the required CODEOWNER
approval.

## Change path

Every change follows this path:

1. An issue or request explains the reusable need.
2. A short-lived branch proposes the implementation through a pull request.
3. Required CI, security, package, browser, and visual checks pass.
4. A CODEOWNER reviews compatibility and resolves all conversations.
5. GitHub merges the approved pull request into protected `main`.
6. A separate version pull request updates `package.json` when a release is
   needed.
7. An authorized maintainer publishes a GitHub Release from `main`.
8. The protected `package-release` environment requires manual approval before
   GitHub Packages receives the package.

Direct pushes, force pushes, and branch deletion are not part of the normal
workflow. Emergency bypass access is limited to repository administrators and
must be followed by an issue describing the reason and remediation.

## Compatibility policy

Exports from `src/index.ts`, component props, semantic CSS tokens, the Tailwind
preset, peer-dependency ranges, accessibility behavior, and documented visual
states are public contracts.

- **Patch:** compatible fixes, documentation, tests, and visual corrections.
- **Minor:** backward-compatible components, props, tokens, or capabilities.
- **Major:** removals, renames, incompatible behavior, or changed requirements.

Breaking changes require an issue, migration notes, updated stories and tests,
and an explicit major-version release. Deprecation before removal is preferred.

## Repository rules

The `main` ruleset must require pull requests, CODEOWNER approval, dismissal of
stale approvals, approval after the latest push, resolved conversations, and
the following status checks:

- `pull-request-policy`
- `quality-gate`
- `browser-gate`
- `dependency-review`
- `CodeQL`

The ruleset must block force pushes and deletion, require linear history, and
apply to administrators. Only the smallest emergency-maintainer group may have
bypass permission.

## Consumer safety

A published package is never deployed automatically to a consuming
application. Consumers should commit their lockfile, receive upgrades through
reviewed dependency pull requests, and run application-level tests before
deployment. Production applications should not install an unpinned `latest`
version during deployment.
