import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('DropdownListsManager Integration Tests', () => {
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

  async function createTestList(suffix = Date.now()) {
    const response = await client.dropdownLists.addDropDownList(
      {},
      `Test Dropdown List ${suffix}`,
      'list created by test',
      [
        { itemName: 'Item One' },
        { itemName: 'Item Two' }
      ]
    );
    const data = JSON.parse(response);
    expect(data.meta.status, 'addDropDownList should return success status').toBe(200);
    return data.data.listId;
  }

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
        const list = data.data[0];
        expect(list).toHaveProperty('listID');
        expect(list).toHaveProperty('listName');
      }
    });
  });

  describe('addDropDownList', () => {
    let createdListId;

    afterEach(async () => {
      if (createdListId) {
        try {
          await client.dropdownLists.deleteDropDownList({}, createdListId);
          console.log('Cleanup - deleted dropdown list:', createdListId);
        } catch (err) {
          console.log('Cleanup dropdown list failed:', createdListId, err.message);
        }
        createdListId = null;
      }
    });

    it('should create a new dropdown list', async () => {
      const testName = `Test Dropdown List ${Date.now()}`;
      const testDescription = 'Created by integration test';
      const testItems = [
        { itemName: 'Item One', itemValue: 'One' },
        { itemName: 'Item Two', itemValue: 'Two' }
      ];

      const response = await client.dropdownLists.addDropDownList({}, testName, testDescription, testItems);

      expect(response, 'addDropDownList should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('addDropDownList response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'addDropDownList should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('with existing dropdown list', () => {
    let createdListId;

    beforeEach(async () => {
      createdListId = await createTestList(`testList-${Date.now()}`);
    });

    afterEach(async () => {
      if (createdListId) {
        try {
          await client.dropdownLists.deleteDropDownList({}, createdListId);
        } catch (err) {
          console.log('Cleanup dropdown list failed:', createdListId, err.message);
        }
        createdListId = null;
      }
    });

    describe('getDropDownListById', () => {
      it('should return a specific dropdown list by id', async () => {
        const response = await client.dropdownLists.getDropDownListById({}, createdListId);

        expect(response, 'getDropDownListById should return a response').toBeDefined();
        const data = JSON.parse(response);

        expect(data).toHaveProperty('meta');
        expect(data.meta.status, 'getDropDownListById should return success status').toBe(200);
        expect(data).toHaveProperty('data');
        expect(data.data).toHaveProperty('listId', createdListId);
      });
    });

    describe('getDropDownListItemsById', () => {
      it('should return items for a specific dropdown list', async () => {
        const response = await client.dropdownLists.getDropDownListItemsById({}, createdListId);

        expect(response, 'getDropDownListItemsById should return a response').toBeDefined();
        const data = JSON.parse(response);

        console.log('getDropDownListItemsById response:', JSON.stringify(data, null, 2));

        expect(data).toHaveProperty('meta');
        expect(data.meta.status, 'getDropDownListItemsById should return success status').toBe(200);
        expect(data).toHaveProperty('data');
        expect(Array.isArray(data.data), 'data should be an array').toBe(true);
      });
    });

    describe('updateDropDownList', () => {
      it('should update an existing dropdown list', async () => {
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
      let createdItemId;

      beforeEach(async () => {
        const itemsResponse = await client.dropdownLists.getDropDownListItemsById({}, createdListId);
        const itemsData = JSON.parse(itemsResponse);
        expect(itemsData.meta.status, 'getDropDownListItemsById should return success status').toBe(200);
        expect(itemsData.data.length, 'Dropdown list should have at least one item').toBeGreaterThan(0);
        createdItemId = itemsData.data[0].listId;
      });

      afterEach(() => {
        createdItemId = null;
      });

      it('should delete an item from a dropdown list', async () => {
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
        const response = await client.dropdownLists.deleteDropDownList({}, createdListId);

        expect(response, 'deleteDropDownList should return a response').toBeDefined();
        const data = JSON.parse(response);

        console.log('deleteDropDownList response:', JSON.stringify(data, null, 2));

        expect(data).toHaveProperty('meta');
        expect(data.meta.status, 'deleteDropDownList should return success status').toBe(200);

        createdListId = null;
      });
    });
  });
});
