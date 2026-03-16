import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('LanguageResourcesManager Integration Tests', () => {
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

  describe('getLanguageAreas', () => {
    it('should return list of language areas', async () => {
      const response = await client.languageResources.getLanguageAreas({});

      expect(response, 'getLanguageAreas should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getLanguageAreas response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getLanguageAreas should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);
    });
  });

  describe('getLanguages', () => {
    it('should return list of available languages', async () => {
      const response = await client.languageResources.getLanguages({});

      expect(response, 'getLanguages should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getLanguages response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getLanguages should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);
    });
  });

  describe('exportLanguages', () => {
    it('should export languages for a given area and language code', async () => {
      // First get a valid area and language to use
      const areasResponse = await client.languageResources.getLanguageAreas({});
      const areasData = JSON.parse(areasResponse);

      if (!areasData.data || areasData.data.length === 0) {
        console.log('No language areas available, skipping exportLanguages test');
        return;
      }

      const langsResponse = await client.languageResources.getLanguages({});
      const langsData = JSON.parse(langsResponse);

      if (!langsData.data || langsData.data.length === 0) {
        console.log('No languages available, skipping exportLanguages test');
        return;
      }

      const area = areasData.data[0].name || areasData.data[0];
      const lang = langsData.data[0].code || langsData.data[0];

      const response = await client.languageResources.exportLanguages({ area, lang });

      expect(response, 'exportLanguages should return a response').toBeDefined();
      console.log('exportLanguages response type:', typeof response);
    });
  });

  describe('importLanguages', () => {
    it('should import languages from exported language data', async () => {
      const areasResponse = await client.languageResources.getLanguageAreas({});
      const areasData = JSON.parse(areasResponse);
      const langsResponse = await client.languageResources.getLanguages({});
      const langsData = JSON.parse(langsResponse);

      if (!areasData.data || areasData.data.length === 0) {
        console.log('No language areas available, skipping importLanguages test');
        return;
      }

      if (!langsData.data || langsData.data.length === 0) {
        console.log('No languages available, skipping importLanguages test');
        return;
      }

      const area = areasData.data?.[0]?.name || areasData.data?.[0];
      const lang = langsData.data?.[0]?.code || langsData.data?.[0];

      const exported = await client.languageResources.exportLanguages({ area, lang });

      expect(exported, 'exportLanguages should return language data for import').toBeDefined();

      const buffer = Buffer.isBuffer(exported) ? exported : Buffer.from(exported);

      const response = await client.languageResources.importLanguages({ area, lang }, buffer, 'import.csv');

      expect(response, 'importLanguages should return a response').toBeDefined();
      const data = JSON.parse(response);
      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'importLanguages should return success status').toBe(200);
    });
  });
});
