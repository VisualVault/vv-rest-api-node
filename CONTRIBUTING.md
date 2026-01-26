# Contributing to @visualvault/vv-rest-api-node

Thank you for your interest in contributing to the VisualVault API client library!

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

This project uses [Vitest](https://vitest.dev/) for testing.
Please update the tests to reflect your code changes.

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Before submitting changes:

1. Ensure all tests pass: `npm test`
2. Maintain or improve test coverage: `npm run test:coverage`
3. Ensure backward compatibility when possible
4. Update documentation if adding new features

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
- Ensure all tests pass
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
