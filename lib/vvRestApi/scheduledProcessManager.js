export class ScheduledProcessManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    postCompletion(id, action, result, message) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ScheduledProcess) + '/' + id;
        const opts = { method: 'POST' };

        const params = {
            action
        };

        if (result !== null && (typeof result === 'boolean' || result.length > 0)) {
            params.result = result.toString();
        }

        if (message && message.length > 0) {
            params.message = message;
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    runAllScheduledProcesses() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ScheduledProcess) + '/Run';
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

export default ScheduledProcessManager;
