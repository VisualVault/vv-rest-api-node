export class CurrentUserManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Gets the currently authenticated user's information.
     * @param {Object} [params] - Optional query parameters.
     * @returns {Promise<string>} A promise that resolves with the current user's information as a JSON string.
     */
    async getCurrentUser(params) {
        var resourceUri = this._httpHelper._config.ResourceUri.UsersMe;
        var url = this._httpHelper.getUrl(resourceUri);
        var opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default CurrentUserManager;
