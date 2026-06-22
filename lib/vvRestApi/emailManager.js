/**
 * Manages email sending operations via the VVRestApi.
 */
export class EmailManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Sends one or more emails.
     * @param {object} params - URL parameters to include in the request.
     * @param {object} data - The email data to submit in the request body.
     * @returns {Promise<string>} JSON string confirming the emails were sent.
     */
    postEmails(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Emails);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Sends one or more emails with file attachments.
     * @param {object} params - URL parameters to include in the request.
     * @param {object} data - The email data to submit in the request body.
     * @param {object[]} fileObjs - Array of file objects to attach to the emails.
     * @returns {Promise<string>} JSON string confirming the emails were sent.
     */
    postEmailsWithAttachments(params, data, fileObjs) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Emails);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data, fileObjs);
    }
}

export default EmailManager;
