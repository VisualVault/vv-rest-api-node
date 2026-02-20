import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

const skipModelTests = !process.env.VV_TEST_MODEL_ID;

describeIf(canRunIntegrationTests())('ModelManager Integration Tests', () => {
  let config;
  let client;
  let testModelId;

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

    testModelId = config.testModelId;
  }, 60000); // Allow up to 60s for authentication

  describe('getModels', () => {
    it.skipIf(skipModelTests)('should retrieve a list of models', async () => {
      const params = {};

      const modelsResponse = await client.objectsApi.model.getModels(params);
      const modelsData = JSON.parse(modelsResponse);

      console.log('getModels response:', JSON.stringify(modelsData, null, 2));

      expect(modelsData).toHaveProperty('meta');
      expect(modelsData.meta.status, 'getModels should return 200 Success').toBe(200);
      expect(modelsData).toHaveProperty('data');

      const { data: modelList } = modelsData;

      expect(modelList, 'Retrieved models list should be defined').toBeDefined();
      expect(Array.isArray(modelList), 'Retrieved models should be an array of models').toBe(true);
    });
  });

  describe('getModelById', () => {
    it.skipIf(skipModelTests)('should retrieve a model by its ID', async () => {
      expect(testModelId, 'testModelId should be set by beforeAll').toBeDefined();

      const params = {};

      const modelResponse = await client.objectsApi.model.getModelById(testModelId, params);
      const modelData = JSON.parse(modelResponse);

      console.log('getModelById response:', JSON.stringify(modelData, null, 2));

      expect(modelData).toHaveProperty('meta');
      expect(modelData.meta.status, 'getModelById should return 200 Success').toBe(200);
      expect(modelData).toHaveProperty('data');

      const { data: modelInfo } = modelData;

      expect(modelInfo).toHaveProperty('id', testModelId);
      expect(modelInfo).toHaveProperty('name');
      expect(modelInfo).toHaveProperty('propertyList');
      expect(Array.isArray(modelInfo.propertyList)).toBe(true);
      expect(modelInfo).toHaveProperty('relatedModels');
      expect(Array.isArray(modelInfo.relatedModels)).toBe(true);
    });
  });
});
