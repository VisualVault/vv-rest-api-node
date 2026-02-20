import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('SitesManager Integration Tests', () => {
  let config;
  let client;
  let testSiteId; // Shared test site for multiple tests

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

  afterAll(async () => {
    // Note: No deleteSite method available in the API
    // Created test sites will persist but can be reused on subsequent runs
    if (testSiteId) {
      console.log('Note: Test site was created:', testSiteId, '(no delete API available)');
    }
  });

  describe('getSites', () => {
    it('should return list of sites', async () => {
      const response = await client.sites.getSites({});

      expect(response, 'getSites should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getSites should return success status').toBe(200);
      expect(data.data, 'Response should contain sites array').toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length, 'Should have at least one site').toBeGreaterThan(0);

      // Verify site object structure
      const site = data.data[0];
      expect(site).toHaveProperty('id');
      expect(site).toHaveProperty('name');
      expect(site).toHaveProperty('dataType', 'Site');
    });
  });

  describe('postSites', () => {
    it('should create a new site', async () => {
      const testSiteData = {
        name: `Test Site ${Date.now()}`,
        description: 'Integration test site - safe to delete',
        siteType: 'Location'
      };

      const response = await client.sites.postSites({}, testSiteData);

      expect(response, 'postSites should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Site creation should return success status').toBe(200);
      expect(data.data, 'Response should contain site data').toBeDefined();
      expect(data.data.id, 'Response should include site ID').toBeDefined();
      expect(data.data.name).toBe(testSiteData.name);
      expect(data.data.description).toBe(testSiteData.description);

      // Store for subsequent tests
      testSiteId = data.data.id;
    });
  });

  describe('putSites', () => {
    it('should update an existing site', async () => {
      expect(testSiteId, 'testSiteId should be set by postSites test').toBeDefined();

      const updatedData = {
        name: `Updated Test Site ${Date.now()}`,
        description: `Updated description ${Date.now()}`
      };

      const response = await client.sites.putSites({}, updatedData, testSiteId);

      expect(response, 'putSites should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('putSites response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Site update should return success status').toBe(200);
      expect(data.data, 'Response should contain site data').toBeDefined();
      expect(data.data.name).toBe(updatedData.name);
      expect(data.data.description).toBe(updatedData.description);
    });
  });

  describe('getGroups', () => {
    it('should return list of groups for a site', async () => {
      expect(testSiteId, 'testSiteId should be set by postSites test').toBeDefined();

      const response = await client.sites.getGroups({}, testSiteId);

      expect(response, 'getGroups should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getGroups should return success status').toBe(200);
      expect(data.data, 'Response should contain groups array').toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('postGroups', () => {
    let testGroupId;

    it('should create a new group in a site', async () => {
      expect(testSiteId, 'testSiteId should be set by postSites test').toBeDefined();

      const groupData = {
        name: `Test Group ${Date.now()}`,
        description: 'Integration test group - safe to delete'
      };

      const response = await client.sites.postGroups({}, groupData, testSiteId);

      expect(response, 'postGroups should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postGroups response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Group creation should return success status').toBe(200);
      expect(data.data, 'Response should contain group data').toBeDefined();
      expect(data.data.id, 'Response should include group ID').toBeDefined();
      expect(data.data.name).toBe(groupData.name);

      // Store for putGroups test
      testGroupId = data.data.id;
    });

    it('should update an existing group', async () => {
      expect(testSiteId, 'testSiteId should be set by postSites test').toBeDefined();
      expect(testGroupId, 'testGroupId should be set by postGroups test').toBeDefined();

      const updatedData = {
        name: `Updated Test Group ${Date.now()}`,
        description: `Updated group description ${Date.now()}`
      };

      const response = await client.sites.putGroups({}, updatedData, testSiteId, testGroupId);

      expect(response, 'putGroups should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('putGroups response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Group update should return success status').toBe(200);
      expect(data.data, 'Response should contain group data').toBeDefined();
      expect(data.data.name).toBe(updatedData.name);
    });
  });

  describe('changeUserSite', () => {
    it('should move a user to a different site and back', async () => {
      expect(testSiteId, 'testSiteId should be set by postSites test').toBeDefined();

      // Get the Home site
      const sitesResponse = await client.sites.getSites({});
      const sitesData = JSON.parse(sitesResponse);
      const homeSite = sitesData.data.find(s => s.name === 'Home');

      expect(homeSite, 'Home site should exist for user operations').toBeDefined();

      // Get users from Home site
      const usersResponse = await client.users.getUsers({}, homeSite.id);
      const usersData = JSON.parse(usersResponse);

      expect(usersData.data.length, 'Should have at least one user to test with').toBeGreaterThan(0);

      const userToMove = usersData.data[0];
      const originalSiteId = userToMove.siteId;

      // Move user to test site
      const moveResponse = await client.sites.changeUserSite(userToMove.id, testSiteId);
      const moveData = JSON.parse(moveResponse);

      console.log('changeUserSite (to test site) response:', JSON.stringify(moveData, null, 2));

      expect(moveData).toHaveProperty('meta');
      expect(moveData.meta.status, 'Move user to test site should return success status').toBe(200);

      // Move user back to original site (cleanup)
      const revertResponse = await client.sites.changeUserSite(userToMove.id, originalSiteId);
      const revertData = JSON.parse(revertResponse);

      console.log('changeUserSite (revert) response:', JSON.stringify(revertData, null, 2));

      expect(revertData).toHaveProperty('meta');
      expect(revertData.meta.status, 'Move user back should return success status').toBe(200);
    });
  });
});
