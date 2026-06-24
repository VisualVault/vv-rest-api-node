/**
 * Manages script and web service execution via the VVRestApi.
 */
export class ScriptsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Executes a named web service script.
     * @param {string} serviceName - The name of the web service script to run.
     * @param {object} serviceData - The data to pass to the script in the request body.
     * @param {string} [usId] - The user session ID to run the script on behalf of.
     * @returns {Promise<string>} JSON string containing the script execution result.
     */
    runWebService(serviceName, serviceData, usId) {
        let resourceUri = this._httpHelper._config.ResourceUri.Scripts + '?name=' + serviceName;
        if (typeof usId !== 'undefined' && usId !== null) {
            resourceUri += `&usId=${usId}`;
        }

        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        return this._httpHelper.doVvClientRequest(url, opts, null, serviceData);
    }

    /**
     * Completes a workflow web service execution and returns variables to the workflow.
     * @param {string} executionId - The ID of the workflow script execution to complete.
     * @param {object[]} workflowVariables - The workflow variables to return upon completion.
     * @returns {Promise<string>} JSON string confirming the workflow completion was recorded.
     */
    completeWorkflowWebService(executionId, workflowVariables) {
        const resourceUri = this._httpHelper._config.ResourceUri.ScriptsCompleteWf;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const postData = {
            executionId,
            workflowVariables
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, postData);
    }
}

export default ScriptsManager;
