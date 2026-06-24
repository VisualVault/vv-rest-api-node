/**
 * Manages customer-level operations such as invitations and user assignments.
 */
export class CustomerManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Creates a new customer invitation.
     * @param {object} data - The invitation data to submit in the request body.
     * @param {string} [data.email] - The email address to send the invitation code to. If omitted, the invite code is returned in the response metadata instead.
     * @returns {Promise<string>} The API response containing the created invitation details.
     */
    createCustomerInvite(data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        let url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerInvite;

        url = url.replace(/\/api\/\//g, '/api/');
        url = url.replace(/\/v1\/\//g, '/v1/');

        const opts = { method: 'POST' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }

    /**
     * Assigns a user to a customer.
     * @param {string} customerId - The ID (Guid) of the customer to assign the user to.
     * @param {object} data - The user assignment data to submit in the request body.
     * @param {string} data.userId - The username (authentication user ID) of the user to assign.
     * @param {boolean} [data.allowMultipleCustomers] - Whether to allow the user to belong to multiple customers if already assigned to another.
     * @returns {Promise<string>} The API response confirming the user assignment.
     */
    assignUser(customerId, data) {
        const baseUrl = this._httpHelper._sessionToken.baseUrl;
        const url = baseUrl + "/api/v1/" + this._httpHelper._config.ResourceUri.CustomerAssignUser.replace('{customerId}', customerId);
        const opts = { method: 'PUT' };

        return this._httpHelper.doVvClientRequest(url, opts, '', data);
    }
}

export default CustomerManager;
