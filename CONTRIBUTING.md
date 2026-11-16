# Contributing to @visualvault/vv-rest-api-node

## Contribution Model

This project is primarily maintained by the VisualVault team and contributions are generally driven by internal product and platform needs. That said, we welcome third-party issues, feedback, and pull requests from external contributors.

Please note that acceptance and timing of external contributions are at the discretion of the VisualVault team and may depend on alignment with our roadmap, priorities, and support commitments.


## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/VisualVault/vv-rest-api-node.git
cd vv-rest-api-node
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Code Style

- Follow existing code patterns, conventions, and style guides

## Testing

This project uses [Vitest](https://vitest.dev/) for testing, in two suites.

**Unit tests** (`tests/unit/`) stub `globalThis.fetch` and need no credentials
and no network, so they run anywhere, including CI.

**Integration tests** (`tests/integration/`) call a real VisualVault instance.
They need the credentials in `.env.example`, copied to `.env` and filled in. On
a machine with no `.env` or no route to the instance, they fail during setup
rather than skipping.

Please update the tests to reflect your code changes.

```bash
# Run the unit tests
npm run test:unit

# Run the integration tests (needs .env and a reachable instance)
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Before submitting changes:

1. Ensure the unit tests pass: `npm run test:unit`
2. Ensure the integration tests pass against an instance you can reach: `npm test`
3. Maintain or improve test coverage: `npm run test:coverage`
4. Ensure backward compatibility when possible
5. Update documentation if adding new features

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Update CHANGELOG.md with your changes
- Ensure both test suites pass
- Update documentation as needed

## Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backward-compatible functionality
- **PATCH** version for backward-compatible bug fixes

## Questions?

If you have questions, please open an issue on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
