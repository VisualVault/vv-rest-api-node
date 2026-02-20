import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runners - each test has its own requirements
// CustomerManager
const skipCustomerAssignTest = !(process.env.VV_TEST_CUSTOMER_ID && process.env.VV_TEST_CUSTOMER_USERNAME);


describeIf(canRunIntegrationTests())('CustomerManager Integration Tests', () => {
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
    // Requires VV_TEST_CUSTOMER_ID and VV_TEST_CUSTOMER_USERNAME
    it.skipIf(skipCustomerAssignTest)('should assign a user to a customer', async () => {
      // SKIPPED: There is not api endpoint to undo this test - enable only when needed by supplying env vars
      const customerId = config.testCustomerId;
      const username = config.testCustomerUsername;

      const data = {
        userId: username
      };

      const response = await client.customer.assignUser(customerId, data);

      expect(response, 'assignUser should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('CustomerManager assignUser response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      expect(result.meta.status, 'assignUser should return success status').toBe(200);
    });
  });

  describe('createCustomerInvite', () => {
    // Skipped: Creates real customer invites which is a significant operation
    it.skip('should create a customer invite', async () => {
      // Would require careful setup to avoid creating real invites
      //TODO: Implement
    });
  });
});
