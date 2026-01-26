import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('OutsideProcessesManager Integration Tests', () => {
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

  describe('getOutsideProcesses', () => {
    it('should return list of outside processes', async () => {
      const response = await client.outsideProcesses.getOutsideProcesses({});

      expect(response, 'getOutsideProcesses should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getOutsideProcesses response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getOutsideProcesses should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);
    });
  });
});
