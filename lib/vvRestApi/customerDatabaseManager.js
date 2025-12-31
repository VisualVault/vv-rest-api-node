import createDebug from 'debug';

const debug = createDebug('visualvault:customer-db');

export class CustomerDatabaseManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    assignUser(customerId, data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        const url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerDatabaseAssignUser.replace('{databaseId}', customerId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }

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
