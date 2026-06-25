// Objects API
import common from './common.js';
import ModelManager from './objectsApi/modelManager.js';
import ObjectManager from './objectsApi/objectManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the ObjectsApi service. Exposes `models` and `objects` managers when the service is enabled.
 * Access via `client.objectsApi` after authentication. Check `client.objectsApi.isEnabled` before use.
 */
export class ObjectsApi {
    /** @type {boolean} */ isEnabled;
    /** @type {string|null} */ baseUrl;
    /** @type {ModelManager} */ models;
    /** @type {ObjectManager} */ objects;

    /**
     * @param {object} sessionToken - JWT session token from authentication.
     * @param {object} objectsApiConfig - ObjectsApi configuration object returned by the VV configuration endpoint.
     */
    constructor(sessionToken, objectsApiConfig) {
        if(!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt') {
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = objectsApiConfig['isEnabled'] || false;
        this.baseUrl = objectsApiConfig['apiUrl'] || null;

        if(this.isEnabled) {
            this.models = new ModelManager(this._httpHelper);
            this.objects = new ObjectManager(this._httpHelper);
        }
    }
}

export default ObjectsApi;
