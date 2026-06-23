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
export class DocumentManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a new document.
     * @param {object} data - The document creation payload (maps to CreateDocumentRequest).
     * @param {string} data.folderId - (Required) The Guid of the folder to create the document in.
     * @param {string} [data.name] - The document name.
     * @param {string} [data.revision] - The revision label.
     * @param {string} [data.documentState] - The document state.
     * @param {string} [data.fileName] - The file name of the attached file.
     * @param {string} [data.contentType] - The MIME type of the attached file.
     * @param {number[]|Uint8Array} [data.fileBytes] - The file content as a byte array.
     * @param {number} [data.fileLength] - The byte length of the file.
     * @param {Array<{key: string, value: string}>} [data.indexFields] - Index field key/value pairs.
     * @param {string} [data.docType] - The document type.
     * @param {number} [data.confidence] - OCR confidence score (decimal).
     * @param {string} [data.description] - Document description.
     * @param {string} [data.keywords] - Document keywords.
     * @param {string} [data.abstract] - Document abstract.
     * @param {string} [data.changeText] - Change description for this revision.
     * @returns {Promise<string>} The API response containing the created document details.
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
     * @returns {Promise<string>} The API response containing the document revision details.
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
     * @returns {Promise<string>} The API response containing the OCR status for the document revision.
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
     * @param {object} data - The OCR status payload (maps to OcrStatusUpdateRequest).
     * @param {number} data.ocrErrorCode - Error code enum: 0=None, 1=ErrorThrown, 2=OcrProcessingError, 3=OcrOutputSaveError, 4=CheckinError.
     * @param {number} data.ocrStatus - Status enum: 0=None, 1=Success, 2=SuccessNoTextExtracted, 3=Failure, 4=FailureNoRetry, 5=ResultingDocumentFromSuccess.
     * @param {number} data.pageCount - Number of pages processed.
     * @param {number} data.wordCount - Number of words extracted.
     * @returns {Promise<string>} The API response confirming the OCR status update.
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
     * @param {object} data - The document update payload (maps to UpdateDocumentRequest).
     * @param {string} [data.name] - The document name.
     * @param {string} [data.displayRev] - The display revision label.
     * @param {string} [data.description] - Document description.
     * @param {string} [data.keywords] - Document keywords.
     * @param {string} [data.comments] - Comments for this revision.
     * @param {string} [data.abstract] - Document abstract.
     * @param {string} [data.changeText] - Change description for this revision.
     * @param {string} [data.archive] - Archive state value.
     * @param {string} [data.state] - Document state.
     * @param {Array<{key: string, value: string}>} [data.indexFields] - Index field key/value pairs.
     * @param {string} [data.docType] - The document type.
     * @param {number} [data.confidence] - OCR confidence score (decimal).
     * @returns {Promise<string>} The API response confirming the document update.
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
     * @returns {Promise<string>} The API response containing the matching documents and pagination info.
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
