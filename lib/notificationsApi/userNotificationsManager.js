/**
 * Manages user notification operations via the NotificationsApi.
 */
export class UserNotificationsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor (httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Forces a UI refresh notification for a specific user.
     * @param {string} userGuid - The ID (Guid) of the user whose UI should be refreshed.
     * @returns {Promise<object>} The API response confirming the refresh notification was sent.
     */
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
