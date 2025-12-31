// Studio API
import common from './common.js';
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
        this.apiUrl = '';

        if(this.isEnabled){
            this.workflow = new WorkflowManager(this._httpHelper);
        }
    }
}

class WorkflowManager{
    constructor(httpHelper){
        this._httpHelper = httpHelper;
    }

    async getWorkflow(workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowLatestPublishedId.replace('{id}', workflowId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    async getWorkflowByName(workflowName){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowLatestPublished;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = { name: workflowName };

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    async getWorkflowVariables(params, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowVariables.replace('{id}', workflowId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        params = params || {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Triggers workflow
     * @param {string} workflowId
     * @param {number} workflowRevision
     * @param {string} objectId
     * @param {object[]} workflowVariables - workflow values to be submitted to the workflow
     * * @param {string} workflowVariables[].name = name of variable
     * * @param {*} workflowVariables[].value - value to be passed
     * * @param {number} workflowVariables[].dataType - Text: 1, Number: 2, Date: 3, Boolean: 4
     */
    async triggerWorkflow(workflowId, workflowRevision, objectId, workflowVariables){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowRun.replace('{id}', workflowId).replace('{revision}', workflowRevision);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {
            objectId,
            reference: 'API',
            data: {
                workflowVariables,
                dataSetVariables: []
            }
        };
        const params = {};

        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Terminates the workflow instance
     * @param {string} workflowId
     * @param {string} instanceId
     * @returns
     */
    async terminateWorkflow(workflowId, instanceId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowTerminate.replace('{workflowId}', workflowId).replace('{instanceId}', instanceId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
         * Returns workflow history for an object under the provided workflow
         * @param {string} workflowId
         * @param {string} objectId
         * @returns
         */
    async GetWorkflowHistoryForObject(objectId, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowHistoryObject.replace('{workflowId}', workflowId).replace('{objectId}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }

    /**
     * Returns the running workflow, if any, for an object under the provided workflow
     * @param {string} workflowId
     * @param {string} objectId
     * @returns
     */
    async GetRunningWorkflowForObject(objectId, workflowId){
        const resourceUri = this._httpHelper._config.ResourceUri.StudioApi.WorkflowHistoryRunningObject.replace('{workflowId}', workflowId).replace('{objectId}', objectId);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const data = {};
        const params = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default StudioApi;
