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
     * @param {string} data.recipients - The recipient email address(es).
     * @param {string} data.body - The email body content.
     * @param {string} [data.ccRecipients] - CC recipient email address(es).
     * @param {string} [data.bccRecipients] - BCC recipient email address(es).
     * @param {string} [data.subject] - The email subject line.
     * @param {boolean} [data.hasAttachments] - Whether the email includes document attachments.
     * @param {string|string[]} [data.documents] - One or more document IDs (Guids) to attach. Used when hasAttachments is true.
     * @returns {Promise<string>} The API response confirming the emails were sent.
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
     * @param {string} data.recipients - The recipient email address(es).
     * @param {string} data.body - The email body content.
     * @param {string} [data.ccRecipients] - CC recipient email address(es).
     * @param {string} [data.bccRecipients] - BCC recipient email address(es).
     * @param {string} [data.subject] - The email subject line.
     * @param {boolean} [data.hasAttachments] - Whether the email includes document attachments.
     * @param {string|string[]} [data.documents] - One or more document IDs (Guids) to attach alongside the direct file uploads.
     * @param {object[]} fileObjs - Array of file objects to attach directly to the email.
     * @returns {Promise<string>} The API response confirming the emails were sent.
     */
    postEmailsWithAttachments(params, data, fileObjs) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Emails);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data, fileObjs);
    }
}

export default EmailManager;
