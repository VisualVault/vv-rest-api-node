import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('ObjectsManager Integration Tests', () => {
  let config;
  let client;
  let testObjectInstanceId; // ID of the object
  let testObjectModelId;    // ID of the model

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

    testObjectInstanceId = config.testObjectInstanceId;
    testObjectModelId = config.testObjectModelId;
  }, 60000); // Allow up to 60s for authentication

  describe('getObject', () => {
    it('should retrieve an object instance by its ID', async () => {
      expect(testObjectInstanceId, 'testObjectInstanceId should be set by beforeAll').toBeDefined();

      const params = {};

      const objectResponse = await client.objectsApi.objects.getObject(testObjectInstanceId, params);
      const objectData = JSON.parse(objectResponse);

      console.log('getObject response:', JSON.stringify(objectData, null, 2));

      expect(objectData).toHaveProperty('meta');
      expect(objectData.meta.status, 'getObject should return 200 Success').toBe(200);
      expect(objectData).toHaveProperty('data');

      const { data: objectInfo } = objectData;

      expect(objectInfo, 'Retrieved object data should be defined').toBeDefined();
      expect(objectInfo).toHaveProperty('id');
      expect(objectInfo).toHaveProperty('modelId');
      expect(objectInfo).toHaveProperty('revisionId');
      expect(objectInfo).toHaveProperty('properties');
      expect(objectInfo.properties).toBeTypeOf('object');
    });

    it('should retrieve an object instance including its related objects', async () => {
      expect(testObjectInstanceId, 'testObjectInstanceId should be set by beforeAll').toBeDefined();

      const params = {
        includeRelated: true
      };

      const objectResponse = await client.objectsApi.objects.getObject(testObjectInstanceId, params);
      const objectData = JSON.parse(objectResponse);

      console.log('getObject response:', JSON.stringify(objectData, null, 2));

      expect(objectData).toHaveProperty('meta');
      expect(objectData.meta.status, 'getObject should return 200 Success').toBe(200);
      expect(objectData).toHaveProperty('data');

      const { data: objectInfo } = objectData;

      expect(objectInfo, 'Retrieved object data should be defined').toBeDefined();
      expect(objectInfo).toHaveProperty('id');
      expect(objectInfo).toHaveProperty('modelId');
      expect(objectInfo).toHaveProperty('revisionId');
      expect(objectInfo).toHaveProperty('properties');
      expect(objectInfo.properties).toBeTypeOf('object');

      expect(objectInfo).toHaveProperty('relatedObjects');
      expect(Array.isArray(objectInfo.relatedObjects)).toBe(true);
    });
  });

  describe('getObjectsByModelId', () => {
    it('should retrieve objects by their model', async () => {
      expect(testObjectModelId, 'testObjectModelId should be set by beforeAll').toBeDefined();

      const data = {};
      const params = {};

      const objectsResponse = await client.objectsApi.objects.getObjectsByModelId(testObjectModelId, data, params);
      const objectsData = JSON.parse(objectsResponse);

      console.log('getObjectsByModelId response:', JSON.stringify(objectsData, null, 2));

      expect(objectsData).toHaveProperty('meta');
      expect(objectsData.meta.status, 'getObjectsByModelId should return 200 Success').toBe(200);
      expect(objectsData).toHaveProperty('data');

      const { data: objectResults } = objectsData;

      expect(objectResults).toHaveProperty('total');
      expect(objectResults.total).toBeTypeOf('number');
      expect(objectResults).toHaveProperty('result');
      expect(Array.isArray(objectResults.result)).toBe(true);

      const [firstObject] = objectResults.result;

      expect(firstObject, 'Retrieved object result should be defined').toBeDefined();
      expect(firstObject).toHaveProperty('id');
      expect(firstObject).toHaveProperty('modelId', testObjectModelId);
      expect(firstObject).toHaveProperty('revisionId');
      expect(firstObject).toHaveProperty('properties');
      expect(firstObject.properties).toBeTypeOf('object');
    });
  });

  describe('createObject / updateObject', () => {
    let instanceId;
    let modelInfo;

    beforeEach(async () => {
      expect(testObjectModelId, 'testObjectModelId should be set by beforeAll').toBeDefined();

      try {
        const modelResponse = await client.objectsApi.models.getModelById(testObjectModelId);
        const modelData = JSON.parse(modelResponse);

        const { data: testModelInfo } = modelData;

        modelInfo = testModelInfo;

        console.log('Initializer - retrieved model info:', JSON.stringify(modelInfo, null, 2));
      }
      catch (error) {
        console.warn('Initializer - model info failed:', error.message);
      }
    });
    afterEach(async () => {
      if (instanceId) {
        try {
          await client.objectsApi.objects.deleteObject(instanceId);
          console.log('Cleanup - deleted object instance:', instanceId);
        } catch (error) {
          console.warn('Cleanup - object instance failed:', error.message);
        }
        instanceId = null;
        modelInfo = null;
      }
    });

    it('should create and update an object', async () => {
      expect(modelInfo, 'modelInfo should be set by beforeEach').toBeDefined();
      expect(Array.isArray(modelInfo.propertyList)).toBe(true);

      /* CREATE OBJECT */

      // Define minimal object creation parameters
      const properties = modelInfo.propertyList.reduce((props, property, i) => {
        if (property.type == 0) { // Text
          props[property.id] = `prop-${i}-${property.name}`;
        }
        return props;
      }, {});

      const createData = { properties };
      const createParams = {};

      const createObjectResponse = await client.objectsApi.objects.createObject(testObjectModelId, createData, createParams);
      const createObjectData = JSON.parse(createObjectResponse);

      console.log('createObject response:', JSON.stringify(createObjectData, null, 2));

      expect(createObjectData).toHaveProperty('meta');
      expect(createObjectData.meta.status, 'createObject should return 200 Success').toBe(200);
      expect(createObjectData).toHaveProperty('data');

      // Store the created object instance data
      const { data: newObjectInfo } = createObjectData;
      expect(newObjectInfo, 'Created object instance should be defined').toBeDefined();
      instanceId = newObjectInfo.id;

      expect(newObjectInfo).toHaveProperty('id');
      expect(newObjectInfo).toHaveProperty('modelId', testObjectModelId);
      expect(newObjectInfo).toHaveProperty('revisionId');
      expect(newObjectInfo).toHaveProperty('properties');
      expect(newObjectInfo.properties).toBeTypeOf('object');

      /* UPDATE OBJECT */

      // Define minimal object update parameters
      const [ [updatePropKey, firstPropVal] ] = Object.entries(createData.properties);
      const updateData = {
        properties: {
          [updatePropKey]: `updated-${firstPropVal}`
        }
      }
      const updateParams = {};

      const updateObjectResponse = await client.objectsApi.objects.updateObject(newObjectInfo.id, newObjectInfo.revisionId, updateData, updateParams);
      const updateObjectData = JSON.parse(updateObjectResponse);

      console.log('updateObject response:', JSON.stringify(updateObjectData, null, 2));

      expect(updateObjectData).toHaveProperty('meta');
      expect(updateObjectData.meta.status, 'terminateWorkflow should return 200 Success').toBe(200);
      expect(updateObjectData).toHaveProperty('data');

      // Store the updated object instance data
      const { data: updatedObjectInfo } = updateObjectData;
      expect(updatedObjectInfo, 'Updated object instance should be defined').toBeDefined();

      expect(updatedObjectInfo).toHaveProperty('id', instanceId);
      expect(updatedObjectInfo).toHaveProperty('modelId', testObjectModelId);
      expect(updatedObjectInfo).toHaveProperty('revisionId');
      expect(updatedObjectInfo.revisionId, 'Updated object should have a new revision ID').not.toEqual(newObjectInfo.revisionId);
      expect(updatedObjectInfo).toHaveProperty('revision');
      expect(updatedObjectInfo.revision).toBeGreaterThan(newObjectInfo.revision);

      expect(updatedObjectInfo).toHaveProperty('properties');
      expect(updatedObjectInfo.properties).toBeTypeOf('object');
      expect(updatedObjectInfo.properties).toHaveProperty(updatePropKey);
    });
  });

  describe('deleteObject', () => {
    let instanceId;

    beforeEach(async () => {
      expect(testObjectModelId, 'testObjectModelId should be set by beforeAll').toBeDefined();

      try {
        const modelResponse = await client.objectsApi.models.getModelById(testObjectModelId);
        const modelData = JSON.parse(modelResponse);

        const { data: testModelInfo } = modelData;

        const properties = testModelInfo.propertyList.reduce((props, property, i) => {
          if (property.type == 0) { // Text
            props[property.id] = `prop-${i}-${property.name}`;
          }
          return props;
        }, {});

        const createData = { properties };
        const createParams = {};

        const createObjectResponse = await client.objectsApi.objects.createObject(testObjectModelId, createData, createParams);
        const createObjectData = JSON.parse(createObjectResponse);

        instanceId = createObjectData.data.id; 

        console.log('Initializer - created object instance:', JSON.stringify(instanceId, null, 2));
      }
      catch (error) {
        console.warn('Initializer - object instance failed:', error.message);
      }
    });

    it('should delete an object instance', async () => {
      const params = {};

      const deleteResponse = await client.objectsApi.objects.deleteObject(instanceId, params);
      const deleteData = JSON.parse(deleteResponse);

      console.log('deleteObject response:', JSON.stringify(deleteData, null, 2));

      expect(deleteData).toHaveProperty('meta');
      expect(deleteData.meta.status, 'deleteObject should return 200 Success').toBe(200);
      expect(deleteData).toHaveProperty('data');
      expect(deleteData.data, 'Deleted object should be successfully deleted').toBe(true);
    });
  });
});
