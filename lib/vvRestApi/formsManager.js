import createDebug from 'debug';

const debug = createDebug('visualvault:forms');

/**
 * Helper class for form field return values
 */
export class ReturnField {
    /** @type {string} */ id;
    /** @type {string} */ name;
    /** @type {*} */ value;
    /** @type {boolean} */ isError;
    /** @type {string} */ errorMessage;

    /**
     * @param {string} id - Field ID
     * @param {string} name - Field name
     * @param {*} value - Field value
     * @param {boolean} isError - Whether field has an error
     * @param {string} errorMessage - Error message if any
     */
    constructor(id, name, value, isError, errorMessage) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.isError = isError;
        this.errorMessage = errorMessage;
    }
}

/**
 * Helper class for managing form field collections
 */
export class FormFieldCollection {
    /**
     * @param {Array<*>} ffColl - Array of form fields
     */
    constructor(ffColl) {
        this._ffColl = ffColl;
    }

    /**
     * Get a form field by name
     * @param {string} name - Field name to search for
     * @returns {*} The field or null if not found
     */
    getFormFieldByName(name) {
        const fieldName = name.toLowerCase();
        return this._ffColl.find(field =>
            field.name.toLowerCase() === fieldName
        ) || null;
    }

    /**
     * Get a form field by ID
     * @param {string} id - Field ID to search for
     * @returns {*} The field or null if not found
     */
    getFormFieldById(id) {
        const fieldId = id.toLowerCase();
        return this._ffColl.find(field =>
            field.id.toLowerCase() === fieldId
        ) || null;
    }

    /**
     * Get the array of all form fields
     * @returns {Array<*>} Array of form fields
     */
    getFieldArray() {
        return this._ffColl;
    }
}

/**
 * Manager class for forms API operations
 */
export class FormsManager {
    /**
     * @param {*} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    returnField(id, name, value, isError, errorMessage) {
        return new ReturnField(id, name, value, isError, errorMessage);
    }

    getFormTemplates(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FormTemplates);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * @param {string} templateName
     * @returns {Promise<{formsManager: FormsManager, templateIdGuid: string, templateRevisionIdGuid: string, error?: string}>}
     */
    async getFormTemplateIdByName(templateName) {
        const params = {
            fields: "id, name, description, revision, revisionId",
            q: `name eq '${templateName}'`
        };

        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FormTemplates);
        const opts = { method: 'GET' };

        try {
            const resp = await this._httpHelper.doVvClientRequest(url, opts, params, null);
            const templateResp = JSON.parse(resp);

            let templateId;
            let templateRevisionId;

            if (templateResp.data && templateResp.data.length > 0) {
                templateId = templateResp.data[0].id;
                templateRevisionId = templateResp.data[0].revisionId;
            }

            return {
                formsManager: this,
                templateIdGuid: templateId,
                templateRevisionIdGuid: templateRevisionId
            };
        } catch (error) {
            debug('Failed to get form template by name "%s": %s', templateName, error.message);

            return {
                formsManager: this,
                templateIdGuid: '',
                templateRevisionIdGuid: '',
                error: error.message
            };
        }
    }

    async getForms(params, formTemplateId) {
        // If formTemplateId is not a Guid assume it's a template name and fetch the Guid
        if (!this.isGuid(formTemplateId)) {
            const resp = await this.getFormTemplateIdByName(formTemplateId);
            const templateIdGuid = resp.templateIdGuid;
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', templateIdGuid);
            const url = this._httpHelper.getUrl(resourceUri);
            const opts = { method: 'GET' };

            return this._httpHelper.doVvClientRequest(url, opts, params, null);
        } else {
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', formTemplateId);
            const url = this._httpHelper.getUrl(resourceUri);
            const opts = { method: 'GET' };

            return this._httpHelper.doVvClientRequest(url, opts, params, null);
        }
    }

    setFieldImage(formId, fieldId, imageId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceImage.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);

        const data = { fieldId, imageId };
        const params = { fieldId, imageId };
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    importFormTemplate(data, formTemplateId, buffer) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormTemplatesImport.replace('{id}', formTemplateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, buffer);
    }

    async postForms(params, data, formTemplateId) {
        // If formTemplateId is not a Guid assume it's a template name and fetch the Guid
        if (!this.isGuid(formTemplateId)) {
            const resp = await this.getFormTemplateIdByName(formTemplateId);
            const templateIdGuid = resp.templateIdGuid;
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', templateIdGuid);
            const url = this._httpHelper.getUrl(resourceUri);
            const opts = { method: 'POST' };

            return this._httpHelper.doVvClientRequest(url, opts, params, data);
        } else {
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', formTemplateId);
            const url = this._httpHelper.getUrl(resourceUri);
            const opts = { method: 'POST' };

            return this._httpHelper.doVvClientRequest(url, opts, params, data);
        }
    }

    async postFormRevision(params, data, formTemplateId, formId) {
        // If formTemplateId is not a Guid assume it's a template name and fetch the Guid
        if (!this.isGuid(formTemplateId)) {
            const resp = await this.getFormTemplateIdByName(formTemplateId);
            const templateIdGuid = resp.templateIdGuid;
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', templateIdGuid);
            const url = this._httpHelper.getUrl(resourceUri + '/' + formId);
            const opts = { method: 'POST' };

            return this._httpHelper.doVvClientRequest(url, opts, params, data);
        } else {
            const resourceUri = this._httpHelper._config.ResourceUri.Forms.replace('{id}', formTemplateId);
            const url = this._httpHelper.getUrl(resourceUri + '/' + formId);
            const opts = { method: 'POST' };

            return this._httpHelper.doVvClientRequest(url, opts, params, data);
        }
    }

    postFormRevisionByFormId(params, data, formId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FormsId).replace('{id}', formId);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    updateFormInstanceOriginator(formInstanceId, newOriginatorUsID) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceUpdateOriginator.replace('{id}', formInstanceId);
        const url = this._httpHelper.getUrl(resourceUri);

        const params = { userId: newOriginatorUsID };
        const data = null;
        const opts = { method: "PUT" };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateForm(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateForm');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateFormByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateForm');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateDocument(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateDocument');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateDocumentByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateDocument');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateProject(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateProject');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    relateProjectByName(formId, relateToProjectName) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateProject');

        const params = { relateToProjectName };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateForm(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateForm');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateFormByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateForm');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateDocument(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateDocument');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateDocumentByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateDocument');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateProject(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateProject');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    unrelateProjectByName(formId, relateToProjectName) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateProject');

        const params = { relateToProjectName };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    getFormRelatedDocs(formId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceRelatedDocs.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        if (params === undefined) {
            params = null;
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getFormRelatedForms(formId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceRelatedForms.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        if (params === undefined) {
            params = null;
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    isGuid(stringToTest) {
        let testString = stringToTest;
        if (testString[0] === "{") {
            testString = testString.substring(1, testString.length - 1);
        }
        const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
        return regexGuid.test(testString);
    }

    getFormInstanceById(templateId, instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormId.replace('{id}', templateId).replace('{formId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    getFormInstancePDF(templateId, instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormIdPdf.replace('{id}', templateId).replace('{formId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    getFormTemplateFields(templateId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormDesignerFormsTemplatesIdFields.replace('{id}', templateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    deleteFormInstance(instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    releaseFormTemplate(formTemplateId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormTemplatesRelease.replace('{id}', formTemplateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

// Default export for backward compatibility
export default FormsManager;
