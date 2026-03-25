export class IndexFieldsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getIndexFields(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getIndexField(params, id) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Payload for creating/updating index fields.
     * @typedef {Object} IndexFieldData
     * @property {string} fieldType
     * @property {string} label
     * @property {string} [description]
     * @property {boolean} [required]
     * @property {?string} [connectionId]
     * @property {?string} [queryId]
     * @property {?string} [queryDisplayField]
     * @property {?string} [queryValueField]
     * @property {?string} [dropDownListId]
     * @property {?string} [defaultValue]
     */

    /**
     * Create an index field
     * @param {Object} params - Query parameters
     * @param {IndexFieldData} data - Request body
     * @returns {Promise<string>}
     */
    createIndexField(params, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Update an index field
     * @param {Object} params - Query parameters
     * @param {string} id - Index field id
     * @param {IndexFieldData} data - Request body
     * @returns {Promise<string>}
     */
    updateIndexField(params, id, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    deleteIndexField(params, id) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    moveIndexFieldAfter(params, sourceFieldId, destinationFieldId) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/MoveIndexFieldAfter';
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = { sourceFieldId, destinationFieldId };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    putIndexFieldFolder(indexFieldId, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFieldsFolder
            .replace('{id}', indexFieldId)
            .replace('{folderId}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

export default IndexFieldsManager;
