/**
 * Manages layout retrieval operations via the VVRestApi.
 */
export class LayoutsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves the layout configuration for the current site.
     * @returns {Promise<string>} JSON string containing the layout configuration.
     */
    getLayout() {
        const resourceUri = this._httpHelper._config.ResourceUri.Layout;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, {}, null);
    }
}

export default LayoutsManager;
