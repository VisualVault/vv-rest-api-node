export class DocumentsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    postDoc(data) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    postDocWithFile(data, fileData) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POSTSTREAM' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data, fileData);
    }

    copyDocument(params, data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdCopy.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    moveDocument(params, data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdMove.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    deleteDocument(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getDocumentRevision(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsId.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getDocuments(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsPost;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    putDocumentIndexFields(data, documentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentIndexFields.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    postDocumentAlertSubscription(documentId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentAlertsId.replace('{documentId}', documentId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    deleteDocumentAlertSubscription(documentId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentAlertsId.replace('{documentId}', documentId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getDocumentRevisionOcrProperties(params, revisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdOcr.replace('{id}', revisionId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

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

    updateDocumentExpiration(documentId, expirationDate) {
        const resourceUri = this._httpHelper._config.ResourceUri.DocumentsIdExpiration.replace('{id}', documentId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            expirationDate
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }
}

export default DocumentsManager;
