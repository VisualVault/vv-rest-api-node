// DocApi
import common from './common.js';
import { DocumentManager } from './docApi/documentManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocApi {
    constructor(sessionToken, docApiConfig) {
        if (!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt') {
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = docApiConfig['isEnabled'] || false;
        this.baseUrl = docApiConfig['apiUrl'] || null;
        this.roleSecurity = docApiConfig['roleSecurity'] || false;

        if (this.isEnabled) {
            this.documents = new DocumentManager(this._httpHelper);
        }
    }
}

export default DocApi;
