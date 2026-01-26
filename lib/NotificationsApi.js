// Notifications API
import common from './common.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NotificationsApi {
    constructor(sessionToken, notificationsApiConfig) {
        if(!sessionToken['tokenType'] && sessionToken['tokenType'] != 'jwt'){
            return;
        }

        const yamlConfig = yaml.load(fs.readFileSync(__dirname + '/config.yml', 'utf8'));
        this._httpHelper = new common.httpHelper(sessionToken, yamlConfig);

        this.isEnabled = notificationsApiConfig['isEnabled'] || false;
        this.baseUrl = notificationsApiConfig['apiUrl'] || null;

        if (this.isEnabled) {
            this.users = new UserNotificationsManager(this._httpHelper);
        }
    }
}

class UserNotificationsManager {
    constructor (httpHelper) {
        this._httpHelper = httpHelper;
    }

    async forceUIRefresh(userGuid) {
        const resourceUri = this._httpHelper._config.ResourceUri.NotificationsApi.ForceUIRefresh.replace('{id}', userGuid);
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'POST' };
        const params = {};
        const data = {};
        return this._httpHelper.doVvClientRequest(url, opts, params, data);
    }
}

export default NotificationsApi;
