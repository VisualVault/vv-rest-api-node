/**
 * Manages report retrieval operations via the VVRestApi.
 */
export class ReportsManager {
    /**
     * @param {object} httpHelper - The HTTP helper instance used to make API requests.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves a list of available reports.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<string>} JSON string containing the list of reports.
     */
    getReports(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.Reports;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Downloads a report as a PDF by its ID.
     * @param {string} reportId - The ID (Guid) of the report to download.
     * @param {object} params - URL parameters to include in the request.
     * @returns {Promise<Buffer>} The API response containing the raw PDF file bytes.
     */
    getReportPDF(reportId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ReportServerPDF.replace('{id}', reportId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ReportsManager;
