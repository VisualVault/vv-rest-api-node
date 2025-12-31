export class OutsideProcessesManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getOutsideProcesses(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.OutsideProcesses;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default OutsideProcessesManager;
