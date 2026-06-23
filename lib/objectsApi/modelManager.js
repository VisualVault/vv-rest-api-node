/**
 * Manages model-related operations via the ObjectsApi.
 */
export class ModelManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a list of available models.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the list of models.
     */
    async getModels(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.Models;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific model by its ID.
     * @param {string} modelId - The ID (Guid) for the requested model.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the model details.
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

export default ModelManager;