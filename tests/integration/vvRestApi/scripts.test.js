import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runners - require server-configured resources
const skipWebServiceTest = !process.env.VV_TEST_WEB_SERVICE_NAME;

describeIf(canRunIntegrationTests())('ScriptsManager Integration Tests', () => {
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

  describe('runWebService', () => {
    // Requires VV_TEST_WEB_SERVICE_NAME
    it.skipIf(skipWebServiceTest)('should acknowledge a web service', async () => {
      const serviceName = config.testWebServiceName;
      const serviceData = {};

      const response = await client.scripts.runWebService(serviceName, serviceData);

      expect(response, 'runWebService should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('runWebService response:', JSON.stringify(data, null, 2));

      expect(data, 'runWebService response should have statusCode').toHaveProperty('statusCode');
    });
  });

  describe('completeWorkflowWebService', () => {
    // Skipped: Requires an active VV_TEST_WORKFLOW_EXECUTION_ID which cannot be easily obtained
    it.skip('should complete a workflow web service', async () => {
      const executionId = config.testWorkflowExecutionId;
      const workflowVariables = {};
      const response = await client.scripts.completeWorkflowWebService(executionId, workflowVariables);
      //TODO: Implement
    });
  });
});
