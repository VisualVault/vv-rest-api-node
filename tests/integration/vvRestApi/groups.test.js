import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('GroupsManager Integration Tests', () => {
  let config;
  let client;
  let testGroupId; // Discovered from getGroups
  let testUserId; // Discovered from getGroupsUsers
  let createdGroupId; // Track group we create for cleanup
  let testSiteId;

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
    if (createdGroupId) {
      try {
        await client.groups.deleteGroup({}, createdGroupId);
        console.log('Cleanup - deleted group:', createdGroupId);
      } catch (err) {
        console.log('Cleanup group failed:', createdGroupId, err.message);
      }
    }
  });

  describe('getGroups', () => {
    it('should return list of all groups', async () => {
      const response = await client.groups.getGroups({});

      expect(response, 'getGroups should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getGroups should return success status').toBe(200);
      expect(data.data, 'Response should contain groups array').toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length, 'Should have at least one group').toBeGreaterThan(0);

      // Find VaultAccess group which should have users, otherwise use first group
      const vaultAccessGroup = data.data.find(g => g.name === 'VaultAccess');
      testGroupId = vaultAccessGroup?.id || data.data[0]?.id;

      // Verify group object structure
      const group = data.data[0];
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
      expect(group).toHaveProperty('dataType', 'Group');

      const sitesResponse = await client.sites.getSites({});
      const sitesData = JSON.parse(sitesResponse);
      testSiteId = sitesData.data?.[0]?.id;
    });
  });

  describe('addGroup', () => {
    it('should create a group', async () => {
      expect(testSiteId, 'testSiteId should be discovered from getSites').toBeDefined();

      const groupName = `Test Group ${Date.now()}`;
      const createPayload = {
        siteId: testSiteId,
        name: groupName,
        description: 'Created by test'
      };

      const createResponse = await client.groups.addGroup({}, createPayload);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'addGroup should return success status').toBe(200);
      createdGroupId = createData.data.id;
      expect(createdGroupId).toBeDefined();
    });
  });

  describe('getGroupById', () => {
    it('should get an existing group by id', async () => {
      expect(createdGroupId, 'createdGroupId should be set by addGroup test').toBeDefined();

      const getResponse = await client.groups.getGroupById({}, createdGroupId);
      const getData = JSON.parse(getResponse);

      expect(getData.meta.status, 'getGroupById should return success status').toBe(200);
    });
  });

  describe('updateGroup', () => {
    it('should update an existing group', async () => {
      expect(createdGroupId, 'createdGroupId should be set by addGroup test').toBeDefined();
      expect(testSiteId, 'testSiteId should be discovered from getSites').toBeDefined();

      const updatedName = `Updated Group ${Date.now()}`;
      const updatePayload = {
        siteId: testSiteId,
        name: updatedName,
        description: 'Updated by test'
      };

      const updateResponse = await client.groups.updateGroup({}, createdGroupId, updatePayload);
      const updateData = JSON.parse(updateResponse);
      expect(updateData.meta.status, 'updateGroup should return success status').toBe(200);
    });
  });

  describe('deleteGroup', () => {
    it('should delete an existing group', async () => {
      expect(createdGroupId, 'createdGroupId should be set by addGroup test').toBeDefined();

      const deleteResponse = await client.groups.deleteGroup({}, createdGroupId);
      const deleteData = JSON.parse(deleteResponse);
      expect(deleteData.meta.status, 'deleteGroup should return success status').toBe(200);

      createdGroupId = null;
    });
  });

  describe('getGroupsUsers', () => {
    it('should return list of users in a group', async () => {
      expect(testGroupId, 'testGroupId should be set by getGroups test').toBeDefined();

      const response = await client.groups.getGroupsUsers({}, testGroupId);

      expect(response, 'getGroupsUsers should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getGroupsUsers response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getGroupsUsers should return success status').toBe(200);
      expect(data.data, 'Response should contain users array').toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);

      // Store a user ID for subsequent tests (may be empty if group has no users)
      if (data.data.length > 0) {
        testUserId = data.data[0].id;
        console.log('Found user in group:', testUserId);
      }
    });
  });

  describe('getGroupUser', () => {
    it('should get a specific user from a group', async () => {
      expect(testGroupId, 'testGroupId should be set by getGroups test').toBeDefined();

      expect(testUserId, 'testUserId should be set by getGroupsUsers test - group may have no users').toBeDefined();

      const response = await client.groups.getGroupUser({}, testGroupId, testUserId);

      expect(response, 'getGroupUser should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getGroupUser response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getGroupUser should return success status').toBe(200);
      expect(data.data, 'Response should contain user data').toBeDefined();
      expect(data.data).toHaveProperty('id', testUserId);
    });
  });

  describe('addUserToGroup / removeUserFromGroup', () => {
    it('should add and remove a user from a group', async () => {
      // Get the Home site (where users typically are)
      const sitesResponse = await client.sites.getSites({});
      const sitesData = JSON.parse(sitesResponse);
      const homeSite = sitesData.data.find(s => s.name === 'Home');

      expect(homeSite, 'Home site should exist for user operations').toBeDefined();

      // Get all groups and find a test group ON THE HOME SITE
      const groupsResponse = await client.groups.getGroups({});
      const groupsData = JSON.parse(groupsResponse);

      // Find a test group on the same site as users (Home site)
      let testGroup = groupsData.data.find(g =>
        (g.name.startsWith('Test Group') || g.name.startsWith('Updated Test Group')) &&
        g.siteId === homeSite.id
      );

      // If no test group exists on Home site, create one
      if (!testGroup) {
        const newGroupData = {
          name: `Test Group ${Date.now()}`,
          description: 'Integration test group for user operations'
        };
        const createResponse = await client.sites.postGroups({}, newGroupData, homeSite.id);
        const createData = JSON.parse(createResponse);

        expect(createData.meta.status, 'Should be able to create test group').toBe(200);
        testGroup = createData.data;
        createdGroupId = testGroup.id; // Track for cleanup
        console.log('Created test group on Home site:', testGroup.id);
      }

      // Get users from Home site
      const usersResponse = await client.users.getUsers({}, homeSite.id);
      const usersData = JSON.parse(usersResponse);

      expect(usersData.data.length, 'Should have at least one user to test with').toBeGreaterThan(0);

      // Get users already in the test group
      const groupUsersResponse = await client.groups.getGroupsUsers({}, testGroup.id);
      const groupUsersData = JSON.parse(groupUsersResponse);
      const existingUserIds = new Set(groupUsersData.data.map(u => u.id));

      // Find a user not already in the group
      const userToAdd = usersData.data.find(u => !existingUserIds.has(u.id));

      if (!userToAdd) {
        // All users already in group - test remove then add
        const existingUser = groupUsersData.data[0];
        console.log('All users already in group, testing remove then add with:', existingUser.id);

        // Remove first
        const removeResponse = await client.groups.removeUserFromGroup({}, testGroup.id, existingUser.id);
        const removeData = JSON.parse(removeResponse);
        expect(removeData.meta.status, 'Remove user from group should return success status').toBe(200);

        // Then add back
        const addResponse = await client.groups.addUserToGroup({}, testGroup.id, existingUser.id);
        const addData = JSON.parse(addResponse);
        expect(addData.meta.status, 'Add user to group should return 201 Created').toBe(201);
      } else {
        // Add user to test group
        const addResponse = await client.groups.addUserToGroup({}, testGroup.id, userToAdd.id);
        const addData = JSON.parse(addResponse);

        console.log('addUserToGroup response:', JSON.stringify(addData, null, 2));

        expect(addData).toHaveProperty('meta');
        expect(addData.meta.status, 'Add user to group should return 201 Created').toBe(201);

        // Remove user from group (cleanup)
        const removeResponse = await client.groups.removeUserFromGroup({}, testGroup.id, userToAdd.id);
        const removeData = JSON.parse(removeResponse);

        console.log('removeUserFromGroup response:', JSON.stringify(removeData, null, 2));

        expect(removeData).toHaveProperty('meta');
        expect(removeData.meta.status, 'Remove user from group should return success status').toBe(200);
      }
    });
  });
});
