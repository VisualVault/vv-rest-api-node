// FormsApi
import common from './common.js';
import FormInstanceManager from './formsApi/formInstanceManager.js';
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

export default FormsApi;
