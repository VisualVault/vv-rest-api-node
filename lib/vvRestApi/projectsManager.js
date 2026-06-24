/**
 * Manages project alert subscription operations via the VVRestApi.
 */
export class ProjectsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Subscribes a user to alerts for a specific project event.
     * @param {string} projectId - The ID (Guid) of the project to subscribe to.
     * @param {string} eventId - The ID (Guid) of the project event to subscribe to.
     * @param {string} userId - The ID (Guid) of the user to subscribe.
     * @returns {Promise<string>} JSON string confirming the alert subscription was created.
     */
    postProjectAlertSubscription(projectId, eventId, userId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ProjectAlertsId.replace('{projectId}', projectId).replace('{eventId}', eventId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        const params = {
            usId: userId
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Removes a user's subscription from alerts for a specific project event.
     * @param {string} projectId - The ID (Guid) of the project to unsubscribe from.
     * @param {string} eventId - The ID (Guid) of the project event to unsubscribe from.
     * @param {string} userId - The ID (Guid) of the user to unsubscribe.
     * @returns {Promise<string>} JSON string confirming the alert subscription was removed.
     */
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
