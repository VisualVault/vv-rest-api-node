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
     * @param {Buffer} buffer - The raw file bytes to upload.
     * @returns {Promise<string>} JSON string containing the uploaded file details.
     */
    postFile(data, buffer) {
        const resourceUri = this._httpHelper._config.ResourceUri.Files;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, buffer);
    }
}

export default FilesManager;
