# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-29

### Changed
- **BREAKING**: Extracted API wrapper into standalone NPM package
- Removed server/microservice dependencies (Express, EJS, body-parser, multer, etc.)
- Streamlined package to focus solely on REST API client functionality
- Updated package name to `visualvault-api` for clarity
- Reduced dependency footprint for better performance and security

### Added
- TypeScript definitions for better IDE support
- Comprehensive documentation in README
- LICENSE file (ISC)
- Proper .npmignore to reduce package size

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
