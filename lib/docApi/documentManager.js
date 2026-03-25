export class DocumentManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    async createDocument(data) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocApi.CreateDocument;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    async GetRevision(documentRevisionId) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.GetRevision;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    async getDocumentOcrStatus(documentRevisionId) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.OcrStatus;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);

        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    async updateDocumentOcrStatus(documentRevisionId, data) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.OcrStatus;
        resourceUri = resourceUri.replace('{id}', documentRevisionId);
        const url = this._httpHelper.getUrl(resourceUri);

        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    async updateDocument(documentId, data) {
        let resourceUri = this._httpHelper._config.ResourceUri.DocApi.UpdateDocument;
        resourceUri = resourceUri.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

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
