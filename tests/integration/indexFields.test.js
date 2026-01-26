import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('IndexFieldsManager Integration Tests', () => {
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
});
