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
     * @returns {Promise<string>} The API response containing the list of users.
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
     * @param {string} data.userId - Username (required if emailAddress is omitted; defaults to emailAddress when omitted).
     * @param {string} data.emailAddress - User email address (required if userId is omitted).
     * @param {string} [data.firstName] - User first name.
     * @param {string} [data.middleInitial] - User middle initial.
     * @param {string} [data.lastName] - User last name.
     * @param {string} [data.password] - Initial password.
     * @param {boolean} [data.mustChangePassword] - Whether the user must change their password on first login.
     * @param {boolean} [data.sendEmail] - Whether to send a welcome email; defaults to true.
     * @param {boolean} [data.passwordNeverExpires] - Whether the password never expires.
     * @param {string} [data.passwordExpires] - Date when the password expires.
     * @param {boolean} [data.getPasswordResetToken] - If true, the response includes a password reset token.
     * @param {string} [data.employeeId] - Employee ID.
     * @param {string} [data.employmentStatus] - Employment status.
     * @param {string} siteId - The ID of the site to create the user in.
     * @returns {Promise<string>} The API response containing the created user.
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
     * @param {string} [data.firstName] - New first name.
     * @param {string} [data.middleInitial] - New middle initial.
     * @param {string} [data.lastName] - New last name.
     * @param {string} [data.emailAddress] - New email address.
     * @param {string} [data.userId] - New username.
     * @param {string} [data.password] - New password.
     * @param {boolean} [data.mustChangePassword] - Whether the user must change their password on next login.
     * @param {boolean} [data.passwordNeverExpires] - Whether the password never expires.
     * @param {string} [data.passwordExpires] - Date when the password expires.
     * @param {string} [data.employeeId] - Employee ID.
     * @param {string} [data.employmentStatus] - Employment status.
     * @param {string} siteId - The ID of the site the user belongs to.
     * @param {string} usId - The ID of the user to update.
     * @returns {Promise<string>} The API response containing the updated user.
     */
    putUsers(params, data, siteId, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a user via the users endpoint (without site context).
     * When updating own profile: supports `newPassword`+`oldPassword`, `emailAddress`, and `firstName`+`lastName`.
     * When an admin updates another user: supports `isVaultAccess` and `enabled` in addition to profile fields.
     * @param {object} params - Optional query parameters.
     * @param {object} data - User properties to update.
     * @param {string} [data.firstName] - New first name.
     * @param {string} [data.lastName] - New last name.
     * @param {string} [data.emailAddress] - New email address.
     * @param {string} [data.newPassword] - New password (requires oldPassword).
     * @param {string} [data.oldPassword] - Current password (required when changing password).
     * @param {boolean} [data.isVaultAccess] - Whether the user has vault (account owner) access; admin only.
     * @param {boolean} [data.enabled] - Whether the user account is enabled; admin only.
     * @param {string} usId - The ID of the user to update.
     * @returns {Promise<string>} The API response containing the updated user.
     */
    putUsersEndpoint(params, data, usId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.User + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves users matching optional query parameters.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} The API response containing the matching users.
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
     * @returns {Promise<string>} The API response containing the user.
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
     * @returns {Promise<string>} The API response containing the user's groups.
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
     * @returns {Promise<string>} The API response containing the user's supervisors.
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
     * @returns {Promise<string>} The API response containing the user's supervisees.
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
     * @returns {Promise<string>} The API response containing the user's login token.
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
     * @returns {Promise<string>} The API response containing the JWT token data.
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
     * @returns {Promise<string>} The API response containing the current user's data.
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
     * @returns {Promise<string>} The API response confirming the password reset.
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
     * @returns {Promise<string>} The API response confirming the update.
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
