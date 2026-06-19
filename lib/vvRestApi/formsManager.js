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
 * Manager class for Forms operations.
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
export class FormsManager {
    /**
     * @param {object} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a ReturnField instance representing a form field value or error.
     * @param {string} id - The field ID.
     * @param {string} name - The field name.
     * @param {*} value - The field value.
     * @param {boolean} isError - Whether the field has an error.
     * @param {string} errorMessage - The error message if isError is true.
     * @returns {ReturnField} A new ReturnField instance.
     */
    returnField(id, name, value, isError, errorMessage) {
        return new ReturnField(id, name, value, isError, errorMessage);
    }

    /**
     * Retrieves available form templates in the vault.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the form templates.
     */
    getFormTemplates(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FormTemplates);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Looks up the GUID and revision GUID for a form template by its display name.
     * @param {string} templateName - The display name of the form template.
     * @returns {Promise<{formsManager: FormsManager, templateIdGuid: string, templateRevisionIdGuid: string, error?: string}>} A promise that resolves with the template IDs, or an error property if the lookup fails.
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

    /**
     * Retrieves form instances for a given form template. Accepts either a template GUID or template name.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} formTemplateId - The form template GUID or display name.
     * @returns {Promise<string>} A promise that resolves with the form instances.
     */
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

    /**
     * Sets an image field on a form instance.
     * @param {string} formId - The ID of the form instance.
     * @param {string} fieldId - The ID of the image field to set.
     * @param {string} imageId - The ID of the image to assign to the field.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
    setFieldImage(formId, fieldId, imageId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceImage.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);

        const data = { fieldId, imageId };
        const params = { fieldId, imageId };
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Imports a form template from a file stream.
     * @param {object} data - Import metadata.
     * @param {string} formTemplateId - The ID of the form template to import into.
     * @param {Buffer} buffer - The file content of the form template to import.
     * @returns {Promise<string>} A promise that resolves with the import result.
     */
    importFormTemplate(data, formTemplateId, buffer) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormTemplatesImport.replace('{id}', formTemplateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, buffer);
    }

    /**
     * Creates a new form instance for a given template. Accepts either a template GUID or template name.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Form field values for the new instance.
     * @param {string} formTemplateId - The form template GUID or display name.
     * @returns {Promise<string>} A promise that resolves with the created form instance.
     */
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

    /**
     * Creates a new revision of an existing form instance. Accepts either a template GUID or template name.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Form field values for the new revision.
     * @param {string} formTemplateId - The form template GUID or display name.
     * @param {string} formId - The ID of the existing form instance to revise.
     * @returns {Promise<string>} A promise that resolves with the new form revision.
     */
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

    /**
     * Creates a new revision of a form instance identified directly by its form ID.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Form field values for the new revision.
     * @param {string} formId - The ID of the form instance to revise.
     * @returns {Promise<string>} A promise that resolves with the new form revision.
     */
    postFormRevisionByFormId(params, data, formId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FormsId).replace('{id}', formId);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates the originator (owner) of a form instance.
     * @param {string} formInstanceId - The ID of the form instance to update.
     * @param {string} newOriginatorUsID - The user ID of the new originator.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
    updateFormInstanceOriginator(formInstanceId, newOriginatorUsID) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceUpdateOriginator.replace('{id}', formInstanceId);
        const url = this._httpHelper.getUrl(resourceUri);

        const params = { userId: newOriginatorUsID };
        const data = null;
        const opts = { method: "PUT" };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to another form instance by form ID.
     * @param {string} formId - The ID of the source form instance.
     * @param {string} relateToId - The ID of the form instance to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateForm(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateForm');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to another form instance by document ID.
     * @param {string} formId - The ID of the source form instance.
     * @param {string} relateToDocId - The document ID of the form instance to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateFormByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateForm');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to a document by document revision ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToId - The revision ID of the document to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateDocument(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateDocument');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to a document by document ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToDocId - The document ID to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateDocumentByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateDocument');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to a project by project ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToId - The ID of the project to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateProject(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateProject');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Relates a form instance to a project by project name.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToProjectName - The name of the project to relate to.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateProjectByName(formId, relateToProjectName) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/relateProject');

        const params = { relateToProjectName };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between two form instances by form ID.
     * @param {string} formId - The ID of the source form instance.
     * @param {string} relateToId - The ID of the related form instance to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateForm(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateForm');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between two form instances by document ID.
     * @param {string} formId - The ID of the source form instance.
     * @param {string} relateToDocId - The document ID of the related form instance to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateFormByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateForm');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between a form instance and a document by document revision ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToId - The revision ID of the related document to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateDocument(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateDocument');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between a form instance and a document by document ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToDocId - The document ID of the related document to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateDocumentByDocId(formId, relateToDocId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateDocument');

        const params = { relateToDocId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between a form instance and a project by project ID.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToId - The ID of the related project to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateProject(formId, relateToId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateProject');

        const params = { relateToId };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Removes a relationship between a form instance and a project by project name.
     * @param {string} formId - The ID of the form instance.
     * @param {string} relateToProjectName - The name of the related project to unrelate.
     * @returns {Promise<string>} A promise that resolves with the unrelation result.
     */
    unrelateProjectByName(formId, relateToProjectName) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri + '/unrelateProject');

        const params = { relateToProjectName };
        const data = null;
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves documents related to a form instance.
     * @param {string} formId - The ID of the form instance.
     * @param {object} [params] - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the related documents.
     */
    getFormRelatedDocs(formId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceRelatedDocs.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        if (params === undefined) {
            params = null;
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves form instances related to a given form instance.
     * @param {string} formId - The ID of the form instance.
     * @param {object} [params] - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the related form instances.
     */
    getFormRelatedForms(formId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstanceRelatedForms.replace('{id}', formId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        if (params === undefined) {
            params = null;
        }

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Tests whether a string is a valid GUID.
     * @param {string} stringToTest - The string to test.
     * @returns {boolean} True if the string is a valid GUID, false otherwise.
     */
    isGuid(stringToTest) {
        let testString = stringToTest;
        if (testString[0] === "{") {
            testString = testString.substring(1, testString.length - 1);
        }
        const regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
        return regexGuid.test(testString);
    }

    /**
     * Retrieves a specific form instance by template ID and instance ID.
     * @param {string} templateId - The ID of the form template.
     * @param {string} instanceId - The ID of the form instance.
     * @returns {Promise<string>} A promise that resolves with the form instance.
     */
    getFormInstanceById(templateId, instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormId.replace('{id}', templateId).replace('{formId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Retrieves a form instance as a PDF stream.
     * @param {string} templateId - The ID of the form template.
     * @param {string} instanceId - The ID of the form instance.
     * @returns {Promise<string>} A promise that resolves with the PDF content stream.
     */
    getFormInstancePDF(templateId, instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormIdPdf.replace('{id}', templateId).replace('{formId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Retrieves the field definitions for a form template.
     * @param {string} templateId - The ID of the form template.
     * @returns {Promise<string>} A promise that resolves with the template's field definitions.
     */
    getFormTemplateFields(templateId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormDesignerFormsTemplatesIdFields.replace('{id}', templateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Deletes a form instance.
     * @param {string} instanceId - The ID of the form instance to delete.
     * @returns {Promise<string>} A promise that resolves with the deletion result.
     */
    deleteFormInstance(instanceId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormInstance.replace('{id}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Releases a form template.
     * @param {string} formTemplateId - The ID of the form template to release.
     * @returns {Promise<string>} A promise that resolves with the release result.
     */
    releaseFormTemplate(formTemplateId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormTemplatesRelease.replace('{id}', formTemplateId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }
}

// Default export for backward compatibility
export default FormsManager;
