import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('CurrentUserManager Integration Tests', () => {
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
  }, 60000); // Allow up to 60s for authentication

  describe('getCurrentUser', () => {
    it('should return details for the current user', async () => {
      const response = await client.currentUser.getCurrentUser({});

      expect(response, 'getCurrentUser should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getCurrentUser response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getCurrentUser should return success status').toBe(200);
      expect(data).toHaveProperty('data');

      // Verify user object structure
      const user = data.data;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('userid');
      expect(user).toHaveProperty('dataType', 'User');
    });
  });
});
