export class DropdownListsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getDropDownLists(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownLists;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getDropDownListById(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsId.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getDropDownListItemsById(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsIdItems.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

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

    deleteDropDownList(params, listId) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsId.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    updateDropDownList(params, listId, ddName, ddDescription, items) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownLists + '/' + listId;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };
        const data = {
            Name: ddName,
            Description: ddDescription,
            Items: items
        };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    deleteDropDownListItem(params, listId, itemIds) {
        const resourceUri = this._httpHelper._config.ResourceUri.DropDownListsIdItems.replace('{id}', listId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'DELETE' };
        const mergedParams = { ...params, itemIds };

        return this._httpHelper.doVvClientRequest(url, opts, mergedParams, null);
    }
}

export default DropdownListsManager;
