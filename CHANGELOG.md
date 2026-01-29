# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-01-29

### Added
- StudioAPI method to retrieve the requesting user's available feature permissions

## [2.0.0] - 2026-01-29

### Changed
- **BREAKING**: Updated client so that DocApi and ObjectsApi methods have individual namespaces
- **BREAKING**: Extracted API wrapper into standalone NPM package
- Package published as `@visualvault/vv-rest-api-node`
- Converted to ES modules with CommonJS compatibility
- Removed server/microservice dependencies (Express, EJS, body-parser, multer, etc.)
- Streamlined package to focus solely on REST API client functionality
- Reduced dependency footprint for better performance and security

### Added
- ES module support with CommonJS fallback
- TypeScript definitions for better IDE support
- Comprehensive documentation in README
- MIT License
- Proper .npmignore to reduce package size
- Vitest test framework

### Removed
- Express server components (app.js, routes/, views/, public/)
- Server-specific dependencies
- Sample scripts (available in separate microservices repository)
- Development files and runtime artifacts

## [1.1.0] - Previous

### Added
- Objects API support
- Enhanced document and forms API functionality
- Multiple API improvements from the original monolithic repository

---

For the complete history before the extraction, see the [original repository](https://github.com/VisualVault/nodeJs-rest-client-library).
