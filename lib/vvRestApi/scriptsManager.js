export class ScriptsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    runWebService(serviceName, serviceData, usId) {
        let resourceUri = this._httpHelper._config.ResourceUri.Scripts + '?name=' + serviceName;
        if (typeof usId !== 'undefined' && usId !== null) {
            resourceUri += `&usId=${usId}`;
        }

        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        return this._httpHelper.doVvClientRequest(url, opts, null, serviceData);
    }

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
