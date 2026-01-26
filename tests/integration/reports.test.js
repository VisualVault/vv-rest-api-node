import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

// Conditional test runner - requires a report ID
const runReportTest = process.env.VV_TEST_REPORT_ID ? it : it.skip;

describeIf(canRunIntegrationTests())('ReportsManager Integration Tests', () => {
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

  describe('getReportPDF', () => {
    // Requires VV_TEST_REPORT_ID - note: this functionality is older and may not be commonly used
    runReportTest('should return PDF for a report', async () => {
      const reportId = config.testReportId;

      const response = await client.reports.getReportPDF(reportId, {});

      expect(response, 'getReportPDF should return a response').toBeDefined();

      console.log('getReportPDF response type:', typeof response);
      console.log('getReportPDF response length:', response?.length || 'N/A');
    });
  });
});
