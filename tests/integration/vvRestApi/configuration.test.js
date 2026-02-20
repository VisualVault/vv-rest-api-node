import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('ConfigurationManager Integration Tests', () => {
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

  describe('getDocApiConfig', () => {
    it('should return DocApi configuration', async () => {
      const response = await client.configuration.getDocApiConfig();

      expect(response, 'getDocApiConfig should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDocApiConfig should return success status').toBe(200);
      expect(data.data, 'Response should contain configuration data').toBeDefined();

      console.log('DocApi config:', JSON.stringify(data.data, null, 2));
    });
  });

  describe('getFormsApiConfig', () => {
    it('should return FormsApi configuration', async () => {
      const response = await client.configuration.getFormsApiConfig();

      expect(response, 'getFormsApiConfig should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormsApiConfig should return success status').toBe(200);
      expect(data.data, 'Response should contain configuration data').toBeDefined();

      console.log('FormsApi config:', JSON.stringify(data.data, null, 2));
    });
  });

  describe('getObjectsApiConfig', () => {
    it('should return ObjectsApi configuration', async () => {
      const response = await client.configuration.getObjectsApiConfig();

      expect(response, 'getObjectsApiConfig should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getObjectsApiConfig should return success status').toBe(200);
      expect(data.data, 'Response should contain configuration data').toBeDefined();

      console.log('ObjectsApi config:', JSON.stringify(data.data, null, 2));
    });
  });

  describe('getStudioApiConfig', () => {
    it('should return StudioApi configuration', async () => {
      const response = await client.configuration.getStudioApiConfig();

      expect(response, 'getStudioApiConfig should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getStudioApiConfig should return success status').toBe(200);
      expect(data.data, 'Response should contain configuration data').toBeDefined();

      console.log('StudioApi config:', JSON.stringify(data.data, null, 2));
    });
  });

  describe('getNotificationsApiConfig', () => {
    it('should return NotificationsApi configuration', async () => {
      const response = await client.configuration.getNotificationsApiConfig();

      expect(response, 'getNotificationsApiConfig should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getNotificationsApiConfig should return success status').toBe(200);
      expect(data.data, 'Response should contain configuration data').toBeDefined();

      console.log('NotificationsApi config:', JSON.stringify(data.data, null, 2));
    });
  });
});
