/**
 * Manages workflow operations via the StudioApi.
 */
export class WorkflowManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves the latest published version of a workflow by its ID.
     * @param {string} workflowId - The ID (Guid) of the workflow to retrieve.
     * @returns {Promise<object>} The API response containing the workflow details.
     */
    async getWorkflow(workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowLatestPublishedId.replace('{id}', workflowId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the latest published version of a workflow by its name.
     * @param {string} workflowName - The name of the workflow to retrieve.
     * @returns {Promise<object>} The API response containing the workflow details.
     */
    async getWorkflowByName(workflowName){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowLatestPublished;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = { name: workflowName };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the variables defined for a specific workflow.
     * @param {object} params - Optional URL parameters to include in the request.
     * @param {string} workflowId - The ID (Guid) of the workflow whose variables to retrieve.
     * @returns {Promise<object>} The API response containing the list of workflow variables.
     */
    async getWorkflowVariables(params, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowVariables.replace('{id}', workflowId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Triggers a workflow run for a specific object.
     * @param {string} workflowId - The ID (Guid) of the workflow to trigger.
     * @param {number} workflowRevision - The revision number of the workflow to run.
     * @param {string} objectId - The ID (Guid) of the object to run the workflow against.
     * @param {object[]} workflowVariables - Workflow variable values to pass into the workflow.
     * @param {string} workflowVariables[].name - The name of the variable.
     * @param {*} workflowVariables[].value - The value to pass for the variable.
     * @param {number} workflowVariables[].dataType - The data type: Text: 1, Number: 2, Date: 3, Boolean: 4.
     * @returns {Promise<object>} The API response containing the triggered workflow instance details.
     */
    async triggerWorkflow(workflowId, workflowRevision, objectId, workflowVariables){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowRun.replace('{id}', workflowId).replace('{revision}', workflowRevision);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {
            objectId,
            reference: 'API',
            data: {
                workflowVariables,
                dataSetVariables: []
            }
        };
        const params = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Terminates a running workflow instance.
     * @param {string} workflowId - The ID (Guid) of the workflow containing the instance to terminate.
     * @param {string} instanceId - The ID (Guid) of the workflow instance to terminate.
     * @returns {Promise<object>} The API response confirming the workflow instance was terminated.
     */
    async terminateWorkflow(workflowId, instanceId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowTerminate.replace('{workflowId}', workflowId).replace('{instanceId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Returns the workflow execution history for an object under the provided workflow.
     * @param {string} objectId - The ID (Guid) of the object whose workflow history to retrieve.
     * @param {string} workflowId - The ID (Guid) of the workflow to query history for.
     * @returns {Promise<object>} The API response containing the workflow history entries for the object.
     */
    async GetWorkflowHistoryForObject(objectId, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowHistoryObject.replace('{workflowId}', workflowId).replace('{objectId}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Returns the currently running workflow instance, if any, for an object under the provided workflow.
     * @param {string} objectId - The ID (Guid) of the object to check for a running workflow.
     * @param {string} workflowId - The ID (Guid) of the workflow to query.
     * @returns {Promise<object>} The API response containing the running workflow instance, or empty if none is active.
     */
    async GetRunningWorkflowForObject(objectId, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowHistoryRunningObject.replace('{workflowId}', workflowId).replace('{objectId}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default WorkflowManager;
