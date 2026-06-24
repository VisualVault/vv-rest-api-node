/**
 * Manages operations for the currently authenticated user.
 */
export class CurrentUserManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Gets the currently authenticated user's information.
     * @param {object} [params] - Optional query parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the current user's details.
     */
    async getCurrentUser(params) {
        var resourceUri = this._httpHelper._config.ResourceUri.UsersMe;
        var url = this._httpHelper.getUrl(resourceUri);
        var opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default CurrentUserManager;
