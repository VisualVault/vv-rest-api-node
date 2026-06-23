/**
 * Manager class for object API operations.
 *
 * All methods return a `Promise<string>` containing a JSON-encoded API response.
 * When parsed, the response has the shape:
 * ```json
 * {
 *   "meta": { "status": 200, "statusMsg": "OK", "errors": [] },
 *   "data": { ... }
 * }
 * ```
 * Check `meta.status` to determine success or failure before consuming `data`.
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
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} The API response containing the object details.
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
     * @param {object} data - The search payload (maps to ObjectSearchRequest).
     * @param {number} [data.page=0] - Zero-based page index for pagination.
     * @param {number} [data.take=10] - Number of results to return per page.
     * @param {Array<{sortField: string, direction: number}>} [data.sort] - Sort criteria; direction: 0=Ascending, 1=Descending.
     * @param {Array<{lookIn: string, clause: string, criteria: string, condition?: string, leftBracket?: boolean, rightBracket?: boolean}>} [data.criteriaList] - Filter criteria items. lookIn: property name or Guid. clause: 'IsEqual'|'NotEqual'|'GreaterThan'|'GreaterThanEqual'|'LessThan'|'LessThanEqual'|'BeginWith'|'NotBeginWith'|'EndWith'|'NotEndWith'|'Contain'|'NotContain'|'Null'|'NotNull'|'Between'|'NotBetween'|'In'|'NotIn'. criteria: value to compare. condition: 'AND'|'OR'. leftBracket/rightBracket: open/close a logical group.
     * @param {string[]} [data.propertyList] - Property names or Guids to include in results; empty array returns all properties.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} The API response containing the list of matching objects and pagination info.
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
     * @param {string} modelId - The ID (Guid) used to create a new object for that model; overrides any value in data.
     * @param {object} data - The object creation payload (maps to ObjectCreateRequest).
     * @param {string} data.modelId - The Guid of the model this object belongs to; overridden by the modelId argument.
     * @param {object} [data.properties] - Key/value pairs for object property values, keyed by property name or Guid.
     * @param {Array<{id: string, revisionId: string, properties: object, relatedObjectUpdates?: Array}>} [data.relatedModels] - Related object instances to create or link alongside this object.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} The API response containing the created object details.
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
     * @param {string} objectRevisionId - The revision ID (Guid) for the requested object to update; overrides any value in data.
     * @param {object} data - The object update payload (maps to ObjectUpdateRequest).
     * @param {string} data.revisionId - The revision Guid to update; overridden by the objectRevisionId argument.
     * @param {object} [data.properties] - Key/value pairs for the updated object property values, keyed by property name or Guid.
     * @param {Array<{id: string, revisionId: string, properties: object, relatedObjectUpdates?: Array}>} [data.relatedObjectUpdates] - Related object instances to update alongside this object.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} The API response confirming the object update.
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
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} The API response confirming the object deletion.
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