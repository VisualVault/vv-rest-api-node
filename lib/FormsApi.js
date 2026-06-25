// FormsApi
import common from './common.js';
import FormInstanceManager from './formsApi/formInstanceManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the FormsApi service. Exposes the `formInstances` manager when the service is enabled.
 * Access via `client.formsApi` after authentication. Check `client.formsApi.isEnabled` before use.
 */
export class FormsApi {
    /** @type {boolean} */ isEnabled;
    /** @type {string|null} */ baseUrl;
    /** @type {FormInstanceManager} */ formInstances;

    /**
     * @param {object} sessionToken - JWT session token from authentication.
     * @param {object} formsApiConfig - FormsApi configuration object returned by the VV configuration endpoint.
     */
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
