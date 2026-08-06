# Branching strategy

This repository uses trunk-based development with GitHub Flow.

## Permanent branches

- `main` is the only permanent branch.
- `main` must remain releasable and is never committed to directly.
- Releases are immutable tags created from commits already merged into `main`.
- There is no permanent `develop`, `release`, or `hotfix` branch.

## Short-lived branches

Create branches from an up-to-date `main` and delete them after merge:

```text
feat/123-motion-duration
fix/248-dialog-focus
docs/91-installation-guide
refactor/ark-select-anatomy
chore/update-storybook
```

Allowed prefixes are `feat`, `fix`, `docs`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `release`, and `hotfix`. Include the issue number when
one exists. Keep branches focused and short-lived; split unrelated outcomes
into separate pull requests.

## Commits and pull requests

Commits and PR titles follow Conventional Commits:

```text
feat(motion): add configurable repetition
fix(dialog): restore focus after closing
docs: explain public package installation
```

Use `!` for a breaking change and explain its migration path in the PR:

```text
feat(tokens)!: rename the legacy accent token
```

Each pull request records its author automatically and must explain the problem,
the proposed outcome, validation evidence, and compatibility impact. Link the
requesting issue with `Closes #123` or record context with `Refs #123`.

## Merge and release policy

- Use squash merge so the validated PR title becomes the commit on `main`.
- Require CI, one approving review, and resolved conversations.
- Dismiss stale approvals after new commits.
- Require linear history and block force pushes and branch deletion on `main`.
- Delete the source branch after merge.
- Create releases from `main` only; urgent fixes use a short-lived `hotfix/*`
  branch and follow the same PR checks.

## Version tags

- Stable releases use immutable annotated tags in the form `vX.Y.Z`.
- The tag must exactly match the version in `package.json`.
- Pre-releases may use tags such as `v1.2.0-beta.1`.
- Create the tag through a GitHub Release after the version PR reaches `main`.
- Never move or reuse an existing release tag. A correction requires a new
  patch version.
