/**
 * Manages group operations via the VVRestApi.
 */
export class GroupsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a list of groups.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of groups.
     */
    getGroups(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.GetGroups;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific group by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to retrieve.
     * @returns {Promise<string>} JSON string containing the group details.
     */
    getGroupById(params, groupId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupById.replace('{id}', groupId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new group.
     * @param {object} params - URL parameters to include in the request.
     * @param {object} formData - The group data to submit in the request body.
     * @returns {Promise<string>} JSON string containing the created group details.
     */
    addGroup(params, formData) {
        const resourceUri = this._httpHelper._config.ResourceUri.AddGroup;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, formData);
    }

    /**
     * Updates an existing group by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to update.
     * @param {object} formData - The updated group data to submit in the request body.
     * @returns {Promise<string>} JSON string confirming the group was updated.
     */
    updateGroup(params, groupId, formData) {
        const resourceUri = this._httpHelper._config.ResourceUri.UpdateGroup.replace('{id}', groupId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, formData);
    }

    /**
     * Deletes a group by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to delete.
     * @returns {Promise<string>} JSON string confirming the group was deleted.
     */
    deleteGroup(params, groupId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DeleteGroup.replace('{id}', groupId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves all users belonging to a specific group.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group whose users to retrieve.
     * @returns {Promise<string>} JSON string containing the list of users in the group.
     */
    getGroupsUsers(params, groupId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsUsers.replace('{id}', groupId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific user within a group.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to look up the user in.
     * @param {string} userId - The ID (Guid) of the user to retrieve.
     * @returns {Promise<string>} JSON string containing the user's membership details within the group.
     */
    getGroupUser(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Adds a user to a group.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to add the user to.
     * @param {string} userId - The ID (Guid) of the user to add to the group.
     * @returns {Promise<string>} JSON string confirming the user was added to the group.
     */
    addUserToGroup(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Removes a user from a group.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} groupId - The ID (Guid) of the group to remove the user from.
     * @param {string} userId - The ID (Guid) of the user to remove from the group.
     * @returns {Promise<string>} JSON string confirming the user was removed from the group.
     */
    removeUserFromGroup(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default GroupsManager;
