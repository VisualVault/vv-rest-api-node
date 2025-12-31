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
}

export default IndexFieldsManager;
