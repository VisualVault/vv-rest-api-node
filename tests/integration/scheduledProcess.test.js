import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

// Conditional test runner - requires scheduled process ID for postCompletion test
const runPostCompletionTest = process.env.VV_TEST_SCHEDULED_PROCESS_ID ? it : it.skip;

describeIf(canRunIntegrationTests())('ScheduledProcessManager Integration Tests', () => {
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

  describe('runAllScheduledProcesses', () => {
    it('should trigger all scheduled processes', async () => {
      const response = await client.scheduledProcess.runAllScheduledProcesses();

      expect(response, 'runAllScheduledProcesses should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('runAllScheduledProcesses response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'runAllScheduledProcesses should return success status').toBe(200);
    });
  });

  describe('postCompletion', () => {
    // Requires VV_TEST_SCHEDULED_PROCESS_ID
    runPostCompletionTest('should post completion status for a scheduled process', async () => {
      const scheduledProcessId = config.testScheduledProcessId;

      const response = await client.scheduledProcess.postCompletion(
        scheduledProcessId,
        'Complete',
        true,
        'Test completion message'
      );

      expect(response, 'postCompletion should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postCompletion response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'postCompletion should return success status').toBe(200);
    });
  });
});
