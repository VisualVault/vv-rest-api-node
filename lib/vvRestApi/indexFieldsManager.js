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

    addIndexField(params, fieldType, label, description, required, connectionId, queryId, queryDisplayField, queryValueField, dropDownListId, defaultValue) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {
            fieldType,
            label,
            description,
            required,
            connectionId,
            queryId,
            queryDisplayField,
            queryValueField,
            dropDownListId,
            defaultValue
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    updateIndexField(params, id, fieldType, label, description, required, connectionId, queryId, queryDisplayField, queryValueField, dropDownListId, defaultValue) {
        const resourceUri = this._httpHelper._config.ResourceUri.IndexFields + '/' + id;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        const data = {
            fieldType,
            label,
            description,
            required,
            connectionId,
            queryId,
            queryDisplayField,
            queryValueField,
            dropDownListId,
            defaultValue
        };

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
}

export default IndexFieldsManager;
