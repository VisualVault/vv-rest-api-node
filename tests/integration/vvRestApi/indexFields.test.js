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

  describe('createIndexField', () => {
    it.skipIf(skipIndexFieldTest)('should create an index field', async () => {
      createdIndexFieldName = `Field ${Date.now()}`;

      const newFieldData = {
        fieldType: 'Text',
        label: createdIndexFieldName,
        description: 'Created by test',
        required: false,
        connectionId: null,
        queryId: null,
        queryDisplayField: null,
        queryValueField: null,
        dropDownListId: null,
        defaultValue: null
      };

      const createResponse = await client.indexFields.createIndexField(
        {},
        newFieldData
      );
      const createData = JSON.parse(createResponse);
      expect(createData.meta.status, 'createIndexField should return success status').toBe(200);

      createdIndexFieldId = createData.data?.id;
      expect(createdIndexFieldId, 'Created index field id should be defined').toBeDefined();
    });
  });

  describe('updateIndexField', () => {
    it.skipIf(skipIndexFieldTest)('should update an index field', async () => {
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by createIndexField test').toBeDefined();

      const updatedFieldData = {
        fieldType: 'Text',
        label: `${createdIndexFieldName} Updated`,
        description: 'Updated by test',
        required: false,
        connectionId: null,
        queryId: null,
        queryDisplayField: null,
        queryValueField: null,
        dropDownListId: null,
        defaultValue: null
      };

      const updateResponse = await client.indexFields.updateIndexField(
        {},
        createdIndexFieldId,
        updatedFieldData
      );
      const updateData = JSON.parse(updateResponse);
      expect(updateData.meta.status, 'updateIndexField should return success status').toBe(200);
    });
  });

  describe('moveIndexFieldAfter', () => {
    it.skipIf(skipIndexFieldTest)('should move an index field after another', async () => {
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by createIndexField test').toBeDefined();
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
      expect(createdIndexFieldId, 'createdIndexFieldId should be set by createIndexField test').toBeDefined();

      const deleteResponse = await client.indexFields.deleteIndexField({}, createdIndexFieldId);
      const deleteData = JSON.parse(deleteResponse);
      expect(deleteData.meta.status, 'deleteIndexField should return success status').toBe(200);

      createdIndexFieldId = null;
    });
  });
});
