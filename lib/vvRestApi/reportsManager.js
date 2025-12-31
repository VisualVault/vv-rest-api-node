export class ReportsManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    getReportPDF(reportId, params) {
        const resourceUri = this._httpHelper._config.ResourceUri.ReportServerPDF.replace('{id}', reportId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GETSTREAM' };

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }
}

export default ReportsManager;
