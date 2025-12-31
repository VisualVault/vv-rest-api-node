export class GroupsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getGroups(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.GetGroups;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getGroupsUsers(params, groupId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsUsers.replace('{id}', groupId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getGroupUser(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    addUserToGroup(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    removeUserFromGroup(params, groupId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.GroupsAddUser.replace('{groupId}', groupId).replace('{userId}', userId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default GroupsManager;
