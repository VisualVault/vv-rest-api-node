export class ReportsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getReports(params) {
        const resourceUri = this._httpHelper._config.ResourceUri.Reports;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    getReportPDF(reportId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ReportServerPDF.replace('{id}', reportId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ReportsManager;
