# API Wrapper Implementation Style Guide

This guide documents the patterns and best practices for implementing API wrapper methods in this codebase.

---

## Table of Contents

1. [File Structure](#file-structure)
2. [Manager Classes](#manager-classes)
3. [Method Patterns](#method-patterns)
4. [URL Construction](#url-construction)
5. [Parameter Handling](#parameter-handling)
6. [Request Types](#request-types)
7. [Error Handling](#error-handling)
8. [Configuration](#configuration)
9. [Specialized APIs](#specialized-apis)
10. [Checklist for New Methods](#checklist-for-new-methods)

---

## File Structure

### Manager Files

VisualVault Core APIs are organized into manager classes for VisualVaultdomains (e.g. Documents, Forms, Users, etc.)
These classes live in `/lib/vvRestApi/` and follow this structure:

```javascript
import Debug from 'debug';
const debug = Debug('vvrestapi:managerName');

export class ManagerName {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    // Methods...
}
```

### Specialized API Files

Specialized API wrappers (DocApi, FormsApi, StudioApi, etc.) have their own parent files and their own manager classes.
These wrappers and their classes live in `/lib/` and have additional initialization:

```javascript
import Debug from 'debug';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import * as common from './common.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const debug = Debug('vvrestapi:apiName');
const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));

export class ApiName {
    constructor(sessionToken, apiConfig) {
        // Validate JWT token type
        if (!sessionToken['tokenType'] || sessionToken['tokenType'] !== 'jwt') {
            return;
        }

        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);
        this.isEnabled = apiConfig['isEnabled'] || false;
        this.baseUrl = apiConfig['apiUrl'] || null;

        // Conditionally instantiate nested managers
        if (this.isEnabled) {
            this.nestedManager = new NestedManager(this._httpHelper);
        }
    }
}

// Nested manager classes
class NestedManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    // Methods...
}
```

---

## Manager Classes

### Constructor Pattern

All managers receive `httpHelper` in the constructor:

```javascript
export class DocumentsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }
}
```

### Registration in VVClient

Managers are instantiated in `VVClient` constructor (`VVRestApi.js`):

```javascript
// In VVClient constructor
this.documents = new DocumentsManager(this._httpHelper);
this.users = new UsersManager(this._httpHelper);
this.forms = new FormsManager(this._httpHelper);
// ... etc
```

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Manager class | `{Domain}Manager` | `DocumentsManager`, `UsersManager` |
| Manager property | lowercase domain | `client.documents`, `client.users` |
| Specialized API | `{Name}Api` | `DocApi`, `FormsApi` |
| File name | `camelCase.js` | `documentsManager.js`, `usersManager.js` |

---

## Method Patterns

### Standard Method Structure

All API methods follow this pattern:

```javascript
methodName(params, data, resourceId) {
    // 1. Build resource URI (with template replacement if needed)
    const resourceUri = this._httpHelper._config.ResourceUri.EndpointName
        .replace('{id}', resourceId);

    // 2. Get full URL
    const url = this._httpHelper.getUrl(resourceUri);

    // 3. Set HTTP method
    const opts = { method: 'GET' };  // or POST, PUT, DELETE

    // 4. Normalize params
    params = params || {};

    // 5. Make request
    return this._httpHelper.doVvClientRequest(url, opts, params, data);
}
```

### GET Methods

```javascript
// Simple GET
getDocument(params, documentId) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId
        .replace('{id}', documentId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'GET' };
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}

// GET with query parameters
getDocuments(params) {
    const resourceUri = this._httpHelper._config.ResourceUri.Documents;
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'GET' };
    params = params || {};
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}

// GET returning binary data
getFileBytesQuery(query) {
    const resourceUri = this._httpHelper._config.ResourceUri.FilesQuery + query;
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'GETSTREAM' };
    return this._httpHelper.doVvClientRequest(url, opts, null, null);
}
```

### POST Methods

```javascript
// Simple POST with JSON body
postDoc(data) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'POST' };
    return this._httpHelper.doVvClientRequest(url, opts, null, data);
}

// POST with file upload
postDocWithFile(data, fileData) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'POSTSTREAM' };
    return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
}

// POST with data enrichment
async createObject(modelId, data, params) {
    const resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.Object;
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'POST' };

    data = data || {};
    params = params || {};
    data['modelId'] = modelId;  // Enrich data before sending

    return this._httpHelper.doVvClientRequest(url, opts, params, data);
}
```

### PUT Methods

```javascript
// Simple PUT
putFolder(params, data, folderId) {
    const resourceUri = this._httpHelper._config.ResourceUri.FoldersId
        .replace('{id}', folderId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'PUT' };
    return this._httpHelper.doVvClientRequest(url, opts, params, data);
}

// PUT with file upload
putFileStream(params, data, documentId, fileData) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdFile
        .replace('{id}', documentId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'PUTSTREAM' };
    return this._httpHelper.doVvClientRequest(url, opts, params, data, fileData);
}
```

### DELETE Methods

```javascript
deleteDocument(params, documentId) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId
        .replace('{id}', documentId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'DELETE' };
    params = params || {};
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}
```

---

## URL Construction

### Three-Layer URL Structure

URLs are constructed from three components:

```
{baseUrl} + {apiUrl} + {resourceUri}
```

Example:
```
https://vault.example.com + /api/v1/customer/database + /documents
```

### Config-Driven Resource URIs

Define all endpoints in `config.yml`:

```yaml
ResourceUri:
  # Simple endpoints
  Documents: /documents
  DocumentsPost: /documents

  # Parameterized endpoints
  DocumentsId: /documents/{id}
  DocumentsIdCopy: /documents/{id}/copy

  # Nested resources
  FoldersIdDocuments: /folders/{id}/documents
  FoldersIdIndexFieldsId: /folders/{id}/indexfields/{indexFieldId}

  # Specialized API endpoints
  DocApi:
    GetRevision: /Documents/revisions/{id}
    AdvancedSearch: /Search/Advanced
```

### Template Replacement

Use `.replace()` for URL parameters:

```javascript
// Single parameter
const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId
    .replace('{id}', documentId);

// Multiple parameters
const resourceUri = this._httpHelper._config.ResourceUri.FoldersIdIndexFieldsId
    .replace('{id}', folderId)
    .replace('{indexFieldId}', fieldId);
```

### Path Concatenation

Append additional path segments when needed:

```javascript
const resourceUri = this._httpHelper._config.ResourceUri.FormInstance
    .replace('{id}', formId);
const url = this._httpHelper.getUrl(resourceUri + '/relateForm');
```

---

## Parameter Handling

### Query Parameters

Pass query params in the `params` object:

```javascript
// In method
getUsers(params, siteId) {
    params = params || {};
    params.includeInactive = true;  // Add default params
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}

// In calling code
await client.users.getUsers({ limit: 10, offset: 0 }, siteId);
```

### Body Data

Pass request body in the `data` object:

```javascript
postDoc(data) {
    // data = { folderId: '...', name: '...', description: '...' }
    return this._httpHelper.doVvClientRequest(url, opts, null, data);
}
```

### Data Enrichment

Add computed fields to data before sending:

```javascript
async createObject(modelId, data, params) {
    data = data || {};
    params = params || {};

    // Enrich with required fields
    data['modelId'] = modelId;

    return this._httpHelper.doVvClientRequest(url, opts, params, data);
}
```

### Default Parameter Normalization

Always normalize params and data:

```javascript
methodName(params, data, resourceId) {
    params = params || {};
    data = data || {};
    // ...
}
```

### Smart Type Detection

Detect parameter types for flexible APIs:

```javascript
async getForms(params, formTemplateId) {
    // If not a GUID, assume it's a template name
    if (!this.isGuid(formTemplateId)) {
        const resp = await this.getFormTemplateIdByName(formTemplateId);
        formTemplateId = resp.templateIdGuid;
    }
    // Continue with resolved GUID...
}

isGuid(value) {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(value);
}
```

---

## Request Types

### HTTP Methods

| Method | opts.method | Use Case |
|--------|-------------|----------|
| GET | `'GET'` | Retrieve resources |
| GET (binary) | `'GETSTREAM'` | Download files |
| POST | `'POST'` | Create resources |
| POST (file) | `'POSTSTREAM'` | Upload files |
| PUT | `'PUT'` | Update resources |
| PUT (file) | `'PUTSTREAM'` | Update with file |
| DELETE | `'DELETE'` | Remove resources |

### File Upload Structure

Single file:
```javascript
// fileData is a Buffer
postDocWithFile(data, fileData)
```

Multiple files:
```javascript
// fileData is an array of { buffer: Buffer, fileName: string }
const files = [
    { buffer: fileBuffer1, fileName: 'document1.pdf' },
    { buffer: fileBuffer2, fileName: 'document2.pdf' }
];
postDocWithFiles(data, files)
```

### Response Handling

All methods return a JSON string that must be parsed:

```javascript
// In calling code
const response = await client.documents.getDocument({}, documentId);
const data = JSON.parse(response);

// Check for success
if (data.meta.status === 200) {
    const document = data.data;
}
```

---

## Error Handling

### Let Errors Propagate

Most methods should let errors propagate to the caller:

```javascript
// Good - errors propagate naturally
getDocument(params, documentId) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId
        .replace('{id}', documentId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'GET' };
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}
```

### Catch and Enrich for Complex Operations

For multi-step operations, catch and add context:

```javascript
async getFormTemplateIdByName(templateName) {
    try {
        const resp = await this._httpHelper.doVvClientRequest(url, opts, params, null);
        const templateResp = JSON.parse(resp);

        if (templateResp.data && templateResp.data.length > 0) {
            return {
                formsManager: this,
                templateIdGuid: templateResp.data[0].id,
                templateRevisionIdGuid: templateResp.data[0].revisionId
            };
        }

        return {
            formsManager: this,
            templateIdGuid: '',
            templateRevisionIdGuid: '',
            error: 'Template not found'
        };
    } catch (error) {
        debug('Failed to get form template by name "%s": %s', templateName, error.message);

        return {
            formsManager: this,
            templateIdGuid: '',
            templateRevisionIdGuid: '',
            error: error.message
        };
    }
}
```

### Debug Logging

Use the `debug` package for diagnostic logging:

```javascript
import Debug from 'debug';
const debug = Debug('vvrestapi:documentsManager');

// In methods
debug('Creating document in folder: %s', folderId);
debug('Request failed: %s', error.message);
```

---

## Configuration

### Adding New Endpoints

1. Add the endpoint to `config.yml`:

```yaml
ResourceUri:
  # Existing endpoints...

  # New endpoints
  NewResource: /newresource
  NewResourceId: /newresource/{id}
  NewResourceIdAction: /newresource/{id}/action
```

2. Use in manager:

```javascript
getNewResource(params, resourceId) {
    const resourceUri = this._httpHelper._config.ResourceUri.NewResourceId
        .replace('{id}', resourceId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'GET' };
    return this._httpHelper.doVvClientRequest(url, opts, params, null);
}
```

### Specialized API Endpoints

Group specialized API endpoints under their namespace:

```yaml
ResourceUri:
  DocApi:
    GetRevision: /Documents/revisions/{id}
    OcrStatus: /Documents/ocr/{id}

  FormsApi:
    FormInstance: /forminstance

  StudioApi:
    WorkflowRun: /workflows/{id}/revisions/{revision}/run
```

---

## Specialized APIs

### Nullable Property Pattern

Specialized APIs (DocApi, FormsApi, ObjectsApi, StudioApi, NotificationsApi) use simple nullable properties.
When not enabled/configured, they remain `null`. Consumers should check for availability before use.

```javascript
// In VVClient constructor
// Extended API modules - null when not enabled/configured
this.docApi = null;
this.formsApi = null;
this.objectsApi = null;
this.studioApi = null;
this.notificationsApi = null;
```

### Consumer Usage

```javascript
// Check before use
if (client.docApi) {
    const result = await client.docApi.documents.getRevision(revisionId);
}

// Or use optional chaining
const result = await client.docApi?.documents.getRevision(revisionId);
```

### Creation Method Pattern

```javascript
async createDocApi(sessionToken) {
    // 1. Get configuration from API
    const configResponse = JSON.parse(await this.configuration.getDocApiConfig());

    if (configResponse?.data) {
        // 2. Create session token copy for this API
        const apiSession = sessionToken.createCopy();

        // 3. Update session with API-specific URLs
        apiSession.baseUrl = configResponse.data['apiUrl'];
        apiSession.apiUrl = this.yamlConfig.DocApiUri;

        // 4. Ensure JWT token type
        if (apiSession['tokenType'] === 'jwt') {
            this.docApi = new DocApi(apiSession, configResponse.data);
        } else {
            // Convert to JWT if needed
            const jwtResponse = JSON.parse(await this.users.getUserJwt(apiSession.audience));
            if (jwtResponse?.data?.token) {
                apiSession.convertToJwt(jwtResponse.data);
                this.docApi = new DocApi(apiSession, configResponse.data);
            }
        }
    }
}
```

### Parallel Initialization

Initialize all specialized APIs in parallel:

```javascript
await Promise.all([
    client.createDocApi(sessionToken),
    client.createFormsApi(sessionToken),
    client.createObjectsApi(sessionToken),
    client.createStudioApi(sessionToken),
    client.createNotificationsApi(sessionToken),
]);
```

---

## Checklist for New Methods

### Before Writing

- [ ] Endpoint added to `config.yml`
- [ ] Method name follows existing patterns (get*, post*, put*, delete*)
- [ ] Parameter order matches similar methods

### Method Implementation

- [ ] Builds URL from config with template replacement
- [ ] Uses `this._httpHelper.getUrl(resourceUri)`
- [ ] Sets correct HTTP method in `opts`
- [ ] Normalizes params: `params = params || {}`
- [ ] Returns `this._httpHelper.doVvClientRequest(...)`

### For Stream Methods

- [ ] Uses appropriate stream method (GETSTREAM, POSTSTREAM, PUTSTREAM)
- [ ] Passes fileData as 5th argument to doVvClientRequest
- [ ] Documents expected file format (Buffer or {buffer, fileName})

### Documentation

- [ ] Method has JSDoc comment with @param descriptions
- [ ] Complex operations have inline comments
- [ ] Debug statements for diagnostic logging

### Testing

- [ ] Integration test covers success case
- [ ] Test uses descriptive assertion messages
- [ ] Test cleans up created resources

---

## Examples

### Complete Manager Method

```javascript
/**
 * Updates a document's index fields
 * @param {Object} data - Index field values { indexFields: JSON string }
 * @param {string} documentId - The document ID
 * @returns {Promise<string>} JSON response string
 */
putDocumentIndexFields(data, documentId) {
    const resourceUri = this._httpHelper._config.ResourceUri.DocumentIndexFields
        .replace('{id}', documentId);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'PUT' };
    return this._httpHelper.doVvClientRequest(url, opts, null, data);
}
```

### Complete Specialized API Method

```javascript
/**
 * Triggers a workflow execution
 * @param {string} workflowId - The workflow ID
 * @param {string} workflowRevision - The workflow revision number
 * @param {string} objectId - The object to run workflow against
 * @param {Object} workflowVariables - Variables to pass to workflow
 * @returns {Promise<string>} JSON response string
 */
async triggerWorkflow(workflowId, workflowRevision, objectId, workflowVariables) {
    const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowRun
        .replace('{id}', workflowId)
        .replace('{revision}', workflowRevision);
    const url = this._httpHelper.getUrl(resourceUri);
    const opts = { method: 'POST' };

    const data = {
        objectId,
        reference: 'API',
        data: {
            workflowVariables: workflowVariables || {},
            dataSetVariables: []
        }
    };

    return this._httpHelper.doVvClientRequest(url, opts, null, data);
}
```
