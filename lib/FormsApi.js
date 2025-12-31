// FormsApi
import common from './common.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FormsApi {
    constructor(sessionToken, formsApiConfig) {
        if (!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt') {
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = formsApiConfig['isEnabled'] || false;
        this.baseUrl = formsApiConfig['formsApiUrl'] || null;

        if (this.isEnabled) {
            this.formInstances = new FormInstanceManager(this._httpHelper);
        }
    }
}

class FormInstanceManager {
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    async postForm(params, data, formTemplateRevisionId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormsApi.FormInstance;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };

        data['formTemplateId'] = formTemplateRevisionId || data['formTemplateId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    async postFormRevision(params, data, formTemplateRevisionId, formId) {
        const resourceUri = this._httpHelper._config.ResourceUri.FormsApi.FormInstance;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'PUT' };

        // only add these if provided. params could already have the value
        data['formTemplateId'] = formTemplateRevisionId || data['formTemplateId'];
        data['formId'] = formId || data['formId'];

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default FormsApi;
