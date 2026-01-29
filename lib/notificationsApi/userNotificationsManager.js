export class UserNotificationsManager {
    constructor (httpHelper) {
        this._httpHelper = httpHelper;
    }

    async forceUIRefresh(userGuid) {
        const resourceUri = this._httpHelper._config.ResourceUri.NotificationsApi.ForceUIRefresh.replace('{id}', userGuid);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const params = {};
        const data = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default UserNotificationsManager;