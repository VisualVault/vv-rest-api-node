# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0] - Unreleased

### Added
- ES module support with CommonJS compatibility
- TypeScript definitions for better IDE support
- Comprehensive documentation in README
- Proper .npmignore to reduce package size
- Vitest test framework
- Add CurrentUserManager
- Add DropdownListsManager
- Add LanguageResourceManager
- New Methods in DocumentsManager, GroupsManager, IndexFieldsManager, LibraryManager, ReportsManager, SitesManager
- Add getDocumentWebDavUrl and getDocumentWopiUrl methods
- Add addIndexFieldToFolder method


### Changed
- **BREAKING**: Updated client so that DocApi and ObjectsApi methods have individual namespaces
- **BREAKING**: Class `authorize` renamed to `Authorize` to follow JavaScript PascalCase convention for classes (use `new vvRestApi.Authorize()` instead of `new vvRestApi.authorize()`)
- **BREAKING**: Extended API modules (`docApi`, `formsApi`, `objectsApi`, `studioApi`, `notificationsApi`) now return `null` when not enabled instead of throwing `ReferenceError` on access. Check availability with `if (client.docApi)` or use optional chaining `client.docApi?.method()`.

### Removed
- Express server components (app.js, routes/, views/, public/)
- Server-specific dependencies
- Sample scripts (available in separate microservices repository)
- Development files and runtime artifacts

## [1.2.0]

### Added
- Objects API support
- Enhanced document and forms API functionality

---

For the complete history before the extraction, see the [original repository](https://github.com/VisualVault/nodeJs-rest-client-library).
