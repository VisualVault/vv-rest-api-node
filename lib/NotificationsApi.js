// Notifications API
import common from './common.js';
import UserNotificationsManager from './notificationsApi/userNotificationsManager.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Entry point for the NotificationsApi service. Exposes the `users` manager when the service is enabled.
 * Access via `client.notificationsApi` after authentication. Check `client.notificationsApi.isEnabled` before use.
 */
export class NotificationsApi {
    /** @type {boolean} */ isEnabled;
    /** @type {string|null} */ baseUrl;
    /** @type {UserNotificationsManager} */ users;

    /**
     * @param {object} sessionToken - JWT session token from authentication.
     * @param {object} notificationsApiConfig - NotificationsApi configuration object returned by the VV configuration endpoint.
     */
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

export default NotificationsApi;
