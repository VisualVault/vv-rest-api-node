export class ConfigurationManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getDocApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationDocApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getFormsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationFormsApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getObjectsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationObjectsApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getStudioApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationStudioApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getNotificationsApiConfig() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ConfigurationNotificationApi);
        const opts = { method: 'GET' };
        const params = {};
        const data = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default ConfigurationManager;
