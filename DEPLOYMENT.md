# Deployment Guide

This guide covers the steps needed to publish the `@visualvault/vv-rest-api-node` package to NPM.

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

### Publishing Process

1. Ensure you're on the main branch and everything is committed:
   ```bash
   git status
   ```

2. Build the package:
   ```bash
   npm run build
   ```

3. Publish to NPM:
   ```bash
   # For initial release or major version
   npm publish

   # For beta/pre-release versions
   npm publish --tag beta
   ```

4. Verify the package on NPM:
   ```bash
   npm view @visualvault/vv-rest-api-node
   ```

5. Create a Git tag for the release:
   ```bash
   git tag -a v2.0.0 -m "Release v2.0.0"
   git push origin v2.0.0
   ```

## Post-Deployment

1. Create a GitHub Release:
   - Go to repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the tag you just created
   - Copy the CHANGELOG entry for this version
   - Publish the release

2. Update documentation:
   - Ensure README on GitHub is rendered correctly
   - Check that all links work
   - Verify examples are accurate

3. Test installation:
   ```bash
   npm install @visualvault/vv-rest-api-node
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
npm unpublish @visualvault/vv-rest-api-node@2.0.0

# Deprecate a version (preferred over unpublishing)
npm deprecate @visualvault/vv-rest-api-node@2.0.0 "Please upgrade to 2.0.1"
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

## Continuous Integration (Future)

Consider setting up:
- GitHub Actions for automated testing
- Automated security scanning
- Automated dependency updates (Dependabot)
- Automated release notes generation

## Support

For questions about deployment, contact the VisualVault development team.
