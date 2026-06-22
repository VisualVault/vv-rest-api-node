/**
 * Manager class for Library (folder) operations.
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
export class LibraryManager {
    /**
     * @param {object} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves all folders.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the list of folders.
     */
    getFolders(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Folders);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new folder at the specified path.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Folder properties to create.
     * @param {string} folderPath - The full path where the folder should be created.
     * @returns {Promise<string>} A promise that resolves with the created folder.
     */
    postFolderByPath(params, data, folderPath) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Folders);

        data.folderpath = folderPath;
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a folder's properties. Valid fields: `name`, `description`.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Folder properties to update (name, description).
     * @param {string} folderId - The ID of the folder to update.
     * @returns {Promise<string>} A promise that resolves with the updated folder.
     */
    putFolder(params, data, folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes a folder.
     * @param {string} folderId - The ID of the folder to delete.
     * @returns {Promise<string>} A promise that resolves with the deletion result.
     */
    deleteFolder(folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Copies a folder to a new location.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Copy options including source and destination paths.
     * @returns {Promise<string>} A promise that resolves with the copy result.
     */
    copyFolder(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersCopy);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Moves a folder to a new location.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Move options including source and destination paths.
     * @returns {Promise<string>} A promise that resolves with the move result.
     */
    moveFolder(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersMove);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Retrieves documents within a specific folder.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} folderId - The ID of the folder to retrieve documents from.
     * @returns {Promise<string>} A promise that resolves with the folder's documents.
     */
    getDocuments(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Documents.replace('{id}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a folder by its full path.
     * @param {object} params - Optional query parameters.
     * @param {string} folderPath - The full path of the folder to retrieve.
     * @returns {Promise<string>} A promise that resolves with the folder.
     */
    getFolderByPath(params, folderPath) {
        const resourceUri = this._httpHelper._config.ResourceUri.Folders + '?folderpath=' + encodeURIComponent(folderPath);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Updates the index field override settings for a folder (query, dropdown list, required, default value).
     * @param {string} folderId - The ID of the folder.
     * @param {string} fieldId - The ID of the index field to configure.
     * @param {string} queryId - The ID of the query to use for the field's dropdown.
     * @param {string} displayField - The query field to display in the dropdown.
     * @param {string} valueField - The query field to use as the stored value.
     * @param {string} dropDownListId - The ID of a static dropdown list, if used instead of a query.
     * @param {boolean} required - Whether the field is required.
     * @param {string} defaultValue - The default value for the field.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
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

    /**
     * Retrieves the index fields associated with a folder.
     * @param {object} params - Optional query parameters for filtering.
     * @param {string} folderId - The ID of the folder.
     * @returns {Promise<string>} A promise that resolves with the folder's index fields.
     */
    getFolderIndexFields(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderIndexFields.replace('{id}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Subscribes a user to alert notifications for a specific folder event.
     * @param {string} folderId - The ID of the folder to subscribe to.
     * @param {string} eventId - The ID of the event to subscribe to.
     * @param {string} userId - The ID of the user to subscribe.
     * @returns {Promise<string>} A promise that resolves with the subscription result.
     */
    postFolderAlertSubscription(folderId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderAlertsId.replace('{folderId}', folderId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Removes a user's subscription to alert notifications for a specific folder event.
     * @param {string} folderId - The ID of the folder.
     * @param {string} eventId - The ID of the event to unsubscribe from.
     * @param {string} userId - The ID of the user to unsubscribe.
     * @returns {Promise<string>} A promise that resolves with the unsubscription result.
     */
    deleteFolderAlertSubscription(folderId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderAlertsId.replace('{folderId}', folderId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the security members (users and groups) assigned to a folder.
     * @param {object} params - Optional query parameters for filtering.
     * @param {string} folderId - The ID of the folder.
     * @returns {Promise<string>} A promise that resolves with the folder's security members.
     */
    getFolderSecurityMembers(params, folderId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FolderSecurity.replace('{folderId}', folderId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Adds or updates a security member's role on a folder.
     * @param {string} folderId - The ID of the folder.
     * @param {string} memberId - The ID of the user or group.
     * @param {"user"|"group"} memberType - The type of member.
     * @param {string} securityRole - The security role to assign (e.g., `editor`, `viewer`).
     * @param {boolean} cascadeSecurityChanges - Whether to apply the change to all subfolders.
     * @returns {Promise<string>} A promise that resolves with the update result.
     */
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

    /**
     * Removes a security member from a folder.
     * @param {string} folderId - The ID of the folder.
     * @param {string} memberId - The ID of the user or group to remove.
     * @param {boolean} cascadeSecurityChanges - Whether to remove the member from all subfolders.
     * @returns {Promise<string>} A promise that resolves with the deletion result.
     */
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
