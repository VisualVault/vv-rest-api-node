/**
 * @typedef {(id: string, action: string, result: boolean|string, message?: string) => Promise<string>} CompletionPoster
 */

/**
 * Manages scheduled process operations via the VVRestApi.
 */
export class ScheduledProcessManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     * @param {() => (CompletionPoster|null)} [getCompletionPoster] - Returns the function that posts Completions to
     *   the client's completion target, or `null` to post them to VVCore.
     */
    constructor(httpHelper, getCompletionPoster) {
        this._httpHelper = httpHelper;
        /** @private @type {() => (CompletionPoster|null)} */
        this._getCompletionPoster = getCompletionPoster ?? null;
    }

    /**
     * Posts a completion status for a scheduled process.
     *
     * When the client's completion target is `studioapi` (see `VVClient.setCompletionTarget`), the Completion goes to
     * StudioApi for the Run token `id`, and VVCore never receives it.
     * @param {string} id - The ID of the scheduled process to complete, or the Run token when the target is `studioapi`.
     * @param {string} action - The action taken by the scheduled process.
     * @param {boolean|string} result - The result of the scheduled process execution.
     * @param {string} [message] - An optional message describing the result.
     * @returns {Promise<string>} JSON string confirming the completion was recorded.
     * @throws {Error} The target is `studioapi` and the client has no enabled StudioApi, VVCore gives no JWT that is
     *   valid for more than 30 seconds, or the StudioApi request fails.
     */
    postCompletion(id, action, result, message) {
        const postCompletionToTarget = this._getCompletionPoster?.();
        if (postCompletionToTarget) {
            return postCompletionToTarget(id, action, result, message);
        }

        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.ScheduledProcess) + '/' + id;
        const opts = { method: 'POST' };

        const params = buildCompletionParams(action, result, message);

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

/**
 * Builds the Completion query parameters shared by the VVCore and StudioApi routes.
 * @param {string} action
 * @param {boolean|string} result - Sent as a string. Omitted when `null` or an empty string.
 * @param {string} [message] - Omitted when empty.
 * @returns {{ action: string, result?: string, message?: string }}
 */
export function buildCompletionParams(action, result, message) {
    const params = {
        action
    };

    if (result !== null && (typeof result === 'boolean' || result.length > 0)) {
        params.result = result.toString();
    }

    if (message && message.length > 0) {
        params.message = message;
    }

    return params;
}

export default ScheduledProcessManager;
