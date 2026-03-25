export class LibraryManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getFolders(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Folders);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    postFolderByPath(params, data, folderPath) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Folders);

        data.folderpath = folderPath;
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    // Valid fields to be defined on the "data" parameter to be updated on the folder: name, description
    putFolder(params, data, folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    deleteFolder(folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    copyFolder(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersCopy);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    moveFolder(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersMove);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    getDocuments(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Documents.replace('{id}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getFolderByPath(params, folderPath) {
        const resourceUri = this._httpHelper._config.ResourceUri.Folders + '?folderpath=' + encodeURIComponent(folderPath);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    updateFolderIndexFieldOverrideSettings(folderId, fieldId, queryId, displayField, valueField, dropDownListId, required, defaultValue) {
        const data = {
            queryId,
            queryValueField: valueField,
            queryDisplayField: displayField,
            dropDownListId,
            required,
            defaultValue
        };

        const resourceUri = this._httpHelper._config.ResourceUri.FoldersIdIndexFieldsId.replace('{id}', folderId).replace('{indexFieldId}', fieldId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    getFolderIndexFields(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderIndexFields.replace('{id}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    postFolderAlertSubscription(folderId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderAlertsId.replace('{folderId}', folderId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    deleteFolderAlertSubscription(folderId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderAlertsId.replace('{folderId}', folderId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getFolderSecurityMembers(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderSecurity.replace('{folderId}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    putFolderSecurityMember(folderId, memberId, memberType, securityRole, cascadeSecurityChanges) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderSecurityId.replace('{folderId}', folderId).replace('{memberId}', memberId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            memberType,
            securityRole,
            cascadeSecurityChanges
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    deleteFolderSecurityMember(folderId, memberId, cascadeSecurityChanges) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderSecurityId.replace('{folderId}', folderId).replace('{memberId}', memberId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            cascadeSecurityChanges
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default LibraryManager;
