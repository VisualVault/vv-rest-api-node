/**
 * Manages scheduled process operations via the VVRestApi.
 */
export class ScheduledProcessManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Posts a completion status for a scheduled process.
     * @param {string} id - The ID of the scheduled process to complete.
     * @param {string} action - The action taken by the scheduled process.
     * @param {boolean|string} result - The result of the scheduled process execution.
     * @param {string} [message] - An optional message describing the result.
     * @returns {Promise<string>} JSON string confirming the completion was recorded.
     */
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

    /**
     * Triggers an immediate run of all pending scheduled processes.
     * @returns {Promise<string>} JSON string confirming the scheduled processes were triggered.
     */
    runAllScheduledProcesses() {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ScheduledProcess) + '/Run';
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

export default ScheduledProcessManager;
