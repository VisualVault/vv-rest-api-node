export class ProjectsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    postProjectAlertSubscription(projectId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ProjectAlertsId.replace('{projectId}', projectId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    deleteProjectAlertSubscription(projectId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ProjectAlertsId.replace('{projectId}', projectId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ProjectsManager;
