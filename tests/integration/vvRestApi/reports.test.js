import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

// Conditional test runner - requires a report ID
const skipReportTest = !process.env.VV_TEST_REPORT_ID;

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

  describe('getReports', () => {
    it('should return list of reports', async () => {
      const response = await client.reports.getReports({});

      expect(response, 'getReports should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getReports should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);
    });
  });

  describe('getReportPDF', () => {
    // Requires VV_TEST_REPORT_ID - note: this functionality is older and may not be commonly used
    it.skipIf(skipReportTest)('should return PDF for a report', async () => {
      const reportId = config.testReportId;

      const response = await client.reports.getReportPDF(reportId, {});

      expect(response, 'getReportPDF should return a response').toBeDefined();

      console.log('getReportPDF response type:', typeof response);
      console.log('getReportPDF response length:', response?.length || 'N/A');
    });
  });
});
