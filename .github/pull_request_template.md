## Changes


## Checklist
- [ ] Target branch is correct
  - Feature or fix: `development` (squash merge)
  - Release (`release/X.Y.Z`) or hotfix (`hotfix/*`): `main` (merge commit, then back-merge `main` into `development`)
- [ ] Updated CHANGELOG.md
- [ ] Version bumped in package.json (if releasing)
  - Beta, into `development`: `X.Y.Z-beta.N` (e.g., `2.0.0-beta.4`)
  - Stable, into `main`: `X.Y.Z` (e.g., `2.0.0`)
