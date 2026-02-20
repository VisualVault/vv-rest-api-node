import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conditional test runner for actual email delivery test
const skipEmailDeliveryTest = !process.env.VV_TEST_EMAIL_RECIPIENT;

describeIf(canRunIntegrationTests())('EmailManager Integration Tests', () => {
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

  describe('postEmails', () => {
    it('should reject email with missing recipients', async () => {
      const data = {
        subject: 'Test Email',
        body: 'This is a test email body'
        // No recipients - should be rejected
      };

      const response = await client.email.postEmails({}, data);

      expect(response, 'postEmails should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('postEmails (no recipients) response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      // Expect a 400 Bad Request for missing recipients
      expect(result.meta.status, 'postEmails should reject missing recipients').toBe(400);
    });

    // Optional test for actual email delivery - requires VV_TEST_EMAIL_RECIPIENT
    it.skipIf(skipEmailDeliveryTest)('should send email to configured recipient', async () => {
      const recipient = process.env.VV_TEST_EMAIL_RECIPIENT;

      const data = {
        recipients: recipient,
        subject: 'Integration Test Email',
        body: 'This email was sent by the visualvault-api integration tests.'
      };

      const response = await client.email.postEmails({}, data);

      expect(response, 'postEmails should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('postEmails (actual send) response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      expect(result.meta.status, 'postEmails should return success status').toBe(200);
    });
  });

  describe('postEmailsWithAttachments', () => {
    it('should reject email with missing recipients even with attachment', async () => {
      const data = {
        subject: 'Test Email with Attachment',
        body: 'This is a test email body'
        // No recipients - should be rejected
      };

      // Read the test XML file as attachment
      const filePath = path.join(__dirname, '..', '_fixtures', 'test-form-template.xml');
      const fileBuffer = fs.readFileSync(filePath);
      const fileObjs = [{
        name: 'test-form-template.xml',
        buffer: fileBuffer
      }];

      const response = await client.email.postEmailsWithAttachments({}, data, fileObjs);

      expect(response, 'postEmailsWithAttachments should return a response').toBeDefined();
      const result = JSON.parse(response);

      console.log('postEmailsWithAttachments (no recipients) response:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('meta');
      // Expect a 400 Bad Request for missing recipients
      expect(result.meta.status, 'postEmailsWithAttachments should reject missing recipients').toBe(400);
    });
  });
});
