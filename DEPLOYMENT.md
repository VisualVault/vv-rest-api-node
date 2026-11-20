# Deployment Guide

This guide covers the steps needed to publish the `visualvault-api` package to NPM.

## Prerequisites

1. NPM account with access to publish under the `@visualvault` organization
2. Git repository created on GitHub: https://github.com/VisualVault/vv-rest-api-node

## Pre-Deployment Checklist

- [ ] All tests pass (`npm test`)
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with new version
- [ ] README.md is accurate and up-to-date
- [ ] Dependencies are up-to-date and secure
- [ ] No sensitive information in code or config files

## GitHub Repository Setup

1. Create a new repository on GitHub:
   ```
   Repository name: vv-rest-api-node
   Description: Node.js client library for the VisualVault REST API
   ```

2. Add the remote and push:
   ```bash
   git remote add origin https://github.com/VisualVault/vv-rest-api-node.git
   git branch -M main
   git push -u origin main
   ```

3. Configure repository settings:
   - Add topics: `visualvault`, `rest-api`, `nodejs`, `client-library`
   - Enable issues and discussions
   - Add a description and website URL

## NPM Publishing

### First Time Setup

1. Login to NPM:
   ```bash
   npm login
   ```

2. Verify package.json settings:
   - Check `name`, `version`, `description`
   - Verify `repository`, `bugs`, `homepage` URLs
   - Ensure `files` array includes all necessary files

3. Test the package locally:
   ```bash
   npm pack
   # This creates a .tgz file you can inspect
   ```

4. Test installation from the tarball:
   ```bash
   npm install ./visualvault-vv-rest-api-node-2.0.0.tgz
   ```

## Branch Model

| Branch | Takes | Merge style | Publishes |
|---|---|---|---|
| `feature/*`, `fix/*` | your work | squash into `development` | nothing |
| `development` | feature PRs, back-merges from `main` | | `X.Y.Z-beta.N` to dist-tag `beta`, automatically |
| `release/X.Y.Z` | the work that passed QA | **merge commit** into `main` | nothing |
| `hotfix/*` | an urgent fix, cut from `main` | **merge commit** into `main` | nothing |
| `main` | release and hotfix PRs only | | `X.Y.Z` to dist-tag `latest`, by manual run |

`development` is the default branch. Every feature PR targets it. `main`
contains only work that passed QA, and changes only through a release or
hotfix PR.

`publish.yml` enforces the split. A beta version publishes only from
`development`, and a stable version publishes only from `main`. A manual run
from the wrong branch fails.

### Beta Releases

1. In the feature PR into `development`, set `package.json` to the next
   `X.Y.Z-beta.N` and add a `[X.Y.Z-beta.N]` section to `CHANGELOG.md`.
2. Squash-merge the PR. The push to `development` publishes the beta to the
   `beta` dist-tag.

### Stable Releases

Create a `release/X.Y.Z` branch. Fill it in one of two ways.

**Promote all of `development` (the normal path):**
```bash
git fetch origin
git switch -c release/2.2.0 origin/development
```

**Promote only some features:**
```bash
git fetch origin
git switch -c release/2.2.0 origin/main
git cherry-pick -x <sha> <sha>   # one squashed feature PR per commit
```
Pick the features in the order they were merged into `development`. Make sure
that each feature you pick does not need a feature you left out. The tests
must pass on the release branch.

Then, on the release branch:

1. Set `package.json` to the stable `X.Y.Z`.
2. In `CHANGELOG.md`, combine the beta sections into one `[X.Y.Z]` section.
   For a selective release, list only the features you picked.
3. Open a PR into `main`. Merge it with **Create a merge commit**, not squash.
   A squash breaks the link between the two branches and causes conflicts in
   the next release.
4. Run the **Publish to npm** workflow (`workflow_dispatch`) on `main`.
5. Tag the release:
   ```bash
   git fetch origin
   git tag -a v2.2.0 -m "Release v2.2.0" origin/main
   git push origin v2.2.0
   ```
6. **Back-merge `main` into `development`.** Open a PR from `main` into
   `development` and merge it with **Create a merge commit**. Do this after
   every release and every hotfix. Without it, the next release conflicts on
   `package.json` and `CHANGELOG.md`. The stable version this brings into
   `development` does not publish.

### Hotfixes

1. `git switch -c hotfix/2.2.1 origin/main`
2. Fix the bug, set `package.json` to `X.Y.Z+1`, and update `CHANGELOG.md`.
3. Open a PR into `main` and merge it with a merge commit.
4. Publish, tag, and back-merge as in steps 4 to 6 of a stable release.

### Verify

```bash
npm view visualvault-api dist-tags
```

## Post-Deployment

1. Create a GitHub Release:
   - Go to repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the tag you created in step 5 of the stable release
   - Copy the CHANGELOG entry for this version
   - Publish the release

2. Update documentation:
   - Ensure README on GitHub is rendered correctly
   - Check that all links work
   - Verify examples are accurate

3. Test installation:
   ```bash
   npm install visualvault-api
   ```

4. Announce the release:
   - Update any internal documentation
   - Notify relevant teams
   - Update any dependent projects

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

## Rolling Back

If you need to unpublish a version:

```bash
# Unpublish a specific version (within 72 hours)
npm unpublish visualvault-api@2.0.0

# Deprecate a version (preferred over unpublishing)
npm deprecate visualvault-api@2.0.0 "Please upgrade to 2.0.1"
```

## Maintenance

### Updating Dependencies

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies
npm update

# For major updates, use:
npm install package-name@latest
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Continuous Integration

- `ci.yml` runs build, lint, and integration tests on every PR into `main`,
  `development`, `release/**`, and `hotfix/**`. The rulesets for `main` and
  `development` require these checks.
- `publish.yml` publishes to npm. See [Branch Model](#branch-model).

## Support

For questions about deployment, contact the VisualVault development team.
