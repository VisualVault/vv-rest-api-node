import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runner - requires a folder with index fields configured
const skipIndexFieldTest = !process.env.VV_TEST_INDEX_FOLDER_ID;
describeIf(canRunIntegrationTests())('IndexFieldsManager Integration Tests', () => {
  let config;
  let client;
  let testIndexFieldId;
  let createdIndexFieldId;
  let createdIndexFieldName;

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
  }, 60000);

  describe('getIndexFields', () => {
    it('should return list of index fields', async () => {
      const response = await client.indexFields.getIndexFields({});

      expect(response, 'getIndexFields should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getIndexFields response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getIndexFields should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);

      if (data.data.length > 0) {
        testIndexFieldId = data.data[0].id;
      }
    });

    it('should support query params for filtering', async () => {
      const response = await client.indexFields.getIndexFields({ limit: 5 });

      expect(response, 'getIndexFields should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data.meta.status, 'getIndexFields should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);
    });
  });

  describe('getIndexField', () => {
    it('should return a specific index field', async () => {
      expect(testIndexFieldId, 'testIndexFieldId should be set by getIndexFields test').toBeDefined();

      const response = await client.indexFields.getIndexField({}, testIndexFieldId);

      expect(response, 'getIndexField should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getIndexField should return success status').toBe(200);
    });
  });

  describe('addIndexField', () => {
    it.skipIf(skipIndexFieldTest)('should add an index field', async () => {
      createdIndexFieldName = `Field ${Date.now()}`;

      const createResponse = await client.indexFields.addIndexField(
        {},
        'Text',
        createdIndexFieldName,
        'Created by test',
        false,
        null,
        null,
        null,
        null,
        null,
        null
      );
      const createData = JSON.parse(createResponse);
      expect(createData.meta.status, 'addIndexField should return success status').toBe(200);

      createdIndexFieldId = createData.data?.id;
      expect(createdIndexFieldId, 'Created index field id should be defined').toBeDefined();
    });
  });

  describe('updateIndexField', () => {
    it.skipIf(skipIndexFieldTest)('should update an index field', async () => {
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by addIndexField test').toBeDefined();

      const updateResponse = await client.indexFields.updateIndexField(
        {},
        createdIndexFieldId,
        'Text',
        `${createdIndexFieldName} Updated`,
        'Updated by test',
        false,
        null,
        null,
        null,
        null,
        null,
        null
      );
      const updateData = JSON.parse(updateResponse);
      expect(updateData.meta.status, 'updateIndexField should return success status').toBe(200);
    });
  });

  describe('moveIndexFieldAfter', () => {
    it.skipIf(skipIndexFieldTest)('should move an index field after another', async () => {
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by addIndexField test').toBeDefined();
      expect(testIndexFieldId, 'testIndexFieldId should be set by getIndexFields test').toBeDefined();

      if (testIndexFieldId === createdIndexFieldId) {
        return;
      }

      const moveResponse = await client.indexFields.moveIndexFieldAfter({}, createdIndexFieldId, testIndexFieldId);
        const moveData = JSON.parse(moveResponse);
        expect(moveData.meta.status, 'moveIndexFieldAfter should return success status').toBe(200);
    });
  });

  describe('deleteIndexField', () => {
    it.skipIf(skipIndexFieldTest)('should delete an index field', async () => {
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by addIndexField test').toBeDefined();

      const deleteResponse = await client.indexFields.deleteIndexField({}, createdIndexFieldId);
      const deleteData = JSON.parse(deleteResponse);
      expect(deleteData.meta.status, 'deleteIndexField should return success status').toBe(200);

      createdIndexFieldId = null;
    });
  });
});
