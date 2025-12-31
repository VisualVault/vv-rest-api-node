export class SecurityMembersManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

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

    getSecurityMembersForParentId(parentId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SecurityMembers;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        const params = {
            parentId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

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
