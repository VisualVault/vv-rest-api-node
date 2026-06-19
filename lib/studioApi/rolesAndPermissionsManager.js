/**
 * Manages roles and permissions operations via the StudioApi.
 */
export class RolesAndPermissionsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves available features for the requesting user.
     * @param {object} [params] - Optional URL parameters to include in the request.
     * @returns {Promise<object>} The API response containing the list of features available to the user.
     */
    async getUserFeatures(params) {
        var resourceUri = this._httpHelper._config.ResourceUri.StudioApi.ResourceUserFeatures;
        var url = this._httpHelper.getUrl(resourceUri);
        var opts = { method: 'GET' };
        var data = {};
        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default RolesAndPermissionsManager;