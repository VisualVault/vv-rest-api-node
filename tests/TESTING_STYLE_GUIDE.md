# Integration Testing Style Guide

This guide documents the conventions and best practices for writing integration tests in the visualvault-api-npm package.

## Scope

These are **minimum viable integration tests** to verify that API methods work correctly against a live VisualVault server. Each method requires one test that proves it functions as expected. Error cases, edge cases, and query parameter variations are optional.

---

## File Structure

### Directory Organization

Test files are organized into subdirectories that mirror the `lib/` API module structure:

```
tests/integration/setup.js              (shared utilities)
tests/integration/_fixtures/            (test fixtures)
```

### Naming Convention

- Test files: `{manager-name}.test.js` (e.g., `users.test.js`, `forms.test.js`)
- Location: `tests/integration/{apiName}/` (e.g., `tests/integration/vvRestApi/users.test.js`)
- Shared utilities: `tests/integration/setup.js`

### Basic Test File Template

```javascript
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('{ManagerName} Integration Tests', () => {
  let config;
  let client;
  let testFolderId; // Suite-level resources created in beforeAll

  beforeAll(async () => {
    config = getTestConfig();

    const auth = new Authorize();
    client = await auth.getVaultApi(
      config.clientId,
      config.clientSecret,
      config.username,
      config.password,
      config.audience,
      config.baseUrl,
      config.customerAlias,
      config.databaseAlias
    );

    // Create suite-level resources (e.g., test folder)
  }, 60000);

  afterAll(async () => {
    // Cleanup suite-level resources
  });

  describe('methodName', () => {
    let resourceId; // Block-scoped for this describe block

    afterEach(async () => {
      // Cleanup resources created in tests
      if (resourceId) {
        try {
          await client.manager.deleteResource(resourceId);
        } catch (error) {
          console.warn('Cleanup failed:', error.message);
        }
        resourceId = null;
      }
    });

    it('should describe expected behavior', async () => {
      // Create resource in the test
      const createResponse = await client.manager.createResource(data);
      resourceId = JSON.parse(createResponse).data.id;

      // Test the actual method
      const response = await client.manager.method(resourceId);
      // ... assertions ...
    });
  });
});
```

---

## Test Setup

### Timeouts

| Operation | Timeout |
|-----------|---------|
| Authentication only | 60000ms |
| Auth + resource creation | 120000ms |

For individual slow tests (e.g., PDF generation), specify a per-test timeout as the second argument to `it()`.

```javascript
beforeAll(async () => {
  // ... setup code ...
}, 60000); // Always specify timeout

it('should generate PDF', async () => {
  // ... test code ...
}, 60000); // Specify for slow tests
```

### Discovering Test Data

Discover required IDs in `beforeAll` rather than hardcoding:

```javascript
beforeAll(async () => {
  // ... authentication ...

  const response = await client.forms.getFormTemplates({});
  const data = JSON.parse(response);
  if (data.data.length > 0) {
    testTemplateId = data.data[0].id;
  }

  expect(testTemplateId, 'Should have a template ID for tests').toBeDefined();
}, 60000);
```

---

## Assertions

### Always Use Descriptive Error Messages

```javascript
// Good
expect(response, 'getUsers should return a response').toBeDefined();
expect(data.meta.status, 'getUsers should return success status').toBe(200);
```

### Standard Response Validation

```javascript
const response = await client.manager.method({});

expect(response, 'methodName should return a response').toBeDefined();
const data = JSON.parse(response);

expect(data, 'Response should have meta property').toHaveProperty('meta');
expect(data.meta.status, 'methodName should return success status').toBe(200);
expect(data, 'Response should have data property').toHaveProperty('data');
```

### Never Use Silent Early Returns

```javascript
// Bad
if (!testUserId) {
  console.log('Skipping test');
  return;
}

// Good
expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();
```

### Use Tight Status Assertions

```javascript
// Good
expect(data.meta.status, 'Should return success status').toBe(200);

// Bad
expect([200, 201]).toContain(data.meta.status);
```

---

## HTTP Status Codes

| Operation | Expected Status |
|-----------|-----------------|
| GET | 200 |
| POST (create) | 201 |
| PUT (update) | 200 |
| DELETE | 200 |

```javascript
// GET operations
expect(data.meta.status, 'getUsers should return success status').toBe(200);

// POST operations (creating resources)
expect(data.meta.status, 'postForms should return 201 Created').toBe(201);
```

---

## Cleanup

### Preferred Pattern: Isolated Tests with afterEach

Each test should create its own resources and clean them up via `afterEach`. This ensures tests are independent and can run in any order.

```javascript
describe('methodName', () => {
  let resourceId;

  afterEach(async () => {
    if (resourceId) {
      try {
        await client.manager.deleteResource(resourceId);
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
      resourceId = null;
    }
  });

  it('should do something with a resource', async () => {
    // Create resource in the test
    const createResponse = await client.manager.createResource(data);
    resourceId = JSON.parse(createResponse).data.id;

    // Test the actual method
    const response = await client.manager.method(resourceId);
    // ... assertions ...
  });
});
```

See [Common Patterns](#common-patterns) for full examples with real API calls.

### Use afterAll for Suite-Level Cleanup

Use `afterAll` only for resources created in `beforeAll` that are shared across all tests (like test folders):

```javascript
afterAll(async () => {
  if (testFolderId && client) {
    try {
      await client.library.deleteFolder(testFolderId);
      console.log('Cleanup - deleted test folder:', testFolderId);
    } catch (error) {
      console.warn('Cleanup failed:', error.message);
    }
  }
});
```

### Use beforeEach for Pre-Test Cleanup (Idempotent Tests)

For tests that modify a pre-existing resource, clean up first to ensure idempotent runs:

```javascript
describe('assignUser', () => {
  beforeEach(async () => {
    try {
      await client.customerDatabase.removeUser(
        config.testCustomerDatabaseAuthUserId,
        config.testCustomerDatabaseId
      );
    } catch (e) {
      // Ignore - resource may not exist yet
    }
  });

  it('should assign a user to a database', async () => {
    // Test implementation
  });
});
```

**Note:** When a test is skipped via `it.skipIf()`, Vitest does not run `beforeEach` hooks for it, so no guard check is needed inside `beforeEach`.

### Document Missing Cleanup APIs

```javascript
afterAll(async () => {
  // Note: No deleteSite method available in the API
  if (testSiteId) {
    console.log('Note: Test site was created:', testSiteId, '(no delete API available)');
  }
});
```

---

## Skipping Tests

### Static Skips

Skip tests that require unavailable server configuration or perform destructive operations:

```javascript
it.skip('should create and update a user', async () => {
  // SKIPPED: Server returns 404 - needs server configuration investigation
  // This test creates real users - enable only when needed
});
```

### Conditional Skips Based on Configuration

Some tests should be written but can be conditionally skipped at runtime due to one or more of the following reasons:
- They require unavailable server configurations.
  - An endpoint that does not exist in the test environment.
  - An endpoint with a known bug.
  - Dependent on a Central Admin setting that must be enabled for one test and disabled for another.
- They perform irreversible actions.
- They have significant system impact or real-world effects. (e.g. sending emails)

Use vitest's built-in `it.skipIf()` to conditionally skip tests when the required environment variables are not set.

**IMPORTANT:** The `setup.js` import must come before any `process.env` checks, as it loads the `.env` file via dotenv. Without this import order, the environment variables won't be available when the skip conditions are evaluated at module load time.

```javascript
import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js FIRST to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Define skip conditions at module level (AFTER setup.js import)
// Variable is true when the test should be SKIPPED
const skipQueryByNameTest = !process.env.VV_TEST_CUSTOM_QUERY_NAME;
const skipQueryByIdTest = !process.env.VV_TEST_CUSTOM_QUERY_ID;

describeIf(canRunIntegrationTests())('CustomQueryManager Integration Tests', () => {
  // ... beforeAll setup ...

  describe('getCustomQueryResultsByName', () => {
    it.skipIf(skipQueryByNameTest)('should return results for a custom query by name', async () => {
      const response = await client.customQuery.getCustomQueryResultsByName(
        config.testCustomQueryName,
        {}
      );
      // ... assertions ...
    });
  });
});
```

For conditions that combine multiple environment variables:

```javascript
const skipModifyTest = !(process.env.VV_TEST_SECURITY_PARENT_ID && process.env.VV_TEST_SECURITY_MEMBER_ID);

it.skipIf(skipModifyTest)('should add a security member', async () => {
  // ...
});
```

### Adding Configurable Test Resources

When a test requires a pre-configured server resource:

1. **Add the environment variable to `setup.js`:**

```javascript
// In getTestConfig() return object:
return {
  // ... existing config ...
  testCustomQueryName: process.env.VV_TEST_CUSTOM_QUERY_NAME || null,
  testCustomQueryId: process.env.VV_TEST_CUSTOM_QUERY_ID || null
};
```

2. **Document the variable in `.env.example`:**

```bash
# Custom Query tests (requires a custom query configured on the server)
# VV_TEST_CUSTOM_QUERY_NAME=your-custom-query-name
# VV_TEST_CUSTOM_QUERY_ID=your-custom-query-guid
```

3. **Use the config value in your test:**

```javascript
const response = await client.customQuery.getCustomQueryResultsByName(
  config.testCustomQueryName,
  {}
);
```

If the resource may not be available in all environments, use `it.skipIf()` to conditionally skip (see [Conditional Skips](#conditional-skips-based-on-configuration) above).

---

## Common Patterns

### Testing a GET Method (List)

For list methods that query existing data, no setup/cleanup is typically needed:

```javascript
describe('getUsers', () => {
  it('should return list of users in a site', async () => {
    const response = await client.users.getUsers({}, testSiteId);

    expect(response, 'getUsers should return a response').toBeDefined();
    const data = JSON.parse(response);

    expect(data, 'Response should have meta property').toHaveProperty('meta');
    expect(data.meta.status, 'getUsers should return success status').toBe(200);
    expect(data.data, 'Response should contain users array').toBeDefined();
    expect(Array.isArray(data.data), 'data should be an array').toBe(true);
  });
});
```

### Testing a GET Method (Single Resource)

Create the resource in the test, then fetch it:

```javascript
describe('getDocumentRevision', () => {
  let documentId;
  let revisionId;

  afterEach(async () => {
    if (revisionId) {
      try {
        await client.documents.deleteDocument({}, revisionId);
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
      revisionId = null;
      documentId = null;
    }
  });

  it('should return document revision details', async () => {
    // Create document for this test
    const docData = {
      folderId: testFolderId,
      name: `Test Document ${Date.now()}`,
      documentState: 1
    };

    const createResponse = await client.documents.postDoc(docData);
    const createData = JSON.parse(createResponse);

    documentId = createData.data.documentId;
    revisionId = createData.data.id;

    // Test the GET method
    const response = await client.documents.getDocumentRevision({}, documentId);
    const data = JSON.parse(response);

    expect(data.meta.status, 'Should return success status').toBe(200);
    expect(data.data, 'Response data should have documentId').toHaveProperty('documentId', documentId);
  });
});
```

### Testing a POST Method (Create)

```javascript
describe('postDoc', () => {
  let revisionId;

  afterEach(async () => {
    if (revisionId) {
      try {
        await client.documents.deleteDocument({}, revisionId);
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
      revisionId = null;
    }
  });

  it('should create a new document', async () => {
    const docData = {
      folderId: testFolderId,
      name: `Test Document ${Date.now()}`,
      description: 'Integration test document'
    };

    const response = await client.documents.postDoc(docData);
    const data = JSON.parse(response);

    expect(data.meta.status, 'Document creation should return success status').toBe(200);
    expect(data.data, 'Response should contain document data').toBeDefined();
    expect(data.data.id, 'Response should include document ID').toBeDefined();

    revisionId = data.data.id; // Store for cleanup
  });
});
```

### Testing a PUT Method (Update)

```javascript
describe('updateDocumentExpiration', () => {
  let documentId;
  let revisionId;

  afterEach(async () => {
    if (revisionId) {
      try {
        await client.documents.deleteDocument({}, revisionId);
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
      revisionId = null;
      documentId = null;
    }
  });

  it('should update document expiration date', async () => {
    // Create document for this test
    const docData = {
      folderId: testFolderId,
      name: `Test Document ${Date.now()}`,
      documentState: 1
    };

    const createResponse = await client.documents.postDoc(docData);
    const createData = JSON.parse(createResponse);
    documentId = createData.data.documentId;
    revisionId = createData.data.id;

    // Test the PUT method
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const response = await client.documents.updateDocumentExpiration(documentId, futureDate.toISOString());
    const data = JSON.parse(response);

    expect(data.meta.status, 'Update should return success status').toBe(200);
  });
});
```

### Testing a DELETE Method

No `afterEach` needed - the delete operation IS the test:

```javascript
describe('deleteDocument', () => {
  it('should delete a document', async () => {
    // Create document for this test
    const docData = {
      folderId: testFolderId,
      name: `Test Document ${Date.now()}`,
      documentState: 1
    };

    const createResponse = await client.documents.postDoc(docData);
    const revisionId = JSON.parse(createResponse).data.id;

    // Test the DELETE method
    const response = await client.documents.deleteDocument({}, revisionId);
    const data = JSON.parse(response);

    expect(data.meta.status, 'Delete should return success status').toBe(200);
  });
});
```

---

## Checklist for New Tests

- [ ] Uses `describeIf(canRunIntegrationTests())` wrapper
- [ ] `beforeAll` has 60s or 120s timeout
- [ ] All assertions have descriptive error messages
- [ ] No silent early returns - use `expect` instead
- [ ] Status assertions use `toBe()` with correct code (200 or 201)
- [ ] Created resources are cleaned up
- [ ] Skipped tests have comments explaining why
