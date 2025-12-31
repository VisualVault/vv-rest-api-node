export class LayoutsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getLayout() {
        const resourceUri = this._httpHelper._config.ResourceUri.Layout;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, {}, null);
    }
}

export default LayoutsManager;
