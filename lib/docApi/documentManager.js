/**
 * Manages document-related operations via the DocApi.
 */
export class DocumentManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a new document.
     * @param {object} data - The document data to submit in the request body.
     * @returns {Promise<object>} The API response containing the created document details.
     */
    async createDocument(data) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocApi.CreateDocument;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Retrieves a specific document revision by its ID.
     * @param {string} documentRevisionId - The ID (Guid) of the document revision to retrieve.
     * @returns {Promise<object>} The API response containing the document revision details.
     */
    async GetRevision(documentRevisionId) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.GetRevision;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Retrieves the OCR processing status for a document revision.
     * @param {string} documentRevisionId - The ID (Guid) of the document revision to check.
     * @returns {Promise<object>} The API response containing the OCR status for the document revision.
     */
    async getDocumentOcrStatus(documentRevisionId) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.OcrStatus;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);

        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Updates the OCR processing status for a document revision.
     * @param {string} documentRevisionId - The ID (Guid) of the document revision to update.
     * @param {object} data - The OCR status data to submit in the request body.
     * @returns {Promise<object>} The API response confirming the OCR status update.
     */
    async updateDocumentOcrStatus(documentRevisionId, data) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.OcrStatus;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);

        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Updates an existing document by its ID.
     * @param {string} documentId - The ID (Guid) of the document to update.
     * @param {object} data - The updated document data to submit in the request body.
     * @returns {Promise<object>} The API response confirming the document update.
     */
    async updateDocument(documentId, data) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.UpdateDocument;
        resourceUri = resourceUri.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Searches for documents using advanced search criteria.
     * @param {object[]} criteriaList - List of search criteria objects to filter results.
     * @param {string[]} searchFolders - List of folder paths to include in the search scope.
     * @param {string[]} excludeFolders - List of folder paths to exclude from the search scope.
     * @param {string} sortBy - The field name to sort the results by.
     * @param {string} [sortDirection='desc'] - Sort direction, either 'asc' or 'desc'.
     * @param {number} [page=0] - Zero-based page index for pagination.
     * @param {number} [take=15] - Number of results to return per page.
     * @param {number} [archiveType=0] - Archive type filter: 0 for active, 1 for archived documents.
     * @param {boolean} [roleSecurity=false] - Whether to apply role-based security filtering.
     * @returns {Promise<object>} The API response containing the matching documents and pagination info.
     */
    async search(criteriaList, searchFolders, excludeFolders, sortBy, sortDirection = 'desc', page = 0, take = 15, archiveType = 0, roleSecurity = false) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.DocApi.AdvancedSearch);

        const data = {
            criteriaList,
            searchFolders,
            excludeFolders,
            sortBy,
            sortDirection,
            page,
            take,
            archiveType,
            roleSecurity
        };

        const options = { method: 'POST'};
        return this._httpHelper.doVvClientRequest(url, options, null, data);
    }
}

export default DocumentManager;
