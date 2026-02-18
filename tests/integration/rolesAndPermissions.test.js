import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('RolesAndPermissionsManager Integration Tests', () => {
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

  describe('getUserFeatures', () => {
    it('should retrieve all available feature permissions for the requesting user', async () => {
      const allUserFeaturesResponse = await client.studioApi.permissions.getUserFeatures();
      const allUserFeaturesData = JSON.parse(allUserFeaturesResponse);

      console.log('getUserFeatures response:', JSON.stringify(allUserFeaturesData, null, 2));

      expect(allUserFeaturesData).toHaveProperty('meta');
      expect(allUserFeaturesData.meta.status, 'getUserFeatures should return 200 Success').toBe(200);
      expect(allUserFeaturesData).toHaveProperty('data');

      const { data: allUserFeaturePermissions } = allUserFeaturesData;

      expect(allUserFeaturePermissions, 'User features data should be defined').toBeDefined();
      expect(Array.isArray(allUserFeaturePermissions), 'User features data be an array of permissions').toBe(true);
    });

    it('should retrieve a specific resource feature permission for the requesting user', async () => {
      const docViewerResourceName = 'Document Viewer';

      const docViewerUserFeatureResponse = await client.studioApi.permissions.getUserFeatures({ resource: docViewerResourceName });
      const docViewerUserFeatureData = JSON.parse(docViewerUserFeatureResponse);

      console.log('getUserFeatures response:', JSON.stringify(docViewerUserFeatureData, null, 2));

      expect(docViewerUserFeatureData).toHaveProperty('meta');
      expect(docViewerUserFeatureData.meta.status, 'getUserFeatures should return 200 Success').toBe(200);
      expect(docViewerUserFeatureData).toHaveProperty('data');

      const { data: docViewerUserFeaturePermissions } = docViewerUserFeatureData;

      expect(docViewerUserFeaturePermissions, `User features data for '${docViewerResourceName}' resource should be defined`).toBeDefined();
      expect(Array.isArray(docViewerUserFeaturePermissions), `User features should be an array of permission for '${docViewerResourceName}'`).toBe(true);
      expect(docViewerUserFeaturePermissions.length).toBeGreaterThan(0);

      docViewerUserFeaturePermissions.forEach((permission) => {
        expect(permission).toHaveProperty('Resource_Name', docViewerResourceName);
        expect(permission).toHaveProperty('Resource_Id');
        expect(permission).toHaveProperty('Permission_Name');
        expect(permission).toHaveProperty('Permission_Id');
      });
    });
  });
});
