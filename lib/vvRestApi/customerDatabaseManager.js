import createDebug from 'debug';

const debug = createDebug('visualvault:customer-db');

/**
 * Manages user assignment operations on customer databases.
 */
export class CustomerDatabaseManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Assigns a user to a customer database.
     * @param {string} customerId - The ID (Guid) of the customer database to assign the user to.
     * @param {object} data - The user assignment data to submit in the request body.
     * @param {string} data.userId - The username (authentication user ID) of the user to assign.
     * @returns {Promise<string>} The API response confirming the user assignment.
     */
    assignUser(customerId, data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        const url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerDatabaseAssignUser.replace('{databaseId}', customerId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }

    /**
     * Removes a user from a customer database.
     * @param {string} authenticationUserId - The authentication user ID of the user to remove.
     * @param {string} databaseId - The ID (Guid) of the customer database to remove the user from.
     * @returns {Promise<string>} The API response confirming the user removal.
     */
    removeUser(authenticationUserId, databaseId) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        let url = baseUrl + "/api/v1" + this._httpHelper._config.ResourceUri.UserDelete.replace('{databaseId}', databaseId);
        url = url.replace("{authenticationUserId}", authenticationUserId);
        debug('Removing user %s from database %s: %s', authenticationUserId, databaseId, url);
        const opts = { method: 'DELETE' };
        const params = [];

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default CustomerDatabaseManager;
