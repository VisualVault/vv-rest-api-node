import common from './common.js';
import LoginEventsManager from './utilizationApi/loginEventsManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the Utilization service.
 *
 * Exposes the `loginEvents` manager when the service is enabled. Reached as `client.utilization` after
 * authentication, which is `null` when the Database has no Utilization service.
 */
export class UtilizationApi {
    /** @type {boolean} */ isEnabled;
    /** @type {string|null} */ baseUrl;
    /** @type {LoginEventsManager} */ loginEvents;

    /**
     * @param {object} sessionToken - JWT session token from authentication.
     * @param {object} utilizationApiConfig - Utilization configuration.
     * @param {boolean} [utilizationApiConfig.isEnabled] - Whether the Utilization service is available. The
     *   `loginEvents` manager is created only when this is true.
     * @param {string} [utilizationApiConfig.utilizationApiUrl] - The Utilization service host.
     */
    constructor(sessionToken, utilizationApiConfig) {
        if (!sessionToken['tokenType'] || sessionToken['tokenType'] !== 'jwt') {
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = utilizationApiConfig['isEnabled'] || false;
        this.baseUrl = utilizationApiConfig['utilizationApiUrl'] || null;

        if (this.isEnabled) {
            this.loginEvents = new LoginEventsManager(this._httpHelper);
        }
    }
}

export default UtilizationApi;
