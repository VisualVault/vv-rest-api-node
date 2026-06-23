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
     * @returns {Promise<string>} The API response containing the list of folders.
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
     * @param {string} [data.name] - Folder name; if omitted, derived from the last segment of folderPath.
     * @param {string} [data.description] - Folder description.
     * @param {boolean} [data.allowRevisions] - Whether documents in this folder allow revisions.
     * @param {string} [data.formUploadControlId] - Guid of the form upload control to associate.
     * @param {string} [data.formId] - Guid of the form to associate with the folder.
     * @param {boolean} [data.inheritNamingConvention] - Whether to inherit the naming convention from the parent folder.
     * @param {boolean} [data.inheritRecordRetention] - Whether to inherit record retention settings from the parent folder.
     * @param {string} [data.defaultDocType] - Default document type for the folder.
     * @param {boolean} [data.docTypeRequired] - Whether a document type is required when uploading.
     * @param {string} folderPath - The full path where the folder should be created.
     * @returns {Promise<string>} The API response containing the created folder.
     */
    postFolderByPath(params, data, folderPath) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Folders);

        // @ts-ignore - folderpath is injected from the folderPath argument
        data.folderpath = folderPath;
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a folder's properties.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Folder properties to update.
     * @param {string} [data.name] - New folder name.
     * @param {string} [data.description] - New folder description.
     * @param {string} [data.defaultDocType] - Default document type for the folder.
     * @param {boolean} [data.docTypeRequired] - Whether a document type is required when uploading.
     * @param {string} folderId - The ID of the folder to update.
     * @returns {Promise<string>} The API response containing the updated folder.
     */
    putFolder(params, data, folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes a folder.
     * @param {string} folderId - The ID of the folder to delete.
     * @returns {Promise<string>} The API response confirming the deletion.
     */
    deleteFolder(folderId) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersId.replace('{id}', folderId));
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, null, null);
    }

    /**
     * Copies a folder to a new location.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Copy options.
     * @param {string} [data.sourceFolderId] - Guid of the folder to copy; use instead of sourceFolderPath.
     * @param {string} [data.sourceFolderPath] - Full path of the folder to copy; use instead of sourceFolderId.
     * @param {string} [data.targetFolderId] - Guid of the destination folder; use instead of targetFolderPath.
     * @param {string} [data.targetFolderPath] - Full path of the destination folder; use instead of targetFolderId.
     * @returns {Promise<string>} The API response confirming the copy operation.
     */
    copyFolder(params, data) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.FoldersCopy);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Moves a folder to a new location.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Move options.
     * @param {string} [data.sourceFolderId] - Guid of the folder to move; use instead of sourceFolderPath.
     * @param {string} [data.sourceFolderPath] - Full path of the folder to move; use instead of sourceFolderId.
     * @param {string} [data.targetFolderId] - Guid of the destination folder; use instead of targetFolderPath.
     * @param {string} [data.targetFolderPath] - Full path of the destination folder; use instead of targetFolderId.
     * @returns {Promise<string>} The API response confirming the move operation.
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
     * @returns {Promise<string>} The API response containing the folder's documents.
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
     * @returns {Promise<string>} The API response containing the folder.
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
     * @returns {Promise<string>} The API response confirming the update.
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
     * @returns {Promise<string>} The API response containing the folder's index fields.
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
     * @returns {Promise<string>} The API response confirming the subscription.
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
     * @returns {Promise<string>} The API response confirming the unsubscription.
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
     * @returns {Promise<string>} The API response containing the folder's security members.
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
     * @returns {Promise<string>} The API response confirming the update.
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
     * @returns {Promise<string>} The API response confirming the deletion.
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
