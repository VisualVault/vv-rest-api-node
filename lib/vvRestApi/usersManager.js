export class UsersManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getUsers(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    postUsers(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    putUsers(params, data, siteId, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Users.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    putUsersEndpoint(params, data, usId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.User + '/' + usId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getUser(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.User;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getUserById(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserById.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getUserGroups(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserGroups.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getUserSupervisors(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserSupervisors.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getUserSupervisees(params, usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserSupervisees.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getUserLoginToken(usId) {
        const resourceUri = this._httpHelper._config.ResourceUri.UserWebToken.replace('{id}', usId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const params = [];

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

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

    getCurrentUser() {
        const resourceUri = this._httpHelper._config.ResourceUri.UsersWhoAmI;
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        const url = baseUrl + "/api/v1" + resourceUri;
        const opts = { method: 'GET' };
        const params = [];

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

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
