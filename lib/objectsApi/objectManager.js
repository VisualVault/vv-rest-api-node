/**
 * Manages object-related operations via the ObjectsApi.
 */
export class ObjectManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a specific object by its ID.
     * @param {string} objectId - The ID (Guid) for the requested object.
     * @param {object} params - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the object details.
     */
    async getObject(objectId, params) {
        let resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.ObjectById;
        resourceUri = resourceUri.replace('{id}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a paged list of objects associated with a given model.
     * @param {string} modelId - The ID (Guid) for the requested model to search.
     * @param {object} data - Data to send in the request body.
     * @param {object} params - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the list of matching objects and pagination info.
     */
    async getObjectsByModelId(modelId, data, params) {
        let resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.ObjectSearchByModelId;
        resourceUri = resourceUri.replace('{modelId}', modelId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        data = data || {};
        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Creates a new object adhering to a given model.
     * @param {string} modelId - The ID (Guid) used to create a new object for that model.
     * @param {object} data - Data to send in the request body.
     * @param {object} params - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the created object details.
     */
    async createObject(modelId, data, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.Object;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        data = data || {};
        params = params || {};

        data['modelId'] = modelId || data['modelId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates an existing object by its ID and revision ID.
     * @param {string} objectId - The ID (Guid) for the requested object to update.
     * @param {string} objectRevisionId - The revision ID (Guid) for the requested object to update.
     * @param {object} data - Data to send in the request body.
     * @param {object} params - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response confirming the object update.
     */
    async updateObject(objectId, objectRevisionId, data, params) {
        let resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.ObjectById;
        resourceUri = resourceUri.replace('{id}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        data = data || {};
        params = params || {};

        data['revisionId'] = objectRevisionId || data['revisionId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes an existing object by its ID.
     * @param {string} objectId - The ID (Guid) for the requested object to delete.
     * @param {object} params - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response confirming the object deletion.
     */
    async deleteObject(objectId, params) {
        let resourceUri = this._httpHelper._config.ResourceUri.ObjectsApi.ObjectById;
        resourceUri = resourceUri.replace('{id}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ObjectManager;