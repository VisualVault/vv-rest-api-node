/**
 * Manages custom query execution via the VVRestApi.
 */
export class CustomQueryManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves the results of a custom query by its name.
     * @param {string} queryName - The name of the custom query to execute.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the custom query results.
     */
    getCustomQueryResultsByName(queryName, params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.CustomQuery);
        const opts = { method: 'GET' };

        if (!params) {
            params = {};
        }
        params.queryName = queryName;

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the results of a custom query by its ID.
     * @param {string} id - The ID (Guid) of the custom query to execute.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the custom query results.
     */
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
