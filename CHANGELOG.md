# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased] - 2026-06-23 <!-- TODO: Add version number when next release is added -->

### Added
- ESLint with `eslint-plugin-jsdoc` configured to warn on missing JSDoc across all files
- `lint` npm script
- Lint job in CI pipeline
- Typed all `VVClient` manager properties in `VVRestApi.js` (replaced `{*}` annotations with real manager class types, enabling typed IntelliSense on the top-level client)
- JSDoc added to all public methods with accurate parameter types, descriptions, and return types:
    - `DocumentManager`
    - `ObjectManager`
    - `ModelManager`
    - `FormInstanceManager`
    - `UserNotificationManager`
    - `RolesAndPermissionsManager`
    - `WorkflowManager`
    - `CustomerDatabaseManager`
    - `CustomerManager`
    - `EmailManager`
    - `FilesManager`
    - `ConfigurationManager`
    - `CurrentUserManager`
    - `CustomQueryManager`
    - `DropdownListsManager`
    - `GroupsManager`
    - `IndexFieldsManager`
    - `LanguageResourcesManager`
    - `LayoutsManager`
    - `OutsideProcessesManager`
    - `ProjectsManager`
    - `ReportsManager`
    - `ScheduledProcessManager`
    - `ScriptsManager`
    - `SecurityMembersManager`

## [2.0.0] - 2026-04-10

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
- **BREAKING**: `IndexFieldsManager.putIndexFields()` renamed to `addIndexFieldToFolder()` (same parameters, new name)
- **BREAKING**: `FormsManager.returnField()` now returns a new `ReturnField` object instead of setting properties on the manager instance. Code that read `client.forms.id` or `client.forms.name` after calling `returnField()` must use the returned object instead.
- **BREAKING**: Q promise library replaced with native Promises. Code using Q-specific methods (`.fail()`, `.fin()`, `.progress()`) on returned promises must migrate to standard `.catch()` / `.finally()`.
- **BREAKING**: `request` npm module replaced with native `fetch()`. Proxy support via environment variables or `request`-specific behaviors (cookie jars, redirect handling) may differ.
- Replaced `console.log` calls during authentication with `debug` library (silent by default, enable with `DEBUG=visualvault:*`).

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
