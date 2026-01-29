// Studio API
import common from './common.js';
import WorkflowManager from './studioApi/workflowManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StudioApi {
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
        }
    }
}

export default StudioApi;
