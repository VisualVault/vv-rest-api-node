export class FilesManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getFileBytesQuery(query) {
        const resourceUri = this._httpHelper._config.ResourceUri.FilesQuery + query;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    getFileBytesId(id) {
        const resourceUri = this._httpHelper._config.ResourceUri.FilesId.replace('{id}', id);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    postFile(data, buffer) {
        const resourceUri = this._httpHelper._config.ResourceUri.Files;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data, buffer);
    }
}

export default FilesManager;
