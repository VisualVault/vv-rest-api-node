import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('DocumentManager Integration Tests', () => {
  let config;
  let client;
  let testFolderId;
  let testDocRevId;

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
    const testFolderPath = `/Test Folders/Document Instance Integration Test/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${date.getTime()}`;
    const folderData = { description: 'Document Instance integration test folder - safe to delete' };

    const folderResponse = await client.library.postFolderByPath({}, folderData, testFolderPath);
    const folderResult = JSON.parse(folderResponse);
    testFolderId = folderResult.data.id;
    console.log('Created test folder:', testFolderId);

    // Create a test document for document tests
    const docName = `Test Document ${Date.now()}`;
    const docDescription = 'Integration test document - safe to delete';
    const docData = {
      folderId: testFolderId,
      name: docName,
      description: docDescription,
      documentState: 1
    };

    const docResponse = await client.documents.postDoc(docData);
    const docResult = JSON.parse(docResponse);
    testDocRevId = docResult.data.id;
    console.log('Created test document:', testDocRevId);
  }, 120000); // Allow up to 120s for authentication and folder and document creation

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

  describe('GetRevision', () => {
    it('should return document revision details', async () => {
      expect(testDocRevId, 'testDocRevId should be set by beforeAll').toBeDefined();

      const response = await client.docApi.documents.GetRevision(testDocRevId);
      const data = JSON.parse(response);

      console.log('GetRevision response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'GetRevision should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data.dhId, 'Document revision ID should match the provided ID').toEqual(testDocRevId);
    });
  });

  describe('getDocumentOcrStatus', () => {
    it('should return document OCR status', async () => {
      expect(testDocRevId, 'testDocRevId should be set by beforeAll').toBeDefined();

      const response = await client.docApi.documents.getDocumentOcrStatus(testDocRevId);
      const data = JSON.parse(response);

      console.log('getDocumentOcrStatus response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDocumentOcrStatus should return success status').toBe(200);
      expect(data).toHaveProperty('data');

      expect(data.data.id).toEqual(testDocRevId);
      expect(data.data, 'OCR status should return the OCR status code').toHaveProperty('ocrStatus');
      expect(data.data, 'OCR status should return the OCR status type').toHaveProperty('ocrType');
    });
  });

  describe('updateDocumentOcrStatus', () => {
    it('should update document OCR status', async () => {
      expect(testDocRevId, 'testDocRevId should be set by beforeAll').toBeDefined();

      const ocrUpdateRequest = {
        ocrErrorCode: 0,  // None
        ocrStatusType: 1, // Success
        pageCount: 9,
        wordCount: 1000
      }

      const response = await client.docApi.documents.updateDocumentOcrStatus(testDocRevId, ocrUpdateRequest);
      const data = JSON.parse(response);

      console.log('updateDocumentOcrStatus response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'updateDocumentOcrStatus should return success status').toBe(200);
      expect(data).toHaveProperty('data');

      expect(data.data.isError, 'Updated document OCR status should be successful').toBe(false);
      expect(data.data.errorMessage, 'Updated document OCR status should have no error message').toBeNull();
      expect(data.data.id, 'Updated document OCR status should match the provided ID').toEqual(testDocRevId);
    });
  });

  describe('search', () => {
    it('should return list of documents fulfilling search criteria', async () => {
      const criteriaList = [];
      const searchFolders = [{ folderID: testFolderId, path: '', includeChildrenFolders: true }];
      const excludeFolders = [];
      const sortBy = 'fileLength';
      const sortDirection = 'desc';
      const page = 0;
      const take = 10;
      const archiveType = 0; // Active
      const roleSecurity = false;

      const response = await client.docApi.documents.search(
        criteriaList, 
        searchFolders, 
        excludeFolders, 
        sortBy, 
        sortDirection, 
        page, 
        take, 
        archiveType, 
        roleSecurity
      );
      const data = JSON.parse(response);

      console.log('search response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'search should return success status').toBe(200);
      expect(data).toHaveProperty('data');

      expect(data.data.success, 'Document search should be successful').toBe(true);
      expect(data.data).toHaveProperty('documents');
      expect(Array.isArray(data.data.documents), 'search results should return an array of documents').toBe(true);

      const [ firstDoc ] = data.data.documents;

      expect(firstDoc, 'A document must be present in the document search results').toBeDefined();
      expect(firstDoc.dhId).toBeDefined();
      expect(firstDoc).toHaveProperty('file');
      expect(firstDoc).toHaveProperty('permissions');
      expect(Array.isArray(firstDoc.permissions), 'A document must have an array of permissions').toBe(true);
    });
  });
});
