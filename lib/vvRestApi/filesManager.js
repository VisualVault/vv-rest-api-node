/**
 * Manages file upload and download operations via the VVRestApi.
 */
export class FilesManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Downloads file bytes using a query string path.
     * @param {string} query - The query string to append to the files resource URI.
     * @returns {Promise<Buffer>} The API response containing the raw file bytes.
     */
    getFileBytesQuery(query) {
        const resourceUri = this._httpHelper._config.ResourceUri.FilesQuery + query;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Downloads file bytes by file ID.
     * @param {string} id - The ID (Guid) of the file to download.
     * @returns {Promise<Buffer>} The API response containing the raw file bytes.
     */
    getFileBytesId(id) {
        const resourceUri = this._httpHelper._config.ResourceUri.FilesId.replace('{id}', id);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Uploads a file to the VVRestApi.
     * @param {object} data - The file metadata to include in the request body.
     * @param {string} [data.fileId] - The file revision ID of the document to update. Required if documentId is not provided.
     * @param {string} [data.documentId] - The document ID of the document to update. Required if fileId is not provided.
     * @param {string} [data.fileName] - The filename to assign to the uploaded file.
     * @param {string} [data.revision] - The revision label to assign to the new revision.
     * @param {string} [data.changeReason] - The reason for uploading a new revision.
     * @param {string} [data.checkInDocumentState] - The document state after check-in: "Released", "Unreleased", or "Replace". Defaults to "Released".
     * @param {boolean} [data.checkIn] - Whether to check in the document after upload. Defaults to true.
     * @param {string} [data.indexFields] - JSON-serialized index fields; accepts an array of `{"fieldLabel": "value"}` objects or a single object with field labels as keys.
     * @param {string} [data.parameters] - JSON string with optional upload parameters: `source`, `command`, `ocrStatus`, `keepAnnotations`.
     * @param {Uint8Array} buffer - The raw file bytes to upload.
     * @returns {Promise<string>} The API response containing the uploaded file details.
     */
    postFile(data, buffer) {
        const resourceUri = this._httpHelper._config.ResourceUri.Files;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, buffer);
    }
}

export default FilesManager;
