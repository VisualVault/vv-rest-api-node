/**
 * Manager class for form instance operations.
 *
 * All methods return a `Promise<string>` containing a JSON-encoded API response.
 * When parsed, the response has the shape:
 * ```json
 * {
 *   "meta": { "status": 200, "statusMsg": "OK", "errors": [] },
 *   "data": { ... }
 * }
 * ```
 * Check `meta.status` to determine success or failure before consuming `data`.
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
     * @param {object} params - URL parameters to include in the request.
     * @param {object} data - The form instance creation payload (maps to FormInstanceRequest).
     * @param {string} formTemplateRevisionId - The ID (Guid) of the form template revision to use; overrides any value in data.
     * @param {string} data.formTemplateId - The Guid of the form template revision; overridden by the formTemplateRevisionId argument if provided.
     * @param {Array<{key: string, value: *, props?: Array<{key: string, value: string}>}>} data.fields - (Required) Form field values. Each item's key is the field name or its Guid; value is the field's value; props holds any extra key/value pairs to save alongside.
     * @param {string} [data.formName] - The DhDocId (display name) for the new form instance.
     * @param {string} [data.parentFormId] - Guid of the parent form instance (for child forms linked via a relation).
     * @param {string} [data.controlFormId] - Guid of the form control (e.g. RRC or Questions) associated with this instance.
     * @param {string} [data.offlineFormId] - Guid assigned to this form while offline; used when syncing offline forms.
     * @param {boolean} [data.ignoreWorkflow] - When true, skips workflow processing for this save.
     * @returns {Promise<string>} The API response containing the created form instance details.
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
     * @param {object} params - URL parameters to include in the request.
     * @param {object} data - The form instance revision payload (maps to UpdateFormInstanceRequest, which extends FormInstanceRequest).
     * @param {string} formTemplateRevisionId - The ID (Guid) of the form template revision; overrides any value in data.
     * @param {string} formId - The ID (Guid) of the existing form instance to revise; overrides any value in data.
     * @param {string} data.formTemplateId - The Guid of the form template revision; overridden by the formTemplateRevisionId argument if provided.
     * @param {string} data.formId - The Guid of the existing form instance being revised; overridden by the formId argument if provided.
     * @param {Array<{key: string, value: *, props?: Array<{key: string, value: string}>}>} data.fields - (Required) Form field values. Each item's key is the field name or its Guid; value is the field's value; props holds any extra key/value pairs to save alongside.
     * @param {boolean} [data.replaceRevision] - When true, replaces the current revision instead of creating a new one.
     * @param {string} [data.formName] - The DhDocId (display name) for this revision.
     * @param {string} [data.parentFormId] - Guid of the parent form instance (for child forms linked via a relation).
     * @param {string} [data.controlFormId] - Guid of the form control (e.g. RRC or Questions) associated with this instance.
     * @param {string} [data.offlineFormId] - Guid assigned to this form while offline; used when syncing offline forms.
     * @param {boolean} [data.ignoreWorkflow] - When true, skips workflow processing for this save.
     * @returns {Promise<string>} The API response containing the updated form instance details.
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
