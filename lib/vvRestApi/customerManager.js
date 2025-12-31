export class CustomerManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    createCustomerInvite(data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        let url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerInvite;

        url = url.replace(/\/api\/\//g, '/api/');
        url = url.replace(/\/v1\/\//g, '/v1/');

        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }

    assignUser(customerId, data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        const url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerAssignUser.replace('{customerId}', customerId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }
}

export default CustomerManager;
