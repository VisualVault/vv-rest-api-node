/**
 * Manages security member operations via the VVRestApi.
 */
export class SecurityMembersManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Adds a user or group as a security member to a parent resource.
     * @param {string} parentId - The ID (Guid) of the parent resource to add the member to.
     * @param {string} memberId - The ID (Guid) of the user or group to add as a member.
     * @param {string} roleType - The role to assign to the member on the parent resource.
     * @param {boolean} isGroup - Whether the member being added is a group.
     * @returns {Promise<string>} JSON string containing the created security member details.
     */
    addSecurityMember(parentId, memberId, roleType, isGroup) {
        const resourceUri = this._httpHelper._config.ResourceUri.SecurityMembers;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const postData = {
            parentId,
            memberId,
            role: roleType,
            isGroup
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, postData);
    }

    /**
     * Retrieves all security members associated with a parent resource.
     * @param {string} parentId - The ID (Guid) of the parent resource whose members to retrieve.
     * @returns {Promise<string>} JSON string containing the list of security members.
     */
    getSecurityMembersForParentId(parentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SecurityMembers;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        const params = {
            parentId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Removes a security member from a parent resource.
     * @param {string} parentId - The ID (Guid) of the parent resource to remove the member from.
     * @param {string} memberId - The ID (Guid) of the user or group to remove.
     * @returns {Promise<string>} JSON string confirming the security member was removed.
     */
    removeSecurityMember(parentId, memberId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SecurityMembers;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            parentId,
            memberId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Updates the role of an existing security member on a parent resource.
     * @param {string} parentId - The ID (Guid) of the parent resource containing the member.
     * @param {string} memberId - The ID (Guid) of the user or group whose role to update.
     * @param {string} roleType - The new role to assign to the member.
     * @returns {Promise<string>} JSON string confirming the security member role was updated.
     */
    updateSecurityMember(parentId, memberId, roleType) {
        const resourceUri = this._httpHelper._config.ResourceUri.SecurityMembers;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const postData = {
            parentId,
            memberId,
            role: roleType
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, postData);
    }
}

export default SecurityMembersManager;
