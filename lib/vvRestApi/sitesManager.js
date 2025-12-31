export class SitesManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getSites(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Sites);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    postSites(params, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.Sites;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    putSites(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Sites;
        const url = this._httpHelper.getUrl(resourceUri + '/' + siteId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getGroups(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Groups.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    postGroups(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Groups.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    putGroups(params, data, siteId, grId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Groups.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri + '/' + grId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    changeUserSite(userId, newSiteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ChangeUserSite;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            UserId: userId,
            NewSiteId: newSiteId
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }
}

export default SitesManager;
