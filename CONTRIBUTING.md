# Contributing to visualvault-api

Thank you for your interest in contributing to the VisualVault API client library!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/VisualVault/visualvault-api.git
cd visualvault-api
```

2. Install dependencies:
```bash
npm install
```

## Project Structure

```
visualvault-api/
├── lib/               # Main library code
│   ├── VVRestApi.js   # Main client
│   ├── common.js      # HTTP helpers
│   ├── config.yml     # API endpoint configurations
│   ├── DocApi.js      # Document API
│   ├── FormsApi.js    # Forms API
│   ├── ObjectsApi.js  # Objects API
│   ├── StudioApi.js   # Studio API
│   └── NotificationsApi.js  # Notifications API
├── types/             # TypeScript definitions
└── README.md          # Documentation
```

## Code Style

- Use consistent indentation (spaces, not tabs)
- Follow existing code patterns and conventions
- Add comments for complex logic
- Keep functions focused and modular

## Testing

Before submitting changes:

1. Test your changes thoroughly
2. Ensure backward compatibility when possible
3. Update documentation if adding new features

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

By contributing, you agree that your contributions will be licensed under the ISC License.
