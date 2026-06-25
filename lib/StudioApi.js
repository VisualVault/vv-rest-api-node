// Studio API
import common from './common.js';
import WorkflowManager from './studioApi/workflowManager.js';
import RolesAndPermissionsManager from './studioApi/rolesAndPermissionsManager.js';
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
        }
    }
}

export default StudioApi;
