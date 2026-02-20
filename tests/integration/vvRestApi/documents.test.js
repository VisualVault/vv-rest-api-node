import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runner - requires a folder with index fields configured
const skipIndexFieldTest = !process.env.VV_TEST_INDEX_FOLDER_ID;

describeIf(canRunIntegrationTests())('DocumentsManager Integration Tests', () => {
  let config;
  let client;
  let testFolderId;

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

    // Create a test folder for document tests
    const date = new Date();
    const testFolderPath = `/Test Folders/Documents Integration Test/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/${date.getTime()}`;
    const folderData = { description: 'Documents integration test folder - safe to delete' };

    const folderResponse = await client.library.postFolderByPath({}, folderData, testFolderPath);
    const folderResult = JSON.parse(folderResponse);
    testFolderId = folderResult.data.id;
    console.log('Created test folder:', testFolderId);
  }, 120000);

  afterAll(async () => {
    if (!client) return;

    // Cleanup test folder (will also delete documents inside)
    if (testFolderId) {
      try {
        await client.library.deleteFolder(testFolderId);
        console.log('Cleanup - deleted test folder:', testFolderId);
      } catch (error) {
        console.warn('Cleanup test folder failed:', error.message);
      }
    }
  }, 60000);

  describe('getDocuments', () => {
    it('should return list of documents', async () => {
      const response = await client.documents.getDocuments({});

      expect(response, 'getDocuments should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getDocuments response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDocuments should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('postDoc', () => {
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted postDoc test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup postDoc test document failed:', error.message);
        }
        revisionId = null;
      }
    });

    it('should create a new document', async () => {
      expect(testFolderId, 'testFolderId should be set by beforeAll').toBeDefined();

      const docName = `Test Document ${Date.now()}`;
      const docDescription = 'Integration test document - safe to delete';
      const docData = {
        folderId: testFolderId,
        name: docName,
        description: docDescription,
        documentState: 1
      };

      const response = await client.documents.postDoc(docData);

      expect(response, 'postDoc should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postDoc response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Document creation should return success status').toBe(200);
      expect(data.data, 'Response should contain document data').toBeDefined();
      expect(data.data.id, 'Response should include document ID').toBeDefined();
      expect(data.data).toHaveProperty('name', docName);
      expect(data.data).toHaveProperty('description', docDescription);
      expect(data.data).toHaveProperty('folderId', testFolderId);

      revisionId = data.data.id;
      console.log('Created document - documentId:', data.data.documentId, 'revisionId:', revisionId);
    });
  });

  describe('getDocumentRevision', () => {
    let documentId;
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted revision test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup revision test document failed:', error.message);
        }
        revisionId = null;
        documentId = null;
      }
    });

    it('should get document revision details', async () => {
      // Create a document for this test
      const docName = `Revision Test Document ${Date.now()}`;
      const docData = {
        folderId: testFolderId,
        name: docName,
        description: 'Document for getDocumentRevision test - safe to delete',
        documentState: 1
      };

      const createResponse = await client.documents.postDoc(docData);
      const createData = JSON.parse(createResponse);

      documentId = createData.data.documentId;
      revisionId = createData.data.id;
      console.log('Created document for revision test - documentId:', documentId);

      const response = await client.documents.getDocumentRevision({}, documentId);

      expect(response, 'getDocumentRevision should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getDocumentRevision response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDocumentRevision should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('documentId', documentId);
      expect(data.data).toHaveProperty('folderId', testFolderId);
    });
  });

  describe('putDocumentIndexFields', () => {
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted index field test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup index field test document failed:', error.message);
        }
        revisionId = null;
      }
    });

    // Requires VV_TEST_INDEX_FOLDER_ID - a folder with index fields configured
    it.skipIf(skipIndexFieldTest)('should update document index fields', async () => {
      const indexFolderId = config.testIndexFolderId;

      // First, get the available index fields for the folder
      const fieldsResponse = await client.library.getFolderIndexFields({}, indexFolderId);
      const fieldsData = JSON.parse(fieldsResponse);

      console.log('Available index fields:', JSON.stringify(fieldsData.data, null, 2));

      expect(fieldsData.data.length, 'Folder should have at least one index field').toBeGreaterThan(0);

      // Create a document in the folder with index fields
      const docName = `Index Field Test Document ${Date.now()}`;
      const docData = {
        folderId: indexFolderId,
        name: docName,
        description: 'Integration test document for index fields - safe to delete',
        documentState: 1
      };

      const createResponse = await client.documents.postDoc(docData);
      const createData = JSON.parse(createResponse);
      const documentId = createData.data.documentId;
      revisionId = createData.data.id;
      console.log('Created index field test document:', documentId);

      // Build index field data using the first available field
      const firstField = fieldsData.data[0];
      const indexFieldUpdateData = {
        indexFields: JSON.stringify([
          {
            [firstField.id]: 'Test Value ' + new Date().toISOString()
          }
        ])
      };

      console.log('Updating index fields with:', JSON.stringify(indexFieldUpdateData, null, 2));

      const response = await client.documents.putDocumentIndexFields(indexFieldUpdateData, documentId);

      expect(response, 'putDocumentIndexFields should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('putDocumentIndexFields response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Update index fields should return success status').toBe(200);
    });
  });

  describe('copyDocument', () => {
    let sourceRevisionId;
    let copiedRevisionId;

    afterEach(async () => {
      // Cleanup copied document if it was created
      if (copiedRevisionId) {
        try {
          await client.documents.deleteDocument({}, copiedRevisionId);
          console.log('Cleanup - deleted copied document:', copiedRevisionId);
        } catch (error) {
          console.warn('Cleanup copied document failed:', error.message);
        }
        copiedRevisionId = null;
      }

      // Cleanup source document
      if (sourceRevisionId) {
        try {
          await client.documents.deleteDocument({}, sourceRevisionId);
          console.log('Cleanup - deleted source document:', sourceRevisionId);
        } catch (error) {
          console.warn('Cleanup source document failed:', error.message);
        }
        sourceRevisionId = null;
      }
    });

    it('should copy a document', async () => {
      expect(testFolderId, 'testFolderId should be set by beforeAll').toBeDefined();

      // Create a source document to copy from
      const sourceDocName = `Copy Source Document ${Date.now()}`;
      const sourceDocData = {
        folderId: testFolderId,
        name: sourceDocName,
        description: 'Source document for copy test - safe to delete',
        documentState: 1
      };

      const createResponse = await client.documents.postDoc(sourceDocData);
      const createData = JSON.parse(createResponse);
      expect(createData.meta.status, 'Source document creation should succeed').toBe(200);

      const sourceDocumentId = createData.data.documentId;
      sourceRevisionId = createData.data.id;
      console.log('Created source document for copy test - documentId:', sourceDocumentId);

      // Copy the document
      const copiedDocName = `Copied Document ${Date.now()}`;
      const copyData = {
        folderId: testFolderId,
        name: copiedDocName
      };

      const response = await client.documents.copyDocument({}, copyData, sourceDocumentId);

      expect(response, 'copyDocument should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('copyDocument response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Copy document should return success status').toBe(200);
      expect(data.data, 'Response should contain copied document data').toBeDefined();
      expect(data.data).toHaveProperty('folderId', testFolderId);
      expect(data.data).toHaveProperty('documentId');
      expect(data.data.documentId).not.toBe(sourceDocumentId);

      copiedRevisionId = data.data.id;
    });
  });

  describe('updateDocumentExpiration', () => {
    let documentId;
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted expiration test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup expiration test document failed:', error.message);
        }
        revisionId = null;
        documentId = null;
      }
    });

    it('should update document expiration date', async () => {
      // Create a document for this test
      const docName = `Expiration Test Document ${Date.now()}`;
      const docData = {
        folderId: testFolderId,
        name: docName,
        description: 'Document for updateDocumentExpiration test - safe to delete',
        documentState: 1
      };

      const createResponse = await client.documents.postDoc(docData);
      const createData = JSON.parse(createResponse);
      documentId = createData.data.documentId;
      revisionId = createData.data.id;
      console.log('Created document for expiration test - documentId:', documentId);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const expirationDate = futureDate.toISOString();

      const response = await client.documents.updateDocumentExpiration(documentId, expirationDate);

      expect(response, 'updateDocumentExpiration should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('updateDocumentExpiration response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'updateDocumentExpiration should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      const returnedExpiration = new Date(data.data.expireDate);
      expect(returnedExpiration.getFullYear()).toBe(futureDate.getFullYear());
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      // Create a document for this test
      const docName = `Delete Test Document ${Date.now()}`;
      const docData = {
        folderId: testFolderId,
        name: docName,
        description: 'Document for deleteDocument test - safe to delete',
        documentState: 1
      };

      const createResponse = await client.documents.postDoc(docData);
      const createData = JSON.parse(createResponse);
      const revisionId = createData.data.id;
      console.log('Created document for delete test - revisionId:', revisionId);

      const response = await client.documents.deleteDocument({}, revisionId);

      expect(response, 'deleteDocument should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteDocument response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Delete document should return success status').toBe(200);
    });
  });
});
