# visualvault-api

A Node.js client library that provides convenient access to the VisualVault REST API for server-side applications.

## Installation

```bash
npm install visualvault-api
```

## Requirements

- Node.js 20.0.0 or higher

## Quick Start

### Basic Authentication and Setup

```javascript
// ES Modules (recommended)
import vvRestApi from 'visualvault-api';

// CommonJS
const vvRestApi = require('visualvault-api');

// Initialize authentication
const auth = new vvRestApi.Authorize();

// Get authenticated client
auth.getVaultApi(
    'your-client-id',
    'your-client-secret',
    'username',
    'password',
    'your-audience',
    'https://your-vault-url.com',
    'customer-alias',
    'database-alias'
).then(client => {
    console.log('Successfully authenticated!');
    // Use the client for API calls
}).catch(error => {
    console.error('Authentication failed:', error);
});
```

### JWT Authentication

If you already have a JWT token:

```javascript
const auth = new vvRestApi.Authorize();

auth.getVaultApiFromJwt(
    'your-jwt-token',
    'https://your-vault-url.com',
    'customer-alias',
    'database-alias',
    new Date('2024-12-31') // expiration date
).then(client => {
    console.log('JWT authentication successful!');
}).catch(error => {
    console.error('JWT authentication failed:', error);
});
```

## API Usage

Once authenticated, the client provides access to various API modules. All methods return Promises.

```javascript
// Example: Get forms by template name
client.forms.getForms(params, 'Your Form Template Name')
    .then(response => {
        const forms = JSON.parse(response);
        console.log('Forms:', forms.data);
    });

// Example: Execute a web service
client.scripts.runWebService('YourWebServiceName', { param1: 'value1' })
    .then(response => {
        console.log('Web service result:', response);
    });
```

## API Modules

The client provides access to the following VisualVault API modules:

- **documents** - Document management operations
- **forms** - Form template and instance operations
- **library** - Folder and library management
- **users** - User management operations
- **groups** - Group management operations
- **sites** - Site management operations
- **files** - File upload/download operations
- **scripts** - Web service execution
- **customQuery** - Custom query execution
- **email** - Email operations
- **constants** - API constants and enums
- **scheduledProcess** - Scheduled process management
- **customer** - Customer management operations
- **projects** - Project management operations
- **indexFields** - Document Index field operations
- **outsideProcesses** - Outside process management
- **securityMembers** - Security member management
- **reports** - Report generation

## Extended API Modules

When enabled, the following additional API modules are available:

- **docApi** - Enhanced document operations
- **formsApi** - Enhanced forms operations
- **objectsApi** - Object model operations
- **studioApi** - Workflow and studio operations
- **notificationsApi** - Real-time notifications

## Error Handling

```javascript
client.documents.getDocuments(params, folderId)
    .then(response => {
        const result = JSON.parse(response);
        if (result.meta && result.meta.statusCode === 200) {
            console.log('Success:', result.data);
        } else {
            console.error('API Error:', result);
        }
    })
    .catch(error => {
        console.error('Request failed:', error);
    });
```

## Support

For more information about the VisualVault API, visit the [VisualVault documentation](https://docs.visualvault.com/).

## License

This project is licensed under the [ISC License](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.
