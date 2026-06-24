/**
 * Manages dropdown list operations via the VVRestApi.
 */
export class DropdownListsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves all dropdown lists.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of dropdown lists.
     */
    getDropDownLists(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownLists;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves a specific dropdown list by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} listId - The ID (Guid) of the dropdown list to retrieve.
     * @returns {Promise<string>} JSON string containing the dropdown list details.
     */
    getDropDownListById(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsId.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Retrieves the items of a specific dropdown list by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} listId - The ID (Guid) of the dropdown list whose items to retrieve.
     * @returns {Promise<string>} JSON string containing the dropdown list items.
     */
    getDropDownListItemsById(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsIdItems.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Creates a new dropdown list with the specified items.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} ddName - The name of the new dropdown list.
     * @param {string} ddDescription - The description of the new dropdown list.
     * @param {object[]} ddItems - The items to include in the new dropdown list.
     * @returns {Promise<string>} JSON string containing the created dropdown list details.
     */
    addDropDownList(params, ddName, ddDescription, ddItems) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownLists;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {
            Name: ddName,
            Description: ddDescription,
            Items: ddItems
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes a dropdown list by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} listId - The ID (Guid) of the dropdown list to delete.
     * @returns {Promise<string>} JSON string confirming the dropdown list was deleted.
     */
    deleteDropDownList(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsId.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Updates an existing dropdown list by its ID.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} listId - The ID (Guid) of the dropdown list to update.
     * @param {string} ddName - The updated name for the dropdown list.
     * @param {string} ddDescription - The updated description for the dropdown list.
     * @param {object[]} items - The updated items for the dropdown list.
     * @returns {Promise<string>} JSON string confirming the dropdown list was updated.
     */
    updateDropDownList(params, listId, ddName, ddDescription, items) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsId.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        const data = {
            Name: ddName,
            Description: ddDescription,
            Items: items
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Deletes one or more items from a dropdown list.
     * @param {object} params - URL parameters to include in the request.
     * @param {string} listId - The ID (Guid) of the dropdown list containing the items to delete.
     * @param {string[]} itemIds - Array of item IDs to delete from the dropdown list.
     * @returns {Promise<string>} JSON string confirming the items were deleted.
     */
    deleteDropDownListItem(params, listId, itemIds) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsIdItems.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };
        const mergedParams = { ...params, itemIds };

        return this._httpHelper.doVvClientRequest(url, opts, mergedParams, null);
    }
}

export default DropdownListsManager;
