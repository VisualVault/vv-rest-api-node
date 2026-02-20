import { describe, it, expect, beforeAll } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';
import { RoleType } from '../../../lib/constants.js';

// Conditional test runners - require parent and member IDs for security operations
const skipGetTest = !process.env.VV_TEST_SECURITY_PARENT_ID;
const skipModifyTest = !(process.env.VV_TEST_SECURITY_PARENT_ID && process.env.VV_TEST_SECURITY_MEMBER_ID);

describeIf(canRunIntegrationTests())('SecurityMembersManager Integration Tests', () => {
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

  describe('getSecurityMembersForParentId', () => {
    // Requires VV_TEST_SECURITY_PARENT_ID
    it.skipIf(skipGetTest)('should get security members for a parent', async () => {
      const parentId = config.testSecurityParentId;

      const response = await client.securityMembers.getSecurityMembersForParentId(parentId);

      expect(response, 'getSecurityMembersForParentId should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getSecurityMembersForParentId response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getSecurityMembersForParentId should return success status').toBe(200);
    });
  });

  describe('addSecurityMember', () => {
    beforeEach(async () => {
      try {
        await client.securityMembers.removeSecurityMember(config.testSecurityParentId, config.testSecurityMemberId);
      } catch (e) {
        // Ignore - resource may not exist yet
      }
    });
    // Requires VV_TEST_SECURITY_PARENT_ID and VV_TEST_SECURITY_MEMBER_ID
    it.skipIf(skipModifyTest)('should add a security member', async () => {
      const parentId = config.testSecurityParentId;
      const memberId = config.testSecurityMemberId;

      console.log('DEBUG: parentId type:', typeof parentId, `Value: "${parentId}"`);
      console.log('DEBUG: memberId type:', typeof memberId, `Value: "${memberId}"`);

      const response = await client.securityMembers.addSecurityMember(parentId, memberId, RoleType.Viewer, false);

      expect(response, 'addSecurityMember should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('addSecurityMember response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'addSecurityMember should return success status').toBe(201);
    });
  });

  describe('updateSecurityMember', () => {
    // Requires VV_TEST_SECURITY_PARENT_ID and VV_TEST_SECURITY_MEMBER_ID
    it.skipIf(skipModifyTest)('should update a security member role', async () => {
      const parentId = config.testSecurityParentId;
      const memberId = config.testSecurityMemberId;

      const response = await client.securityMembers.updateSecurityMember(parentId, memberId, RoleType.Editor);

      expect(response, 'updateSecurityMember should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('updateSecurityMember response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'updateSecurityMember should return success status').toBe(200);
    });
  });

  describe('removeSecurityMember', () => {
    // Requires VV_TEST_SECURITY_PARENT_ID and VV_TEST_SECURITY_MEMBER_ID
    it.skipIf(skipModifyTest)('should remove a security member', async () => {
      const parentId = config.testSecurityParentId;
      const memberId = config.testSecurityMemberId;

      const response = await client.securityMembers.removeSecurityMember(parentId, memberId);

      expect(response, 'removeSecurityMember should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('removeSecurityMember response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'removeSecurityMember should return success status').toBe(200);
    });
  });
});
