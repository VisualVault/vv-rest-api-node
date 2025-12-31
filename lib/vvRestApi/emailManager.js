export class EmailManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    postEmails(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Emails);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    postEmailsWithAttachments(params, data, fileObjs) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Emails);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data, fileObjs);
    }
}

export default EmailManager;
