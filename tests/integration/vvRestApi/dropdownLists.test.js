import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('DropdownListsManager Integration Tests', () => {
  let config;
  let client;
  let createdListId;
  let createdItemId;

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

  afterAll(async () => {
    // Cleanup
    if (createdListId) {
      try {
        await client.dropdownLists.deleteDropDownList({}, createdListId);
        console.log('Cleanup - deleted dropdown list:', createdListId);
      } catch (err) {
        console.log('Cleanup dropdown list failed:', createdListId, err.message);
      }
    }
  });

  describe('getDropDownLists', () => {
    it('should return list of all dropdown lists', async () => {
      const response = await client.dropdownLists.getDropDownLists({});

      expect(response, 'getDropDownLists should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDropDownLists should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);

      if (data.data.length > 0) {
        firstListId = data.data[0].id;
        const list = data.data[0];
        expect(list).toHaveProperty('id');
        expect(list).toHaveProperty('name');
      }
    });
  });

  describe('addDropDownList', () => {
    it('should create a new dropdown list', async () => {
      const testName = `Test Dropdown List ${Date.now()}`;
      const testDescription = 'Created by integration test';
      const testItems = [
        { itemName: 'Item One' },
        { itemName: 'Item Two' }
      ];

      const response = await client.dropdownLists.addDropDownList({}, testName, testDescription, testItems);

      expect(response, 'addDropDownList should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('addDropDownList response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'addDropDownList should return success status').toBe(200);
      expect(data).toHaveProperty('data');

      createdListId = data.data.id;
      expect(createdListId, 'Created list should have an id').toBeDefined();
    });
  });

  describe('getDropDownListById', () => {
    it('should return a specific dropdown list by id', async () => {
      expect(createdListId, 'createdListId should be set by addDropDownList test').toBeDefined();

      const response = await client.dropdownLists.getDropDownListById({}, createdListId);

      expect(response, 'getDropDownListById should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDropDownListById should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('id', createdListId);
    });
  });

  describe('getDropDownListItemsById', () => {
    it('should return items for a specific dropdown list', async () => {
      expect(createdListId, 'createdListId should be set by addDropDownList test').toBeDefined();

      const response = await client.dropdownLists.getDropDownListItemsById({}, createdListId);

      expect(response, 'getDropDownListItemsById should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getDropDownListItemsById response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getDropDownListItemsById should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'data should be an array').toBe(true);

      if (data.data.length > 0) {
        createdItemId = data.data[0].id;
      }
    });
  });

  describe('updateDropDownList', () => {
    it('should update an existing dropdown list', async () => {
      expect(createdListId, 'createdListId should be set by addDropDownList test').toBeDefined();

      const updatedName = `Updated Test List ${Date.now()}`;
      const updatedDescription = 'Updated by integration test';
      const updatedItems = [
        { itemName: 'Updated Item One' },
        { itemName: 'Updated Item Two' },
        { itemName: 'New Item Three' }
      ];

      const response = await client.dropdownLists.updateDropDownList({}, createdListId, updatedName, updatedDescription, updatedItems);

      expect(response, 'updateDropDownList should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('updateDropDownList response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'updateDropDownList should return success status').toBe(200);
    });
  });

  describe('deleteDropDownListItem', () => {
    it('should delete an item from a dropdown list', async () => {
      expect(createdListId, 'createdListId should be set by addDropDownList test').toBeDefined();
      expect(createdItemId, 'createdItemId should be set by getDropDownListItemsById test').toBeDefined();

      const response = await client.dropdownLists.deleteDropDownListItem({}, createdListId, [createdItemId]);

      expect(response, 'deleteDropDownListItem should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteDropDownListItem response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'deleteDropDownListItem should return success status').toBe(200);
    });
  });

  describe('deleteDropDownList', () => {
    it('should delete a dropdown list', async () => {
      expect(createdListId, 'createdListId should be set by addDropDownList test').toBeDefined();

      const response = await client.dropdownLists.deleteDropDownList({}, createdListId);

      expect(response, 'deleteDropDownList should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('deleteDropDownList response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'deleteDropDownList should return success status').toBe(200);

      createdListId = null; // Already cleaned up
    });
  });
});
