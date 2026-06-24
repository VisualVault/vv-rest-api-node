/**
 * Manages API configuration retrieval for each VisualVault service.
 */
export class ConfigurationManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves the configuration settings for the DocApi service.
     * @returns {Promise<string>} JSON string containing the DocApi configuration.
     */
    getDocApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationDocApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the configuration settings for the FormsApi service.
     * @returns {Promise<string>} JSON string containing the FormsApi configuration.
     */
    getFormsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationFormsApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the configuration settings for the ObjectsApi service.
     * @returns {Promise<string>} JSON string containing the ObjectsApi configuration.
     */
    getObjectsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationObjectsApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the configuration settings for the StudioApi service.
     * @returns {Promise<string>} JSON string containing the StudioApi configuration.
     */
    getStudioApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationStudioApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves the configuration settings for the NotificationsApi service.
     * @returns {Promise<string>} JSON string containing the NotificationsApi configuration.
     */
    getNotificationsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationNotificationApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default ConfigurationManager;
