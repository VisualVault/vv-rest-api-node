/**
 * Manages language resource operations via the VVRestApi.
 */
export class LanguageResourcesManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     * @param {string} baseUrl - The base URL of the VisualVault server.
     */
    constructor(httpHelper, baseUrl) {
        this._httpHelper = httpHelper;
        this._baseUrl = baseUrl;
        this._apiUrl = httpHelper._config.BaseApiUri
    }

    /**
     * Retrieves available language areas.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of language areas.
     */
    getLanguageAreas(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.LanguageAreas;
        const url = this._baseUrl + this._apiUrl + resourceUri;
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves available languages.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of available languages.
     */
    getLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.Languages;
        const url = this._baseUrl + this._apiUrl + resourceUri;
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Exports language resource translations as a downloadable file.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<Buffer>} The API response containing the raw exported language file bytes.
     */
    exportLanguages(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ExportLanguages;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Imports language resource translations from a file.
     * @param {object} params - URL parameters containing the target area and language (params.area, params.lang).
     * @param {Buffer} fileData - The raw file bytes of the language file to import.
     * @param {string} fileName - The name of the file being imported.
     * @returns {Promise<string>} JSON string confirming the language import was processed.
     */
    importLanguages(params, fileData, fileName) {
        const resourceUri = this._httpHelper._config.ResourceUri.ImportLanguages;
        const url = this._httpHelper.getUrl(resourceUri) + `?area=${params.area}&lang=${params.lang}`;
        const opts = { method: 'POSTSTREAM' };
        const data = { fileName };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
    }
}

export default LanguageResourcesManager;
