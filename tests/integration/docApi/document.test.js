import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
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
    expect(folderResult, 'postFolderByPath should return a response').toBeDefined();
    expect(folderResult).toHaveProperty('meta');
    expect(folderResult.meta.status, 'postFolderByPath should return success status').toBe(200);
    expect(folderResult).toHaveProperty('data');
    expect(folderResult.data, 'postFolderByPath should return data').toBeDefined();
    expect(folderResult.data.id, 'postFolderByPath should return folder id').toBeDefined();
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

  describe('createDocument', () => {
    let createdRevisionId;

    afterEach(async () => {
      if (createdRevisionId) {
        try {
          await client.documents.deleteDocument({}, createdRevisionId);
          console.log('Cleanup - deleted createDocument test document:', createdRevisionId);
        } catch (error) {
          console.warn('Cleanup createDocument test document failed:', error.message);
        }
        createdRevisionId = null;
      }
    });

    it('should create a document via DocApi', async () => {
      expect(testFolderId, 'testFolderId should be set by beforeAll').toBeDefined();

      const docName = `DocApi Create Test ${Date.now()}`;
      const docData = {
        folderId: testFolderId,
        name: docName,
        description: 'DocApi create test document - safe to delete',
        revision: '1',
        documentState: 'Released',
        filename: 'docapi-create.txt',
        fileLength: 0
      };

      const response = await client.docApi.documents.createDocument(docData);
      expect(response, 'createDocument should return a response').toBeDefined();

      const data = JSON.parse(response);
      console.log('createDocument response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'createDocument should return 201 Created').toBe(201);
      expect(data).toHaveProperty('data');
      expect(data.data.dhId, 'createDocument should return a revision ID').toBeDefined();
      expect(data.data.dlId, 'createDocument should return a document ID').toBeDefined();
      expect(data.data.dlDocId, 'createDocument should return the document name').toBe(docName);

      createdRevisionId = data.data.dhId;
    });
  });

  describe('updateDocument', () => {
    let createdRevisionId;
    let createdDocumentId;

    afterEach(async () => {
      if (createdRevisionId) {
        try {
          await client.documents.deleteDocument({}, createdRevisionId);
          console.log('Cleanup - deleted updateDocument test document:', createdRevisionId);
        } catch (error) {
          console.warn('Cleanup updateDocument test document failed:', error.message);
        }
        createdRevisionId = null;
        createdDocumentId = null;
      }
    });

    it('should update a document via DocApi', async () => {
      expect(testFolderId, 'testFolderId should be set by beforeAll').toBeDefined();

      const docName = `DocApi Update Test ${Date.now()}`;
      const createData = {
        folderId: testFolderId,
        name: docName,
        description: 'DocApi update test document - safe to delete',
        revision: '1',
        documentState: 'Released',
        filename: 'docapi-update.txt',
        fileLength: 0
      };

      const createResponse = await client.docApi.documents.createDocument(createData);
      const createResult = JSON.parse(createResponse);
      expect(createResult.meta.status, 'createDocument should return 201 Created').toBe(201);

      createdRevisionId = createResult.data.dhId;
      createdDocumentId = createResult.data.dlId;

      expect(createdDocumentId, 'createDocument should return document ID').toBeDefined();

      const updateData = {
        description: 'DocApi update test document - updated',
        docType: 'Invoice',
        confidence: 0.9
      };

      const updateResponse = await client.docApi.documents.updateDocument(createdDocumentId, updateData);
      const updateResult = JSON.parse(updateResponse);

      console.log('updateDocument response:', JSON.stringify(updateResult, null, 2));

      expect(updateResult).toHaveProperty('meta');
      expect(updateResult.meta.status, 'updateDocument should return success status').toBe(200);
      expect(updateResult).toHaveProperty('data');
      expect(updateResult.data.dhDesc, 'updateDocument should update description').toBe(updateData.description);
      expect(updateResult.data.dhDocType, 'updateDocument should update docType').toBe(updateData.docType);
      expect(updateResult.data.dhDocTypeConfidence, 'updateDocument should update confidence').toBe(updateData.confidence);
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

      // Poll for the document to appear in search results (index may lag behind creation)
      let data;
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        const response = await client.docApi.documents.search(
          criteriaList,
          searchFolders,
          excludeFolders,
          'fileLength',
          'desc',
          0,
          10,
          0,     // Active
          false  // roleSecurity
        );
        data = JSON.parse(response);
        if (data.data?.documents?.length > 0) break;
        console.log(`Search attempt ${i + 1}/${maxAttempts} returned no documents, retrying...`);
        await new Promise(r => setTimeout(r, 2000));
      }

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
