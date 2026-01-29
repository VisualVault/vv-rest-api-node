export class FormInstanceManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    async postForm(params, data, formTemplateRevisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormsApi.FormInstance;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        data['formTemplateId'] = formTemplateRevisionId || data['formTemplateId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    async postFormRevision(params, data, formTemplateRevisionId, formId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormsApi.FormInstance;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        // only add these if provided. params could already have the value
        data['formTemplateId'] = formTemplateRevisionId || data['formTemplateId'];
        data['formId'] = formId || data['formId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default FormInstanceManager;