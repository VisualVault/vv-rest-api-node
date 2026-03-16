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

    exportLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ExportLanguages;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    importLanguages(params, fileData, fileName) {
        const resourceUri = this._httpHelper._config.ResourceUri.ImportLanguages;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };
        const data = { fileName };

        return this._httpHelper.doVvClientRequest(url, opts, params, data, fileData);
    }
}

export default LanguageResourcesManager;
