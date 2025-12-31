export class CustomQueryManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getCustomQueryResultsByName(queryName, params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.CustomQuery);
        const opts = { method: 'GET' };

        if (!params) {
            params = {};
        }
        params.queryName = queryName;

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getCustomQueryResultsById(id, params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.CustomQuery + '/' + id);
        const opts = { method: 'GET' };

        if (!params) {
            params = {};
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default CustomQueryManager;
