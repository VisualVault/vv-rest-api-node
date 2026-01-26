import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

// Conditional test runners - each test has its own requirements
const runAssignTest = (process.env.VV_TEST_CUSTOMER_DATABASE_ID && process.env.VV_TEST_CUSTOMER_DATABASE_USERNAME) ? it : it.skip;
const runRemoveTest = (process.env.VV_TEST_CUSTOMER_DATABASE_ID && process.env.VV_TEST_CUSTOMER_DATABASE_AUTH_USER_ID) ? it : it.skip;

describeIf(canRunIntegrationTests())('CustomerDatabaseManager Integration Tests', () => {
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

  describe('assignUser', () => {
    beforeEach(async () => {
      try {
        await client.customerDatabase.removeUser(config.testCustomerDatabaseAuthUserId, config.testCustomerDatabaseId);
      } catch (e) {
        // Ignore - resource may not exist yet
      }
    });
    // Requires VV_TEST_CUSTOMER_DATABASE_ID and VV_TEST_CUSTOMER_DATABASE_USERNAME
    runAssignTest('should assign a user to a database', async () => {
      const databaseId = config.testCustomerDatabaseId;
      const username = config.testCustomerDatabaseUsername;

      console.log('assignUser input - databaseId:', databaseId, 'username:', username);

      const data = {
        userId: username  // API expects userId field, not username
      };

      const response = await client.customerDatabase.assignUser(databaseId, data);

      expect(response, 'assignUser should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('assignUser response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      expect(result.meta.status, 'assignUser should return success status').toBe(200);
    });
  });

  describe('removeUser', () => {
    // Requires VV_TEST_CUSTOMER_DATABASE_ID and VV_TEST_CUSTOMER_DATABASE_AUTH_USER_ID
    runRemoveTest('should remove a user from a database', async () => {
      const databaseId = config.testCustomerDatabaseId;
      const authUserId = config.testCustomerDatabaseAuthUserId;

      const response = await client.customerDatabase.removeUser(authUserId, databaseId);

      expect(response, 'removeUser should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('removeUser response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      expect(result.meta.status, 'removeUser should return success status').toBe(200);
    });
  });
});
