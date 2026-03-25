import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
// Import setup.js first to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';
import { MemberType, RoleType } from '../../../lib/constants.js';

describeIf(canRunIntegrationTests())('LibraryManager Integration Tests', () => {
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

  // Helper to create a test folder
  async function createTestFolder(suffix = '') {
    const date = new Date();
    const folderPath = `/Test Folders/Library Integration Test/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/${suffix || date.getTime()}`;
    const folderData = { description: 'Library integration test folder - safe to delete' };
    const response = await client.library.postFolderByPath({}, folderData, folderPath);
    const data = JSON.parse(response);
    expect(data.meta.status, 'Folder creation should succeed').toBe(200);
    return { folderId: data.data.id, folderPath };
  }

  describe('getFolders', () => {
    it('should return folder by path', async () => {
      const response = await client.library.getFolders({ folderpath: '/' });

      expect(response, 'getFolders should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFolders response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFolders should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('getFolderByPath', () => {
    it('should return a folder by path', async () => {
      const response = await client.library.getFolderByPath({}, '/');

      expect(response, 'getFolderByPath should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFolderByPath should return success status').toBe(200);
    });
  });

  describe('postFolderByPath', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should create a new folder by path', async () => {
      const date = new Date();
      const folderPath = `/Test Folders/Library Integration Test/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/${date.getTime()}`;

      const folderData = {
        description: 'Library integration test folder - safe to delete'
      };

      const response = await client.library.postFolderByPath({}, folderData, folderPath);

      expect(response, 'postFolderByPath should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postFolderByPath response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Folder creation should return success status').toBe(200);
      expect(data.data, 'Response should contain folder data').toBeDefined();
      expect(data.data.id, 'Response should include folder ID').toBeDefined();

      folderId = data.data.id;
    }, 60000);
  });

  describe('putFolder', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should update an existing folder', async () => {
      const result = await createTestFolder(`putFolder-${Date.now()}`);
      folderId = result.folderId;

      const newDescription = `Updated description ${Date.now()}`;
      const updatedData = {
        description: newDescription
      };

      const response = await client.library.putFolder({}, updatedData, folderId);

      expect(response, 'putFolder should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('putFolder response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'putFolder should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id', folderId);
      expect(data.data).toHaveProperty('description', newDescription);
    });
  });

  describe('getFolderIndexFields', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should return index fields for a folder', async () => {
      const result = await createTestFolder(`getFolderIndexFields-${Date.now()}`);
      folderId = result.folderId;

      const response = await client.library.getFolderIndexFields({}, folderId);

      expect(response, 'getFolderIndexFields should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFolderIndexFields response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFolderIndexFields should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('getFolderSecurityMembers', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should return security members for a folder', async () => {
      const result = await createTestFolder(`getFolderSecurityMembers-${Date.now()}`);
      folderId = result.folderId;

      const response = await client.library.getFolderSecurityMembers({}, folderId);

      expect(response, 'getFolderSecurityMembers should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFolderSecurityMembers response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFolderSecurityMembers should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('getDocuments', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should return documents in a folder', async () => {
      const result = await createTestFolder(`getDocuments-${Date.now()}`);
      folderId = result.folderId;

      const response = await client.library.getDocuments({}, folderId);

      expect(response, 'getDocuments should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getDocuments response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDocuments should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('copyFolder', () => {
    let sourceFolderId;
    let copiedFolderId;

    afterEach(async () => {
      // Clean up copied folder first
      if (copiedFolderId) {
        try {
          await client.library.deleteFolder(copiedFolderId);
          console.log('Cleanup - deleted copied folder:', copiedFolderId);
        } catch (error) {
          console.warn('Cleanup copied folder failed:', error.message);
        }
        copiedFolderId = null;
      }
      // Clean up source folder
      if (sourceFolderId) {
        try {
          await client.library.deleteFolder(sourceFolderId);
          console.log('Cleanup - deleted source folder:', sourceFolderId);
        } catch (error) {
          console.warn('Cleanup source folder failed:', error.message);
        }
        sourceFolderId = null;
      }
    });

    it('should copy a folder', async () => {
      const result = await createTestFolder(`copyFolder-source-${Date.now()}`);
      sourceFolderId = result.folderId;

      const date = new Date();
      const targetPath = `/Test Folders/Library Integration Test/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/Copied ${date.getTime()}`;
      const copyData = {
        sourceFolderId: sourceFolderId,
        targetFolderPath: targetPath
      };

      const response = await client.library.copyFolder({}, copyData);

      expect(response, 'copyFolder should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('copyFolder response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Copy folder should return success status').toBe(200);
      expect(data.data, 'Response should contain copied folder data').toBeDefined();
      expect(data.data.id, 'Response should include folder ID').toBeDefined();
      expect(data.data.id).not.toBe(sourceFolderId);

      copiedFolderId = data.data.id;
    }, 60000);
  });

  describe('updateFolderIndexFieldOverrideSettings', () => {
    let folderId;

    afterEach(async () => {
      if (folderId) {
        try {
          await client.library.deleteFolder(folderId);
          console.log('Cleanup - deleted test folder:', folderId);
        } catch (error) {
          console.warn('Cleanup folder failed:', error.message);
        }
        folderId = null;
      }
    });

    it('should update folder index field override settings', async () => {
      
      expect(config.testFolderIndexFieldId, 'Test folder index field ID is required').toBeDefined();

      const result = await createTestFolder(`updateFolderIndexFieldOverride-${Date.now()}`);
      folderId = result.folderId;

      const fieldId = config.testFolderIndexFieldId;
      const emptyGuid = '00000000-0000-0000-0000-000000000000';

      const response = await client.library.updateFolderIndexFieldOverrideSettings(
        folderId,
        fieldId,
        emptyGuid, // queryId - use empty GUID instead of null
        '',        // displayField
        '',        // valueField
        emptyGuid, // dropDownListId - use empty GUID instead of null
        false,     // required
        'Test Default'  // defaultValue
      );

      expect(response, 'updateFolderIndexFieldOverrideSettings should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('updateFolderIndexFieldOverrideSettings response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Update index field override should return success status').toBe(200);
    });
  });

  describe('postFolderAlertSubscription', () => {
    beforeEach(async () => {
      try {
        await client.securityMembers.putFolderSecurityMember(config.testFolderSecurityId, config.testFolderAlertUserId, MemberType.User, RoleType.Editor, false);
      } catch (e) {
        // Ignore errors if the member wasn't there
      }
    });
    afterEach(async () => {
      try {
        await client.securityMembers.deleteFolderAlertSubscription(config.testFolderSecurityId, config.testFolderAlertUserId, false);
      } catch (e) {
        // Ignore errors if the member wasn't there
      }
    });
    // Requires VV_TEST_FOLDER_SECURITY_ID and VV_TEST_FOLDER_EVENT_ID
    it('should create a folder alert subscription', async () => {
      expect(config.testFolderSecurityId, 'Test folder security ID is required').toBeDefined();
      expect(config.testFolderEventId, 'Test folder event ID is required').toBeDefined();
      expect(config.testFolderAlertUserId, 'Test folder alert user ID is required').toBeDefined();
      
      const folderId = config.testFolderSecurityId;
      const eventId = config.testFolderEventId;
      const userId = config.testFolderAlertUserId;;

      await client.library.putFolderSecurityMember(folderId, userId, MemberType.User, RoleType.Editor, false);

      const response = await client.library.postFolderAlertSubscription(folderId, eventId, userId);

      expect(response, 'postFolderAlertSubscription should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postFolderAlertSubscription response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Create alert subscription should return success status').toBe(200);
    });
  });

  describe('deleteFolderAlertSubscription', () => {
    it('should delete a folder alert subscription', async () => {
      expect(config.testFolderSecurityId, 'Test folder security ID is required').toBeDefined();
      expect(config.testFolderEventId, 'Test folder event ID is required').toBeDefined();
      
      const folderId = config.testFolderSecurityId;
      const eventId = config.testFolderEventId;
      const userId = config.testFolderAlertUserId || config.username;

      expect(userId, 'Test folder alert user ID is required').toBeDefined();

      const response = await client.library.deleteFolderAlertSubscription(folderId, eventId, userId);

      expect(response, 'deleteFolderAlertSubscription should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteFolderAlertSubscription response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Delete alert subscription should return success status').toBe(200);
    });
  });

  describe('putFolderSecurityMember', () => {
    beforeEach(async () => {
      try {
        await client.library.deleteFolderSecurityMember(config.testFolderSecurityId, config.testFolderSecurityMemberId, false);
      } catch (e) {
        // Ignore - resource may not exist yet
      }
    });
    it('should add or update a folder security member', async () => {
      expect(config.testFolderSecurityId, 'Test folder security ID is required').toBeDefined();
      expect(config.testFolderSecurityMemberId, 'Test folder security member ID is required').toBeDefined();

      const testSecurityFolderId = config.testFolderSecurityId;
      const memberId = config.testFolderSecurityMemberId;

      const response = await client.library.putFolderSecurityMember(
        testSecurityFolderId,
        memberId,
        MemberType.Group,      // memberType: 'User' or 'Group'
        RoleType.Viewer,    // securityRole: 'Owner', 'Editor', 'Viewer'
        false        // cascadeSecurityChanges
      );

      expect(response, 'putFolderSecurityMember should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('putFolderSecurityMember response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Add security member should return success status').toBe(200);
    });
  });

  describe('deleteFolderSecurityMember', () => {
    it('should delete a folder security member', async () => {
      expect(config.testFolderSecurityId, 'Test folder security ID is required').toBeDefined();
      expect(config.testFolderSecurityMemberId, 'Test folder security member ID is required').toBeDefined();

      const testSecurityFolderId = config.testFolderSecurityId;
      const memberId = config.testFolderSecurityMemberId;

      const response = await client.library.deleteFolderSecurityMember(
        testSecurityFolderId,
        memberId,
        false  // cascadeSecurityChanges
      );

      expect(response, 'deleteFolderSecurityMember should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteFolderSecurityMember response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Delete security member should return success status').toBe(200);
    });
  });

  describe('deleteFolder', () => {
    it('should delete a folder', async () => {
      // Create a folder to delete
      const result = await createTestFolder(`deleteFolder-${Date.now()}`);
      const folderId = result.folderId;

      const response = await client.library.deleteFolder(folderId);

      expect(response, 'deleteFolder should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteFolder response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Delete folder should return success status').toBe(200);
    });
  });

  describe('moveFolder', () => {
    let movedFolderId;

    afterEach(async () => {
      if (movedFolderId) {
        try {
          await client.library.deleteFolder(movedFolderId);
          console.log('Cleanup - deleted moved folder:', movedFolderId);
        } catch (error) {
          console.warn('Cleanup moved folder failed:', error.message);
        }
        movedFolderId = null;
      }
    });

    it('should move a folder', async () => {
      // Create a source folder to move
      const result = await createTestFolder(`moveFolder-source-${Date.now()}`);
      const sourceFolderId = result.folderId;

      // Move the folder to a new location
      const date = new Date();
      const targetPath = `/Test Folders/Library Integration Test/${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}/MoveDest ${date.getTime()}`;
      const moveData = {
        sourceFolderId: sourceFolderId,
        targetFolderPath: targetPath
      };

      const response = await client.library.moveFolder({}, moveData);

      expect(response, 'moveFolder should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('moveFolder response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'Move folder should return success status').toBe(200);

      // Store for cleanup - the moved folder has the same ID
      movedFolderId = sourceFolderId;
    }, 60000);
  });
});
