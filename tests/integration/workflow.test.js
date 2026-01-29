import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from './setup.js';
import { Authorize } from '../../lib/VVRestApi.js';

const triggerWorkflowTest = process.env.VV_TEST_WORKFLOW_ID ? it : it.skip;

describeIf(canRunIntegrationTests())('WorkflowManager Integration Tests', () => {
  let config;
  let client;
  let testWorkflowId;   // ID of the test workflow
  let testWorkflowRev;  // Revision number of the test workflow
  let testWorkflowName; // Name of the test workflow

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

    testWorkflowId = config.testWorkflowId;

    expect(testWorkflowId).toBeTypeOf('string');

    // Retrieve workflow for subsequent tests
    const workflowResponse = await client.studioApi.workflow.getWorkflow(testWorkflowId);
    const workflowData = JSON.parse(workflowResponse);

    expect(workflowData).toHaveProperty('data');
    expect(workflowData.data, 'Workflow data should be returned for the given workflow ID').not.toBeNull();

    if (workflowData.data.workflow) {
      const { workflow: testWorkflow } = workflowData.data;
      testWorkflowId = testWorkflow.id;
      testWorkflowRev = testWorkflow.revision;
      testWorkflowName = testWorkflow.name;
    }
  }, 60000); // Allow up to 60s for authentication and workflow lookup

  describe('getWorkflow', () => {
    it('should retrieve a workflow by its ID', async () => {
      expect(testWorkflowId, 'testWorkflowId should be set by beforeAll').toBeDefined();

      const workflowResponse = await client.studioApi.workflow.getWorkflow(testWorkflowId);
      const workflowData = JSON.parse(workflowResponse);

      console.log('getWorkflow response:', JSON.stringify(workflowData, null, 2));

      expect(workflowData).toHaveProperty('meta');
      expect(workflowData.meta.status, 'getWorkflow should return 200 Success').toBe(200);
      expect(workflowData).toHaveProperty('data');

      // Store the workflow data
      const { workflow } = workflowData.data;
      expect(workflow, 'Retrieved workflow data should be defined').toBeDefined();

      expect(workflow.id, 'Workflow should have an ID').toBeDefined();
      expect(workflow.name, 'Workflow should have a name').toBeDefined();
      expect(workflow.activities, 'Workflow should have activities').toBeDefined();
      expect(Array.isArray(workflow.activities), 'Workflow should have an array of activities').toBe(true);
      expect(workflow.workflowVariables, 'Workflow should have workflow variables').toBeDefined();
      expect(Array.isArray(workflow.workflowVariables), 'Workflow should have an array of workflow variables').toBe(true);
    });
  });

  describe('getWorkflowByName', () => {
    it('should retrieve a workflow by its name', async () => {
      expect(testWorkflowName, 'testWorkflowName should be set by beforeAll').toBeDefined();

      const workflowResponse = await client.studioApi.workflow.getWorkflowByName(testWorkflowName);
      const workflowData = JSON.parse(workflowResponse);

      console.log('getWorkflowByName response:', JSON.stringify(workflowData, null, 2));

      expect(workflowData).toHaveProperty('meta');
      expect(workflowData.meta.status, 'getWorkflowByName should return 200 Success').toBe(200);
      expect(workflowData).toHaveProperty('data');

      // Store the workflow data
      const { workflow } = workflowData.data;
      expect(workflow, 'Retrieved workflow data should be defined').toBeDefined();

      expect(workflow.id, 'Workflow should have an ID').toBeDefined();
      expect(workflow.name, 'Workflow should have a name').toBeDefined();
      expect(workflow.activities, 'Workflow should have activities').toBeDefined();
      expect(Array.isArray(workflow.activities), 'Workflow should have an array of activities').toBe(true);
    });
  });

  describe('getWorkflowVariables', () => {
    it('should retrieve the variables belonging to a workflow by its ID', async () => {
      expect(testWorkflowId, 'testWorkflowId should be set by beforeAll').toBeDefined();

      const workflowVarsResponse = await client.studioApi.workflow.getWorkflowVariables({}, testWorkflowId);
      const workflowVarsData = JSON.parse(workflowVarsResponse);

      console.log('getWorkflowVariables response:', JSON.stringify(workflowVarsData, null, 2));

      expect(workflowVarsData).toHaveProperty('meta');
      expect(workflowVarsData.meta.status, 'getWorkflowVariables should return 200 Success').toBe(200);
      expect(workflowVarsData).toHaveProperty('data');

      expect(workflowVarsData.data.workflowVariables, 'Workflow variables should have top-level workflow variables').toBeDefined();
      expect(Array.isArray(workflowVarsData.data.workflowVariables), 'Workflow variables should have an array of top-level workflow variables').toBe(true);
      expect(workflowVarsData.data.workflowDatasetVariables, 'Workflow variables should have dataset variables').toBeDefined();
      expect(Array.isArray(workflowVarsData.data.workflowDatasetVariables), 'Workflow variables should have an array of dataset variables').toBe(true);
    });
  });

  describe('triggerWorkflow / terminateWorkflow', () => {
    triggerWorkflowTest('should trigger and terminate a workflow', async () => {
      expect(testWorkflowId, 'testWorkflowId should be set by beforeAll').toBeDefined();

      /* TRIGGER WORKFLOW */

      // Define minimal workflow parameters
      const workflowObjectId = 'workflow-test:' + new Date().toISOString();
      const workflowVariables = [];

      const workflowTriggerResponse = await client.studioApi.workflow.triggerWorkflow(testWorkflowId, testWorkflowRev, workflowObjectId, workflowVariables);
      const workflowTriggerData = JSON.parse(workflowTriggerResponse);

      console.log('triggerWorkflow response:', JSON.stringify(workflowTriggerData, null, 2));

      expect(workflowTriggerData).toHaveProperty('meta');
      expect(workflowTriggerData.meta.status, 'triggerWorkflow should return 200 Success').toBe(200);
      expect(workflowTriggerData).toHaveProperty('data');

      // Store the workflow instance data
      const { data: workflowInstanceId } = workflowTriggerData;
      expect(workflowInstanceId, 'Retrieved workflow instance ID should be defined').toBeDefined();

      /* TERMINATE WORKFLOW */

      const workflowTerminateResponse = await client.studioApi.workflow.terminateWorkflow(testWorkflowId, workflowInstanceId);
      const workflowTerminateData = JSON.parse(workflowTerminateResponse);

      console.log('terminateWorkflow response:', JSON.stringify(workflowTerminateData, null, 2));

      expect(workflowTerminateData).toHaveProperty('meta');
      expect(workflowTerminateData.meta.status, 'terminateWorkflow should return 200 Success').toBe(200);
      expect(workflowTerminateData).toHaveProperty('data');
      expect(workflowTerminateData.data, 'terminateWorkflow should have a success message').toMatch(`The workflow ${workflowInstanceId} was correctly Terminated`)
    });
  });

  describe('GetWorkflowHistoryForObject / GetRunningWorkflowForObject', () => {
    let instanceId;
    let workflowObjectId;

    beforeEach(async () => {
      try {
        // Define minimal workflow parameters
        const wfObjectId = 'workflow-test:' + new Date().toISOString();
        const workflowVariables = [];

        const workflowTriggerResponse = await client.studioApi.workflow.triggerWorkflow(testWorkflowId, testWorkflowRev, wfObjectId, workflowVariables);
        const workflowTriggerData = JSON.parse(workflowTriggerResponse);

        const { data: workflowInstanceId } = workflowTriggerData;

        instanceId = workflowInstanceId;
        workflowObjectId = wfObjectId;

        console.log('Initializer - created workflow instance:', instanceId);
      }
      catch (error) {
        console.warn('Initializer - workflow instance failed:', error.message);
      }
    });
    afterEach(async () => {
      if (instanceId) {
        try {
          await client.studioApi.workflow.terminateWorkflow(testWorkflowId, instanceId);
          console.log('Cleanup - terminated workflow instance:', instanceId);
        } catch (error) {
          console.warn('Cleanup - workflow instance failed:', error.message);
        }
        instanceId = null;
        workflowObjectId = null;
      }
    });

    triggerWorkflowTest('should retrieve workflow history for an object by its object ID', async () => {
      expect(testWorkflowId, 'testWorkflowId should be set by beforeAll').toBeDefined();
      expect(workflowObjectId, 'workflowObjectId should be set by beforeEach').toBeDefined();

      const workflowHistoryResponse = await client.studioApi.workflow.GetWorkflowHistoryForObject(workflowObjectId, testWorkflowId);
      const workflowHistoryData = JSON.parse(workflowHistoryResponse);

      console.log('GetWorkflowHistoryForObject response:', JSON.stringify(workflowHistoryData, null, 2));

      expect(workflowHistoryData).toHaveProperty('meta');
      expect(workflowHistoryData.meta.status, 'GetWorkflowHistoryForObject should return 200 Success').toBe(200);
      expect(workflowHistoryData).toHaveProperty('data');

      expect(workflowHistoryData.data.items, 'Workflow history should have items').toBeDefined();
      expect(Array.isArray(workflowHistoryData.data.items), 'Workflow history should have an array of items').toBe(true);

      workflowHistoryData.data.items.forEach((item) => {
        expect(item).toHaveProperty('object_id');
        expect(item).toHaveProperty('instance_id');
        expect(item).toHaveProperty('status');
      });
    });

    triggerWorkflowTest('should retrieve running workflow for an object by its object ID', async () => {
      expect(testWorkflowId, 'testWorkflowId should be set by beforeAll').toBeDefined();
      expect(workflowObjectId, 'workflowObjectId should be set by beforeEach').toBeDefined();

      const workflowRunningResponse = await client.studioApi.workflow.GetRunningWorkflowForObject(workflowObjectId, testWorkflowId);
      const workflowRunningData = JSON.parse(workflowRunningResponse);

      console.log('GetRunningWorkflowForObject response:', JSON.stringify(workflowRunningData, null, 2));

      expect(workflowRunningData).toHaveProperty('meta');
      expect(workflowRunningData.meta.status, 'GetRunningWorkflowForObject should return 200 Success').toBe(200);
      expect(workflowRunningData).toHaveProperty('data');

      expect(workflowRunningData.data).toHaveProperty('object_id');
      expect(workflowRunningData.data).toHaveProperty('instance_id');
      expect(workflowRunningData.data).toHaveProperty('status', 'Running');
    });
  });
});
