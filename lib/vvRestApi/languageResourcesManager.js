export class LanguageResourcesManager {
    constructor(httpHelper, baseUrl) {
        this._httpHelper = httpHelper;
        this._baseUrl = baseUrl;
        this._apiUrl = httpHelper._config.BaseApiUri
    }

    getLanguageAreas(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.LanguageAreas;
        const url = this._baseUrl + this._apiUrl + resourceUri;
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.Languages;
        const url = this._baseUrl + this._apiUrl + resourceUri;
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    exportLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ExportLanguages;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    importLanguages(params, fileData, fileName) {
        const resourceUri = this._httpHelper._config.ResourceUri.ImportLanguages;
        const url = this._httpHelper.getUrl(resourceUri) + `?area=${params.area}&lang=${params.lang}`;
        const opts = { method: 'POSTSTREAM' };
        const data = { fileName };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
    }
}

export default LanguageResourcesManager;
