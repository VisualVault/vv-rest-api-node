/**
 * Manager class for Sites operations.
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
export class SitesManager {
    /**
     * @param {object} httpHelper - HTTP helper instance
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves all sites.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @returns {Promise<string>} A promise that resolves with the list of sites.
     */
    getSites(params) {
        const url = this._httpHelper.getUrl(this._httpHelper._config.ResourceUri.Sites);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Site properties to create.
     * @returns {Promise<string>} A promise that resolves with the created site.
     */
    postSites(params, data) {
        const resourceUri = this._httpHelper._config.ResourceUri.Sites;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates an existing site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Site properties to update.
     * @param {string} siteId - The ID of the site to update.
     * @returns {Promise<string>} A promise that resolves with the updated site.
     */
    putSites(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SiteById.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Retrieves all groups belonging to a site.
     * @param {object} params - Optional query parameters for filtering and pagination.
     * @param {string} siteId - The ID of the site.
     * @returns {Promise<string>} A promise that resolves with the site's groups.
     */
    getGroups(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Groups.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new group within a site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Group properties to create.
     * @param {string} siteId - The ID of the site to create the group in.
     * @returns {Promise<string>} A promise that resolves with the created group.
     */
    postGroups(params, data, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.Groups.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Updates a group within a site.
     * @param {object} params - Optional query parameters.
     * @param {object} data - Group properties to update.
     * @param {string} siteId - The ID of the site the group belongs to.
     * @param {string} grId - The ID of the group to update.
     * @returns {Promise<string>} A promise that resolves with the updated group.
     */
    putGroups(params, data, siteId, grId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SiteGroupById
            .replace('{siteId}', siteId)
            .replace('{groupId}', grId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Moves a user to a different site.
     * @param {string} userId - The ID of the user to move.
     * @param {string} newSiteId - The ID of the destination site.
     * @returns {Promise<string>} A promise that resolves with the result of the site change.
     */
    changeUserSite(userId, newSiteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ChangeUserSite;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        const data = {
            UserId: userId,
            NewSiteId: newSiteId
        };

        return this._httpHelper.doVvClientRequest(url, opts, null, data);
    }

    /**
     * Retrieves a specific site by its ID.
     * @param {object} params - Optional query parameters.
     * @param {string} siteId - The ID of the site to retrieve.
     * @returns {Promise<string>} A promise that resolves with the site.
     */
    getSiteById(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SiteById.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Deletes a site.
     * @param {object} params - Optional query parameters.
     * @param {string} siteId - The ID of the site to delete.
     * @returns {Promise<string>} A promise that resolves with the deletion result.
     */
    deleteSite(params, siteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.SiteById.replace('{id}', siteId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Moves a group to a different site.
     * @param {object} params - Optional query parameters.
     * @param {string} groupId - The ID of the group to move.
     * @param {string} newSiteId - The ID of the destination site.
     * @returns {Promise<string>} A promise that resolves with the result of the site change.
     */
    changeGroupSite(params, groupId, newSiteId) {
        const resourceUri = this._httpHelper._config.ResourceUri.ChangeGroupSite;
        const data = {
            groupId,
            newSiteId
        };
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default SitesManager;
