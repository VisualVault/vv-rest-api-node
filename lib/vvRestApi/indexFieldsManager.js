/**
 * Manages index field operations via the VVRestApi.
 */
export class IndexFieldsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves all index fields.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of index fields.
     */
    getIndexFields(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific index field by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} id - The ID (Guid) of the index field to retrieve.
     * @returns {Promise<string>} JSON string containing the index field details.
     */
    getIndexField(params, id) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Payload for creating or updating index fields.
     * @typedef {object} IndexFieldData
     * @property {string} fieldType
     * @property {string} label
     * @property {string} [description]
     * @property {boolean} [required]
     * @property {string|null} [connectionId]
     * @property {string|null} [queryId]
     * @property {string|null} [queryDisplayField]
     * @property {string|null} [queryValueField]
     * @property {string|null} [dropDownListId]
     * @property {string|null} [defaultValue]
     */

    /**
     * Creates a new index field.
     * @param {object} params - URL parameters to include in the request.
     * @param {IndexFieldData} data - The index field data to submit in the request body.
     * @returns {Promise<string>} JSON string containing the created index field details.
     */
    createIndexField(params, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates an existing index field by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} id - The ID (Guid) of the index field to update.
     * @param {IndexFieldData} data - The updated index field data to submit in the request body.
     * @returns {Promise<string>} JSON string confirming the index field was updated.
     */
    updateIndexField(params, id, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes an index field by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} id - The ID (Guid) of the index field to delete.
     * @returns {Promise<string>} JSON string confirming the index field was deleted.
     */
    deleteIndexField(params, id) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Moves an index field to appear after a specified destination field.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} sourceFieldId - The ID (Guid) of the index field to move.
     * @param {string} destinationFieldId - The ID (Guid) of the index field to place the source after.
     * @returns {Promise<string>} JSON string confirming the index field was moved.
     */
    moveIndexFieldAfter(params, sourceFieldId, destinationFieldId) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/MoveIndexFieldAfter';
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = { sourceFieldId, destinationFieldId };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Associates an index field with a folder.
     * @param {string} indexFieldId - The ID (Guid) of the index field to associate.
     * @param {string} folderId - The ID (Guid) of the folder to associate the index field with.
     * @returns {Promise<string>} JSON string confirming the index field was added to the folder.
     */
    addIndexFieldToFolder(indexFieldId, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFieldsFolder
            .replace('{id}', indexFieldId)
            .replace('{folderId}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

export default IndexFieldsManager;
