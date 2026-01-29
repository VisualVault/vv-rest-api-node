// Objects API
import common from './common.js';
import ModelsManager from './objectsApi/modelsManager.js';
import ObjectsManager from './objectsApi/objectsManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ObjectsApi {
    constructor(sessionToken, objectsApiConfig) {
        if(!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt') {
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = objectsApiConfig['isEnabled'] || false;
        this.baseUrl = objectsApiConfig['apiUrl'] || null;
        this.apiUrl = '';

        if(this.isEnabled) {
            this.models = new ModelsManager(this._httpHelper);
            this.objects = new ObjectsManager(this._httpHelper);
        }
    }
}

export default ObjectsApi;
