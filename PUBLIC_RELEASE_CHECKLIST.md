# Public release checklist

The repository is already public (`piensa-it/app-ui`, MIT license, first
release `v0.1.0` on 2026-07-31; latest is `v0.13.0`). The "flip visibility"
decision this list was written for is done and cannot be undone by finishing
the rest of it. What's left below is real, unfinished hardening — verified
against the live repository (`gh repo view`, `gh api
repos/piensa-it/app-ui`, branch protection, security-and-analysis settings)
rather than assumed — so the list stays as a follow-up backlog instead of
being retired. Checkboxes reflect what is actually configured today, not
intent.

## Required before changing repository visibility

- [x] Approve and add the root MIT source-code license
- [ ] Review the complete Git history for secrets and private material
- [ ] Replace remaining internal product names in public-facing documentation
- [ ] Enable GitHub private vulnerability reporting — currently disabled
      (`private_vulnerability_reporting.enabled: false`)
- [ ] Confirm repository description, topics, and social preview image — the
      description is set, but `topics` is empty and there is no homepage URL
- [ ] Protect `main`: require PRs, one approval, resolved conversations, CI,
      linear history, and block force pushes/deletion — **`main` currently
      has no branch protection at all** (`GET
      /repos/piensa-it/app-ui/branches/main/protection` → 404)
- [x] Enable squash merge — `squashMergeAllowed: true`
- [ ] Automatic source-branch deletion — still off
      (`delete_branch_on_merge: false`); merge and rebase are also still
      allowed alongside squash, so squash isn't the only merge path yet
- [ ] Enable Dependabot alerts and security updates — `dependabot.yml` runs
      version updates, but `security_and_analysis.dependabot_security_updates`
      is `disabled`; secret scanning and push protection are also disabled
- [x] Confirm the committed advanced CodeQL workflow — `security.yml` runs
      CodeQL on PRs, `main`, and weekly, and recent runs are green
- [ ] Enable immutable releases and private vulnerability reporting
- [x] Decide between GitHub Packages and npmjs for public distribution —
      GitHub Packages (`publishConfig.registry` in `package.json`)
- [ ] Verify installation from an empty React application

## First release

- [x] Merge the public-readiness changes through a reviewed pull request
- [x] Confirm CI, package verification, and Storybook deployment — Quality
      Gate, publish workflow, and Netlify docs deploy are all live
- [x] Publish `0.1.0` and test the documented installation path — released
      2026-07-31; superseded by 13 further releases since
- [x] Create a GitHub Release with highlights and compatibility notes — every
      release since `v0.1.0` ships with a highlights line
- [ ] Link Piensa IT Illustrations and the organization profile
