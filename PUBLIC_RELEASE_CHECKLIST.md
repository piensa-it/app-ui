# Public release checklist

## Required before changing repository visibility

- [x] Approve and add the root MIT source-code license
- [ ] Review the complete Git history for secrets and private material
- [ ] Replace remaining internal product names in public-facing documentation
- [ ] Enable GitHub private vulnerability reporting
- [ ] Confirm repository description, topics, and social preview image
- [ ] Protect `main`: require PRs, one approval, resolved conversations, CI,
      linear history, and block force pushes/deletion
- [ ] Enable squash merge and automatic source-branch deletion
- [ ] Enable Dependabot alerts and security updates
- [ ] Enable CodeQL default setup or confirm the committed advanced workflow
- [ ] Enable immutable releases and private vulnerability reporting
- [ ] Decide between GitHub Packages and npmjs for public distribution
- [ ] Verify installation from an empty React application

## First release

- [ ] Merge the public-readiness changes through a reviewed pull request
- [ ] Confirm CI, package verification, and Storybook deployment
- [ ] Publish `0.1.0` and test the documented installation path
- [ ] Create a GitHub Release with highlights and compatibility notes
- [ ] Link Piensa IT Illustrations and the organization profile
