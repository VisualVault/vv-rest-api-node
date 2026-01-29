export class ModelsManager {
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a list of available models
     * @param {object} params - Optional URL parameters to include in the request
     */
    async getModels(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.Models;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific model by its ID
     * @param {string} modelId - The ID (Guid) for the requested model
     * @param {object} params - Optional URL parameters to include in the request
     */
    async getModelById(modelId, params) {
        let resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.ModelById;
        resourceUri = resourceUri.replace('{id}', modelId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ModelsManager;