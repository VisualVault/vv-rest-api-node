import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runners based on environment configuration
const skipQueryByNameTest = !process.env.VV_TEST_CUSTOM_QUERY_NAME;
const skipQueryByIdTest = !process.env.VV_TEST_CUSTOM_QUERY_ID;

describeIf(canRunIntegrationTests())('CustomQueryManager Integration Tests', () => {
  let config;
  let client;

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

  describe('getCustomQueryResultsByName', () => {
    it.skipIf(skipQueryByNameTest)('should return results for a custom query by name', async () => {
      const response = await client.customQuery.getCustomQueryResultsByName(config.testCustomQueryName, {});

      expect(response, 'getCustomQueryResultsByName should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getCustomQueryResultsByName response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getCustomQueryResultsByName should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('getCustomQueryResultsById', () => {
    it.skipIf(skipQueryByIdTest)('should return results for a custom query by ID', async () => {
      const response = await client.customQuery.getCustomQueryResultsById(config.testCustomQueryId, {});

      expect(response, 'getCustomQueryResultsById should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getCustomQueryResultsById response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getCustomQueryResultsById should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });
});
