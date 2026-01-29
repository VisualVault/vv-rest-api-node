export class RolesAndPermissionsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves available features for the requesting user
     * @param {string} resource - Optional string representing the ID or name of a specific resource to filter results to only include that resource
     */
    async getUserFeatures(resource) {
        var resourceUri = this._httpHelper._config.ResourceUri.StudioApi.ResourceUserFeatures;
        var url = this._httpHelper.getUrl(resourceUri);
        var opts = { method: 'GET' };
        var data = {};
        var params = {};

        if (resource)
            params['resource'] = resource;

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default RolesAndPermissionsManager;