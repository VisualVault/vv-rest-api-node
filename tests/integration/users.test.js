import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('UsersManager Integration Tests', () => {
  let config;
  let client;
  let testSiteId; // Home site ID
  let testUserId; // Discovered from getUsers

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

    // Get the Home site ID for user queries
    const sitesResponse = await client.sites.getSites({});
    const sitesData = JSON.parse(sitesResponse);
    const homeSite = sitesData.data.find(s => s.name === 'Home');
    testSiteId = homeSite?.id || sitesData.data[0]?.id;
    expect(testSiteId, 'Should have a site ID for user queries').toBeDefined();
  }, 60000); // Allow up to 60s for authentication and site lookup

  describe('getUsers', () => {
    it('should return list of users in a site', async () => {
      const response = await client.users.getUsers({}, testSiteId);

      expect(response, 'getUsers should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUsers response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUsers should return success status').toBe(200);
      expect(data.data, 'Response should contain users array').toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length, 'Should have at least one user').toBeGreaterThan(0);

      // Store first user ID for subsequent tests
      testUserId = data.data[0].id;
      expect(testUserId, 'First user should have an ID').toBeDefined();

      // Verify user object structure
      const user = data.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('userid');
      expect(user).toHaveProperty('dataType', 'User');
    });
  });

  describe('getUser', () => {
    it('should return the current authenticated user', async () => {
      const response = await client.users.getUser({});

      expect(response, 'getUser should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUser should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      // getUser returns an array with the current user
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);
      expect(data.data.length, 'Should return at least one user').toBeGreaterThan(0);
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('userid');
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();

      const response = await client.users.getUserById({}, testUserId);

      expect(response, 'getUserById should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserById response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserById should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data.id, 'Returned user should match requested ID').toBe(testUserId);
    });
  });

  describe('getUserGroups', () => {
    it('should return groups for a user', async () => {
      expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();

      const response = await client.users.getUserGroups({}, testUserId);

      expect(response, 'getUserGroups should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserGroups response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserGroups should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);
    });
  });

  describe('getUserSupervisors', () => {
    it('should return supervisors for a user', async () => {
      expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();

      const response = await client.users.getUserSupervisors({}, testUserId);

      expect(response, 'getUserSupervisors should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserSupervisors response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserSupervisors should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);
    });
  });

  describe('getUserSupervisees', () => {
    it('should return supervisees for a user', async () => {
      expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();

      const response = await client.users.getUserSupervisees({}, testUserId);

      expect(response, 'getUserSupervisees should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserSupervisees response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserSupervisees should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);
    });
  });

  describe('getUserJwt', () => {
    it('should return a JWT for the current user', async () => {
      const response = await client.users.getUserJwt();

      expect(response, 'getUserJwt should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserJwt response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserJwt should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('postUsers / putUsers', () => {
    it.skip('should create and update a user', async () => {
      // SKIPPED Server returns 404 - needs server configuration investigation
      // This test creates real users - enable only when needed
      // Users cannot be deleted via API, so use sparingly
      expect(testSiteId, 'testSiteId should be set in beforeAll').toBeDefined();

      const userData = {
        userid: `testuser_${Date.now()}`,
        firstname: 'Test',
        lastname: 'User',
        emailaddress: `testuser_${Date.now()}@example.com`,
        password: 'TestPassword123!',
        passwordNeverExpires: 'false',
        mustChangePassword: 'true',
        sendEmail: 'false'
      };

      const createResponse = await client.users.postUsers({}, userData, testSiteId);
      const createData = JSON.parse(createResponse);

      console.log('postUsers response:', JSON.stringify(createData, null, 2));

      expect(createData).toHaveProperty('meta');
      expect([200, 201]).toContain(createData.meta.status);

      // Update the user
      const updateData = {
        firstName: 'Updated',
        lastName: 'TestUser'
      };

      const updateResponse = await client.users.putUsers({}, updateData, testSiteId, createData.data.id);
      const updateResult = JSON.parse(updateResponse);

      console.log('putUsers response:', JSON.stringify(updateResult, null, 2));

      expect(updateResult).toHaveProperty('meta');
      expect(updateResult.meta.status).toBe(200);
    });
  });

  describe('getUserLoginToken', () => {
    it('should get a login token for a user', async () => {
      // This generates a login token - use carefully
      expect(testUserId, 'testUserId should be set by getUsers test').toBeDefined();

      const response = await client.users.getUserLoginToken(testUserId);

      expect(response, 'getUserLoginToken should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getUserLoginToken response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getUserLoginToken should return success status').toBe(200);
    });
  });

  describe('resetPassword / updateUserId', () => {
    it.skip('should reset password and update userId', async () => {
      // These are destructive operations - enable only when testing specific functionality
      // resetPassword sends emails, updateUserId changes login credentials
    });
  });
});
