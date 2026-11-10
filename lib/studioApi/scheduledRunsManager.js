import { buildCompletionParams } from '../vvRestApi/scheduledProcessManager.js';

/**
 * Manages scheduled Run operations via the StudioApi.
 */
export class ScheduledRunsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    /**
     * Posts the Completion of a scheduled Run to StudioApi.
     * @param {string} runToken - The Run token of the scheduled Run.
     * @param {string} action - The Completion action.
     * @param {boolean|string} result - The Run result.
     * @param {string} [message] - An optional message describing the result.
     * @returns {Promise<string>} JSON string from StudioApi.
     */
    async postCompletion(runToken, action, result, message){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.ScheduledRunCompletion
            .replace('{runToken}', encodeURIComponent(runToken));
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const params = buildCompletionParams(action, result, message);

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ScheduledRunsManager;
