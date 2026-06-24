/**
 * Manages outside process retrieval operations via the VVRestApi.
 */
export class OutsideProcessesManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a list of outside processes.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of outside processes.
     */
    getOutsideProcesses(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.OutsideProcesses;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default OutsideProcessesManager;
