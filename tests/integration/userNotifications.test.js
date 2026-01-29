import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('UserNotificationsManager Integration Tests', () => {
  let config;
  let client;
  let testNotifyUserId;

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

    testNotifyUserId = config.testNotifyUserId;
  }, 60000); // Allow up to 60s for authentication

  describe('forceUIRefresh', () => {
    it('should force a UI refresh for the user', async () => {
      expect(testNotifyUserId, 'testNotifyUserId should be set by beforeAll').toBeDefined();

      const response = await client.notificationsApi.users.forceUIRefresh(testNotifyUserId);

      expect(response, 'forceUIRefresh should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('forceUIRefresh response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'forceUIRefresh should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toBeNull();
    });
  });
});
