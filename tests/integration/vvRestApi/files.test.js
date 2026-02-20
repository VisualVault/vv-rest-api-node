import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('FilesManager Integration Tests', () => {
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

    // Create a test folder for file tests
    const folderPath = `/Test Folders/Files Test ${Date.now()}`;
    const folderResponse = await client.library.postFolderByPath({}, { description: 'Files test folder' }, folderPath);
    const folderData = JSON.parse(folderResponse);
    expect(folderData.data, 'Failed to create test folder').toBeDefined();
    testFolderId = folderData.data.id;
    console.log('Created test folder:', testFolderId);
  }, 120000);

  afterAll(async () => {
    // Cleanup test folder (will also delete documents/files inside)
    if (testFolderId && client) {
      try {
        await client.library.deleteFolder(testFolderId);
        console.log('Cleanup - deleted test folder:', testFolderId);
      } catch (error) {
        console.warn('Cleanup failed:', error.message);
      }
    }
  });

  // Helper to create a document and upload a file
  async function createDocumentWithFile(content) {
    // Create document
    const docData = {
      folderId: testFolderId,
      name: `Test Document ${Date.now()}`,
      description: 'Integration test document for file uploads',
      documentState: 1
    };
    const docResponse = await client.documents.postDoc(docData);
    const docParsed = JSON.parse(docResponse);
    expect(docParsed.data, 'Failed to create test document').toBeDefined();
    const documentId = docParsed.data.documentId || docParsed.data.id;
    const revisionId = docParsed.data.id;

    // Upload file
    const buffer = Buffer.from(content, 'utf-8');
    const fileData = {
      documentId,
      fileName: `test-file-${Date.now()}.txt`,
      fileLength: buffer.length,
      contentType: 'text/plain',
      revision: `rev-${Date.now()}`,
      changeText: 'Integration test file upload'
    };
    const fileResponse = await client.files.postFile(fileData, buffer);
    const fileParsed = JSON.parse(fileResponse);
    expect(fileParsed.meta.status, 'File upload should succeed').toBe(200);

    return {
      documentId,
      revisionId,
      fileId: fileParsed.data.id || fileParsed.data.fileId,
      content,
      fileData: fileParsed.data
    };
  }

  describe('postFile', () => {
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup document failed:', error.message);
        }
        revisionId = null;
      }
    });

    it('should upload a file to a document', async () => {
      // Create a document for this test
      const docData = {
        folderId: testFolderId,
        name: `Test Document ${Date.now()}`,
        description: 'Integration test document for file uploads',
        documentState: 1
      };
      const docResponse = await client.documents.postDoc(docData);
      const docParsed = JSON.parse(docResponse);
      expect(docParsed.data, 'Failed to create test document').toBeDefined();

      const documentId = docParsed.data.documentId || docParsed.data.id;
      revisionId = docParsed.data.id;
      console.log('Created test document ID:', documentId);

      // Upload file
      const fileContent = `Test file content created at ${new Date().toISOString()}`;
      const buffer = Buffer.from(fileContent, 'utf-8');

      const fileData = {
        documentId,
        fileName: `test-file-${Date.now()}.txt`,
        fileLength: buffer.length,
        contentType: 'text/plain',
        revision: `rev-${Date.now()}`,
        changeText: 'Integration test file upload'
      };

      const response = await client.files.postFile(fileData, buffer);
      expect(response, 'postFile should return a response').toBeDefined();

      const data = JSON.parse(response);
      console.log('postFile response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Upload should return success status').toBe(200);
      expect(data.data, 'Response should contain file data').toBeDefined();

      const fileId = data.data.id || data.data.fileId;
      expect(fileId, 'Response should include file ID').toBeDefined();
      console.log('Uploaded file ID:', fileId);

      // Verify response contains expected file metadata
      expect(data.data).toHaveProperty('fileName');
      expect(data.data.fileName).toMatch(/^test-file-\d+\.txt$/);
      expect(data.data).toHaveProperty('fileSize');
      expect(data.data.fileSize).toBe(buffer.length);
      expect(data.data).toHaveProperty('extension', 'txt');
      expect(data.data).toHaveProperty('contentType', 'text/plain');
    });
  });

  describe('getFileBytesId', () => {
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup document failed:', error.message);
        }
        revisionId = null;
      }
    });

    it('should get file bytes by ID and match uploaded content', async () => {
      const fileContent = `Test file content for getFileBytesId ${Date.now()}`;
      const result = await createDocumentWithFile(fileContent);
      revisionId = result.revisionId;

      const response = await client.files.getFileBytesId(result.fileId);

      expect(response, 'getFileBytesId should return file content').toBeDefined();
      expect(response.length, 'Downloaded file should not be empty').toBeGreaterThan(0);
      console.log('getFileBytesId response type:', typeof response, 'length:', response.length);

      // Convert response to string for comparison
      const downloadedContent = Buffer.isBuffer(response)
        ? response.toString('utf-8')
        : response;

      // Verify the downloaded content matches what we uploaded
      expect(downloadedContent).toBe(fileContent);
    });
  });

  describe('getFileBytesQuery', () => {
    let revisionId;

    afterEach(async () => {
      if (revisionId) {
        try {
          await client.documents.deleteDocument({}, revisionId);
          console.log('Cleanup - deleted test document:', revisionId);
        } catch (error) {
          console.warn('Cleanup document failed:', error.message);
        }
        revisionId = null;
      }
    });

    it('should get file bytes by query and match uploaded content', async () => {
      const fileContent = `Test file content for getFileBytesQuery ${Date.now()}`;
      const result = await createDocumentWithFile(fileContent);
      revisionId = result.revisionId;

      // Query by file ID
      const query = `[id] eq '${result.fileId}'`;

      const response = await client.files.getFileBytesQuery(query);

      expect(response, 'getFileBytesQuery should return file content').toBeDefined();
      expect(response.length, 'Downloaded file should not be empty').toBeGreaterThan(0);
      console.log('getFileBytesQuery response type:', typeof response, 'length:', response.length);

      // Convert response to string for comparison
      const downloadedContent = Buffer.isBuffer(response)
        ? response.toString('utf-8')
        : response;

      // Verify the downloaded content matches what we uploaded
      expect(downloadedContent).toBe(fileContent);
    });
  });
});
