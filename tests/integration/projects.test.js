import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

// Conditional test runner - requires both project ID and event ID
const canRunProjectTests = process.env.VV_TEST_PROJECT_ID && process.env.VV_TEST_PROJECT_EVENT_ID;
const runTest = canRunProjectTests ? it : it.skip;

describeIf(canRunIntegrationTests())('ProjectsManager Integration Tests', () => {
  let config;
  let client;
  let testUserId;

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

    // Get the current user's ID for subscription tests
    const sitesResponse = await client.sites.getSites({});
    const sitesData = JSON.parse(sitesResponse);
    const homeSite = sitesData.data.find(s => s.name === 'Home');

    if (homeSite) {
      const usersResponse = await client.users.getUsers({}, homeSite.id);
      const usersData = JSON.parse(usersResponse);
      // Find the current user or use first available
      const currentUser = usersData.data.find(u => u.userId === config.username) || usersData.data[0];
      if (currentUser) {
        testUserId = currentUser.id;
      }
    }
  }, 60000);

  describe('postProjectAlertSubscription', () => {
    // Requires VV_TEST_PROJECT_ID and VV_TEST_PROJECT_EVENT_ID
    runTest('should subscribe user to project alerts', async () => {
      const projectId = config.testProjectId;
      const eventId = config.testProjectEventId;

      expect(testUserId, 'testUserId should be available').toBeDefined();

      const response = await client.projects.postProjectAlertSubscription(projectId, eventId, testUserId);

      expect(response, 'postProjectAlertSubscription should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postProjectAlertSubscription response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'postProjectAlertSubscription should return success status').toBe(200);
    });
  });

  describe('deleteProjectAlertSubscription', () => {
    // Requires VV_TEST_PROJECT_ID and VV_TEST_PROJECT_EVENT_ID
    runTest('should unsubscribe user from project alerts', async () => {
      const projectId = config.testProjectId;
      const eventId = config.testProjectEventId;

      expect(testUserId, 'testUserId should be available').toBeDefined();

      const response = await client.projects.deleteProjectAlertSubscription(projectId, eventId, testUserId);

      expect(response, 'deleteProjectAlertSubscription should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteProjectAlertSubscription response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'deleteProjectAlertSubscription should return success status').toBe(200);
    });
  });
});
