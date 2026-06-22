/**
 * Manager class for Users operations.
 *
 * All methods return a `Promise<string>` containing a JSON-encoded API response.
 * When parsed, the response has the shape:
 * ```json
 * {
 *   "meta": { "status": 200, "statusMsg": "OK", "errors": [] },
 *   "data": { ... }
 * }
 * ```
 * Check `meta.status` to determine success or failure before consuming `data`.
 */
export class UsersManager {
    /**
     * @param {object} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves all users belonging to a site.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} siteId - The ID of the site to retrieve users from.
     * @returns {Promise<string>} A promise that resolves with the list of users.
     */
    getUsers(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new user within a site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - User properties to create.
     * @param {string} siteId - The ID of the site to create the user in.
     * @returns {Promise<string>} A promise that resolves with the created user.
     */
    postUsers(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a user within a site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - User properties to update.
     * @param {string} siteId - The ID of the site the user belongs to.
     * @param {string} usId - The ID of the user to update.
     * @returns {Promise<string>} A promise that resolves with the updated user.
     */
    putUsers(params, data, siteId, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a user via the users endpoint (without site context).
     * @param {object} params - Optional query parameters.
     * @param {object} data - User properties to update.
     * @param {string} usId - The ID of the user to update.
     * @returns {Promise<string>} A promise that resolves with the updated user.
     */
    putUsersEndpoint(params, data, usId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.User + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves users matching optional query parameters.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the matching users.
     */
    getUser(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.User;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific user by their ID.
     * @param {object} params - Optional query parameters.
     * @param {string} usId - The ID of the user to retrieve.
     * @returns {Promise<string>} A promise that resolves with the user.
     */
    getUserById(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserById.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the groups a user belongs to.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} usId - The ID of the user.
     * @returns {Promise<string>} A promise that resolves with the user's groups.
     */
    getUserGroups(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserGroups.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the supervisors of a user.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} usId - The ID of the user.
     * @returns {Promise<string>} A promise that resolves with the user's supervisors.
     */
    getUserSupervisors(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserSupervisors.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the supervisees of a user.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} usId - The ID of the user.
     * @returns {Promise<string>} A promise that resolves with the user's supervisees.
     */
    getUserSupervisees(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserSupervisees.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a web login token for a user.
     * @param {string} usId - The ID of the user.
     * @returns {Promise<string>} A promise that resolves with the user's login token.
     */
    getUserLoginToken(usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserWebToken.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const params = [];

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a JWT for the current user, optionally scoped to an audience.
     * @param {string} [audience] - The intended audience for the JWT.
     * @returns {Promise<string>} A promise that resolves with the JWT token data.
     */
    getUserJwt(audience) {
        const resourceUri = this._httpHelper._config.ResourceUri.UsersGetJwt;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const params = {};
        if (audience) {
            params['audience'] = audience;
        }
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the currently authenticated user's profile.
     * @returns {Promise<string>} A promise that resolves with the current user's data.
     */
    getCurrentUser() {
        const resourceUri = this._httpHelper._config.ResourceUri.UsersMe;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const params = [];

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Resets a user's password, optionally sending a notification email.
     * @param {string} usId - The ID of the user whose password to reset.
     * @param {boolean} [sendEmail=true] - Whether to send a password reset email to the user.
     * @returns {Promise<string>} A promise that resolves with the reset result.
     */
    resetPassword(usId, sendEmail = true) {
        const resourceUri = this._httpHelper._config.ResourceUri.UsersPassword.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        const params = [];

        const data = {
            resetPassword: true,
            sendEmail
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates the username (userId) of an existing user.
     * @param {string} usId - The ID of the user to update.
     * @param {string} newUserId - The new username to assign.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
    updateUserId(usId, newUserId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UsersIdUserId.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        const params = [];

        const data = {
            userId: newUserId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default UsersManager;
