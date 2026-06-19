/**
 * Manager class for document API operations.
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
export class DocumentsManager {
    /**
     * @param {object} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a new document record.
     * @param {object} data - Document metadata.
     * @returns {Promise<string>} A promise that resolves with the created document.
     */
    postDoc(data) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Creates a new document record with an attached file.
     * @param {object} data - Document metadata to create.
     * @param {Buffer} fileData - The file content to upload.
     * @returns {Promise<string>} A promise that resolves with the created document.
     */
    postDocWithFile(data, fileData) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
    }

    /**
     * Copies a document to a new location.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Copy options.
     * @param {string} documentId - The Id of the document to copy.
     * @returns {Promise<string>} A promise that resolves with the copied document.
     */
    copyDocument(params, data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdCopy.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Moves a document to a different folder.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Move options.
     * @param {string} documentId - The Id of the document to move.
     * @returns {Promise<string>} A promise that resolves with the updated document.
     */
    moveDocument(params, data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdMove.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes a specific document.
     * @param {object} params - Optional query parameters.
     * @param {string} revisionId - The Id of the document revision to delete.
     * @returns {Promise<string>} A promise that resolves with the deletion result.
     */
    deleteDocument(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves metadata for a specific document.
     * @param {object} params - Optional query parameters.
     * @param {string} revisionId - The revision Id of the document to retrieve.
     * @returns {Promise<string>} A promise that resolves with the document metadata.
     */
    getDocumentRevision(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a list of documents matching the given query parameters.
     * @param {object} params - Query parameters for filtering, sorting, and pagination.
     * @returns {Promise<string>} A promise that resolves with the matching documents.
     */
    getDocuments(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Updates the index fields on a document.
     * @param {object} data - Index field values to update.
     * @param {string} documentId - The Id of the document to update.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
    putDocumentIndexFields(data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentIndexFields.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Subscribes a user to alert notifications for a specific document event.
     * @param {string} documentId - The Id of the document to subscribe to.
     * @param {string} eventId - The Id of the event to subscribe to.
     * @param {string} userId - The Id of the user to subscribe.
     * @returns {Promise<string>} A promise that resolves with the subscription result.
     */
    postDocumentAlertSubscription(documentId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentAlertsId.replace('{documentId}', documentId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Removes a user's subscription to alert notifications for a specific document event.
     * @param {string} documentId - The Id of the document.
     * @param {string} eventId - The Id of the event to unsubscribe from.
     * @param {string} userId - The Id of the user to unsubscribe.
     * @returns {Promise<string>} A promise that resolves with the unsubscription result.
     */
    deleteDocumentAlertSubscription(documentId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentAlertsId.replace('{documentId}', documentId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves OCR processing properties for a specific document revision.
     * @param {object} params - Optional query parameters.
     * @param {string} revisionId - The revision Id of the document.
     * @returns {Promise<string>} A promise that resolves with the OCR properties.
     */
    getDocumentRevisionOcrProperties(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdOcr.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a relationship between two document revisions.
     * @param {string} revisionId - The Id of the source document revision.
     * @param {string} relateToRevisionId - The revision Id of the document to relate to.
     * @param {string} relateType - The type of relationship to create.
     * @returns {Promise<string>} A promise that resolves with the relation result.
     */
    relateDocuments(revisionId, relateToRevisionId, relateType) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdRelateDocument.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            relateToId: relateToRevisionId,
            relateType
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Sets or updates the expiration date on a document.
     * @param {string} documentId - The Id of the document to update.
     * @param {string} expirationDate - The expiration date in ISO 8601 format.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
    updateDocumentExpiration(documentId, expirationDate) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdExpiration.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            expirationDate
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Retrieves the WebDAV URL for a document.
     * @param {string} documentId - The Id of the document.
     * @returns {Promise<string>} A promise that resolves with the WebDAV URL.
     */
    getDocumentWebDavUrl(documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsWebDavUrl.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Retrieves the WOPI URL for a document.
     * @param {string} documentId - The Id of the document.
     * @returns {Promise<string>} A promise that resolves with the WOPI URL.
     */
    getDocumentWopiUrl(documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsWopiUrl.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Initiates creation of a zip archive containing multiple documents.
     * @param {object} params - Optional query parameters.
     * @param {string[]} documentIds - Array of document Ids to include in the zip.
     * @returns {Promise<string>} A promise that resolves with a download key for polling zip status.
     */
    createDocumentZipFile(params, documentIds) {
        const resourceUri = this._httpHelper._config.ResourceUri.CreateDocumentZipFile;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = { documentDhIds: documentIds };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Checks the status of a zip file creation request initiated by createDocumentZipFile.
     * @param {object} params - Optional query parameters.
     * @param {string} downloadKey - The download key returned from createDocumentZipFile.
     * @returns {Promise<string>} A promise that resolves with the zip status and download URL.
     */
    getDocumentZipFileStatus(params, downloadKey) {
        const resourceUri = this._httpHelper._config.ResourceUri.GetDocumentZipFileStatus + `?downloadKey=${encodeURIComponent(downloadKey)}`;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the index fields and their values for a specific document.
     * @param {object} params - Optional query parameters.
     * @param {string} documentId - The Id of the document.
     * @returns {Promise<string>} A promise that resolves with the document's index fields.
     */
    getDocumentIndexFields(params, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentIndexFields.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves available document types defined in the vault.
     * @param {object} params - Optional query parameters for filtering.
     * @returns {Promise<string>} A promise that resolves with the document types.
     */
    getDocumentTypes(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentTypes;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new document type in the vault.
     * @param {object} params - Optional query parameters.
     * @param {string} name - The name of the document type to create.
     * @returns {Promise<string>} A promise that resolves with the created document type.
     */
    createDocumentType(params, name) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentTypes;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = { documentTypeName: name };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves saved document searches available to the current user.
     * @param {object} params - Optional query parameters for filtering.
     * @returns {Promise<string>} A promise that resolves with the saved searches.
     */
    getSavedSearches(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.SavedSearches;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves available document metadata fields defined in the vault.
     * @param {object} params - Optional query parameters for filtering.
     * @returns {Promise<string>} A promise that resolves with the document fields.
     */
    getDocumentFields(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the index fields associated with a saved search.
     * @param {object} params - Optional query parameters.
     * @param {string} savedSearchId - The Id of the saved search.
     * @returns {Promise<string>} A promise that resolves with the saved search's index fields.
     */
    getSavedSearchIndexFields(params, savedSearchId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SavedSearchIndexFields;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const mergedParams = { ...params, savedSearchId };

        return this._httpHelper.doVvClientRequest(url, opts, mergedParams, null);
    }

    /**
     * Retrieves the most recently accessed documents for the current user.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the recent documents.
     */
    getLastDocuments(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.LastDocuments;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the most frequently accessed documents for the current user.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the frequent documents.
     */
    getFrequentDocuments(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.FrequentDocuments;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves documents matching a saved search.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} savedSearchId - The Id of the saved search to execute.
     * @returns {Promise<string>} A promise that resolves with the matching documents.
     */
    getSavedSearchDocuments(params, savedSearchId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SavedSearchDocuments.replace('{savedSearchId}', savedSearchId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the default action link for a document.
     * @param {object} params - Optional query parameters.
     * @param {string} documentId - The Id of the document.
     * @returns {Promise<string>} A promise that resolves with the default action link.
     */
    getDocumentDefaultLink(params, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentDefaultAction.replace('{documentId}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default DocumentsManager;
