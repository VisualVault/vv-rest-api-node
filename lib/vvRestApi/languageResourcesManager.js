export class LanguageResourcesManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getLanguageAreas(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.LanguageAreas;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.Languages;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    exportLanguages(area, language) {
        const resourceUri = this._httpHelper._config.ResourceUri.ExportLanguages + `?area=${area}&lang=${language}`;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    importLanguages(area, language, fileData, fileName) {
        const resourceUri = this._httpHelper._config.ResourceUri.ImportLanguages + `?area=${area}&lang=${language}`;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };
        const data = { fileName };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
    }
}

export default LanguageResourcesManager;
