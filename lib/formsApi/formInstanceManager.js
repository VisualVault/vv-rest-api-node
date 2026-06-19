/**
 * Manages form instance operations via the FormsApi.
 */
export class FormInstanceManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a new form instance from a form template.
     * @param {object} params - Optional URL parameters to include in the request.
     * @param {object} data - The form field data to submit in the request body.
     * @param {string} formTemplateRevisionId - The ID (Guid) of the form template revision to use; overrides any value in data.
     * @returns {Promise<object>} The API response containing the created form instance details.
     */
    async postForm(params, data, formTemplateRevisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormsApi.FormInstance;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        data['formTemplateId'] = formTemplateRevisionId || data['formTemplateId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Submits a new revision for an existing form instance.
     * @param {object} params - Optional URL parameters to include in the request.
     * @param {object} data - The updated form field data to submit in the request body.
     * @param {string} formTemplateRevisionId - The ID (Guid) of the form template revision; overrides any value in data.
     * @param {string} formId - The ID (Guid) of the existing form instance to revise; overrides any value in data.
     * @returns {Promise<object>} The API response containing the updated form instance details.
     */
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
