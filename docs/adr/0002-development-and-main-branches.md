# Betas ship from `development`, stable releases from `main`

Until v2.2.0, this repo used trunk-based development. Every feature PR was
squash-merged into `main`, and both beta and stable versions published from
`main`. Work that had not passed QA could not be kept out of a stable release,
because the only way to release was to release everything on `main`.

We split the trunk into two long-lived branches. `development` is the default
branch. It takes every feature PR, and its beta versions publish to the `beta`
dist-tag. `main` takes only release and hotfix PRs, and its stable versions
publish to `latest`. `publish.yml` enforces this split by branch.

A stable release goes through a `release/X.Y.Z` branch. Normally that branch is
cut from `development`, so it promotes everything there. When only some
features passed QA, the branch is cut from `main` and the passing features are
cherry-picked into it. After every release or hotfix, `main` is merged back
into `development`.

To start the model, `main` was reset to the v2.1.0 release commit (`0d77b92`).
The 2.2.0 beta work (#22, #23) now lives only on `development`, and the
line-ending change (#24) was landed on `main` again.

## Considered Options

**Stay on trunk-based development and use feature flags.** Rejected. It keeps
one branch, but every unfinished feature then needs a flag in a client library
that has no flag system.

**Full Git Flow, with a release branch for every version that receives
fixes during QA.** Partly adopted. We use release branches, but QA happens on
the betas published from `development`, not on the release branch.

**Revert the beta commits on `main` instead of resetting it.** Rejected. The
back-merge of `main` into `development` would carry the reverts along and
remove the features from `development`.

## Consequences

- Release and back-merge PRs must use a merge commit. The `main` and
  `development` rulesets allow merge and squash, and no longer require linear
  history.
- A missed back-merge shows up as conflicts on `package.json` and
  `CHANGELOG.md` in the next release.
- A selective release depends on the person who cuts it. They choose a set of
  features that does not need anything left out, and they write a CHANGELOG
  for that set. The tests on the release branch are the safety net.
- A cherry-picked feature exists on `main` as a different commit from the one
  on `development`. The back-merge resolves this, because the changes are the
  same.
