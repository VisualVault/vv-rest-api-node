// Studio API
import common from './common.js';
import WorkflowManager from './studioApi/workflowManager.js';
import RolesAndPermissionsManager from './studioApi/rolesAndPermissionsManager.js';
import ScheduledRunsManager from './studioApi/scheduledRunsManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the StudioApi service. Exposes `workflow` and `permissions` managers when the service is enabled.
 * Access via `client.studioApi` after authentication. Check `client.studioApi.isEnabled` before use.
 */
export class StudioApi {
    /** @type {boolean} */ isEnabled;
    /** @type {string|null} */ baseUrl;
    /** @type {WorkflowManager} */ workflow;
    /** @type {RolesAndPermissionsManager} */ permissions;
    /** @internal @type {ScheduledRunsManager} */ scheduledRuns;

    /**
     * @param {object} sessionToken - JWT session token from authentication.
     * @param {object} studioApiConfig - StudioApi configuration object returned by the VV configuration endpoint.
     */
    constructor(sessionToken, studioApiConfig){
        if(!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt'){
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = studioApiConfig['isEnabled'] || false;
        this.baseUrl = studioApiConfig['studioApiUrl'] || null;

        if(this.isEnabled){
            this.workflow = new WorkflowManager(this._httpHelper);
            this.permissions = new RolesAndPermissionsManager(this._httpHelper);
            this.scheduledRuns = new ScheduledRunsManager(this._httpHelper);
        }
    }

    /**
     * Replaces the access token of the StudioApi session with a JWT issued by VVCore.
     * @internal
     * @param {{ token: string, expires: string }} jwt - The `data` of a VVCore `users/getjwt` response.
     * @returns {void}
     * @throws {Error} The JWT expires within 30 seconds.
     */
    useJwt(jwt) {
        if (new Date(jwt.expires) < new Date(Date.now() + 30 * 1000)) {
            throw new Error('Cannot use the JWT for StudioApi: it expires within 30 seconds');
        }
        this._httpHelper._sessionToken.convertToJwt(jwt);
    }
}

export default StudioApi;
