import DocApi from './DocApi.js';
import FormsApi from './FormsApi.js';
import ObjectsApi from './ObjectsApi.js';
import StudioApi from './StudioApi.js';
import UtilizationApi from './UtilizationApi.js';
import NotificationsApi from './NotificationsApi.js';
import common from './common.js';
import { CompletionTarget } from './constants.js';
import yaml from 'js-yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import createDebug from 'debug';

const debug = createDebug('visualvault:api');

// Import all managers from vvRestApi directory
import { Constants } from './vvRestApi/constants.js';
import { ConfigurationManager } from './vvRestApi/configurationManager.js';
import { EmailManager } from './vvRestApi/emailManager.js';
import { FormsManager, ReturnField, FormFieldCollection } from './vvRestApi/formsManager.js';
import { GroupsManager } from './vvRestApi/groupsManager.js';
import { LibraryManager } from './vvRestApi/libraryManager.js';
import { SitesManager } from './vvRestApi/sitesManager.js';
import { UsersManager } from './vvRestApi/usersManager.js';
import { CurrentUserManager } from './vvRestApi/currentUserManager.js';
import { ScheduledProcessManager } from './vvRestApi/scheduledProcessManager.js';
import { CustomQueryManager } from './vvRestApi/customQueryManager.js';
import { CustomerManager } from './vvRestApi/customerManager.js';
import { CustomerDatabaseManager } from './vvRestApi/customerDatabaseManager.js';
import { FilesManager } from './vvRestApi/filesManager.js';
import { ScriptsManager } from './vvRestApi/scriptsManager.js';
import { DocumentsManager } from './vvRestApi/documentsManager.js';
import { ProjectsManager } from './vvRestApi/projectsManager.js';
import { IndexFieldsManager } from './vvRestApi/indexFieldsManager.js';
import { OutsideProcessesManager } from './vvRestApi/outsideProcessesManager.js';
import { SecurityMembersManager } from './vvRestApi/securityMembersManager.js';
import { LayoutsManager } from './vvRestApi/layoutsManager.js';
import { ReportsManager } from './vvRestApi/reportsManager.js';
import { LanguageResourcesManager } from './vvRestApi/languageResourcesManager.js';
import { DropdownListsManager } from './vvRestApi/dropdownListsManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main VisualVault API client providing access to all API managers.
 */
export class VVClient {
    /** @type {Constants} */ constants;
    /** @type {ConfigurationManager} */ configuration;
    /** @type {CustomQueryManager} */ customQuery;
    /** @type {DocumentsManager} */ documents;
    /** @type {EmailManager} */ email;
    /** @type {FilesManager} */ files;
    /** @type {FormsManager} */ forms;
    /** @type {GroupsManager} */ groups;
    /** @type {LibraryManager} */ library;
    /** @type {SitesManager} */ sites;
    /** @type {UsersManager} */ users;
    /** @type {ScheduledProcessManager} */ scheduledProcess;
    /** @type {ScriptsManager} */ scripts;
    /** @type {ProjectsManager} */ projects;
    /** @type {CustomerManager} */ customer;
    /** @type {CustomerDatabaseManager} */ customerDatabase;
    /** @type {IndexFieldsManager} */ indexFields;
    /** @type {OutsideProcessesManager} */ outsideProcesses;
    /** @type {SecurityMembersManager} */ securityMembers;
    /** @type {LayoutsManager} */ layouts;
    /** @type {ReportsManager} */ reports;
    /** @type {LanguageResourcesManager} */ languageResources;
    /** @type {DropdownListsManager} */ dropdownLists;

    /**
     * @param {*} sessionToken - Session token from authentication
     */
    constructor(sessionToken) {
        this.yamlConfig = yaml.load(fs.readFileSync(path.join(__dirname, 'config.yml'), 'utf8'));

        this._httpHelper = new common.httpHelper(sessionToken, this.yamlConfig);
        this.constants = new Constants();
        this.configuration = new ConfigurationManager(this._httpHelper);

        this.customQuery = new CustomQueryManager(this._httpHelper);
        this.documents = new DocumentsManager(this._httpHelper);
        this.email = new EmailManager(this._httpHelper);
        this.files = new FilesManager(this._httpHelper);
        this.forms = new FormsManager(this._httpHelper);
        this.groups = new GroupsManager(this._httpHelper);
        this.library = new LibraryManager(this._httpHelper);
        this.sites = new SitesManager(this._httpHelper);
        this.users = new UsersManager(this._httpHelper);
        this.currentUser = new CurrentUserManager(this._httpHelper);
        /** @private @type {import('./vvRestApi/scheduledProcessManager.js').CompletionPoster|null} */
        this.__postCompletionToTarget = null;
        this.scheduledProcess = new ScheduledProcessManager(this._httpHelper, () => this.__postCompletionToTarget);
        this.scripts = new ScriptsManager(this._httpHelper);
        this.projects = new ProjectsManager(this._httpHelper);
        this.customer = new CustomerManager(this._httpHelper);
        this.customerDatabase = new CustomerDatabaseManager(this._httpHelper);
        this.indexFields = new IndexFieldsManager(this._httpHelper);
        this.outsideProcesses = new OutsideProcessesManager(this._httpHelper);
        this.securityMembers = new SecurityMembersManager(this._httpHelper);
        this.layouts = new LayoutsManager(this._httpHelper);
        this.reports = new ReportsManager(this._httpHelper);
        this.languageResources = new LanguageResourcesManager(this._httpHelper, sessionToken.baseUrl);
        this.dropdownLists = new DropdownListsManager(this._httpHelper);

        // Extended API modules - null when not enabled/configured
        this.docApi = null;
        this.formsApi = null;
        this.objectsApi = null;
        this.studioApi = null;
        this.notificationsApi = null;
        /** @type {UtilizationApi|null} */
        this.utilization = null;
    }

    /**
     * Discovers the Utilization service and builds `utilization` against the host it reports.
     *
     * The configuration reports a populated `data` even where no Utilization service exists, so the gate reads
     * `isEnabled` and `utilizationApiUrl`. `utilization` stays `null` when either is missing, or when the session
     * cannot be put on a JWT, so a caller never holds a module without a usable token.
     * @param {object} sessionToken - Session token copied for the Utilization session; not mutated.
     * @returns {Promise<void>}
     */
    async createUtilizationApi(sessionToken) {
        let utilizationApiConfig;
        try {
            utilizationApiConfig = JSON.parse(await this.configuration.getUtilizationApiConfig())['data'];
        } catch (error) {
            // A VVCore predating this route answers 404; the `create*Api` calls share one `Promise.all`, so a throw
            // here leaves a sibling module unassigned on a client the caller still receives.
            debug('Utilization is unavailable: discovery failed with %s', error.message);
            return;
        }

        if (!utilizationApiConfig || !utilizationApiConfig['isEnabled'] || !utilizationApiConfig['utilizationApiUrl']) {
            return;
        }

        const utilizationSession = sessionToken.createCopy();
        utilizationSession.baseUrl = utilizationApiConfig['utilizationApiUrl'];
        utilizationSession.apiUrl = '';

        if (utilizationSession['tokenType'] !== 'jwt') {
            if (!this.users) {
                return;
            }

            const jwtResponse = JSON.parse(await this.users.getUserJwt(utilizationSession.audience));
            if (!jwtResponse['data'] || !jwtResponse['data']['token']) {
                debug('Utilization is unavailable: VVCore issued no JWT');
                return;
            }
            utilizationSession.convertToJwt(jwtResponse['data']);
        }

        this.utilization = new UtilizationApi(utilizationSession, utilizationApiConfig);
    }

    async createDocApi(sessionToken) {
        const docApiConfigResponse = JSON.parse(await this.configuration.getDocApiConfig());

        if (docApiConfigResponse && docApiConfigResponse['data']) {
            const docApiSession = sessionToken.createCopy();
            docApiSession.baseUrl = docApiConfigResponse.data['apiUrl'];
            docApiSession.apiUrl = this.yamlConfig.DocApiUri;
            if (docApiSession['tokenType'] == 'jwt') {
                this.docApi = new DocApi(docApiSession, docApiConfigResponse.data);
            } else if (this.users) {
                const jwtResponse = JSON.parse(await this.users.getUserJwt(docApiSession.audience));

                if (jwtResponse['data'] && jwtResponse['data']['token']) {
                    docApiSession.convertToJwt(jwtResponse['data']);
                    this.docApi = new DocApi(docApiSession, docApiConfigResponse.data);
                }
            }
        }
    }

    async createFormsApi(sessionToken) {
        const formsApiConfigResponse = JSON.parse(await this.configuration.getFormsApiConfig());

        if (formsApiConfigResponse && formsApiConfigResponse['data']) {
            const formsApiSession = sessionToken.createCopy();
            formsApiSession.baseUrl = formsApiConfigResponse.data['formsApiUrl'];
            formsApiSession.apiUrl = this.yamlConfig.FormsApiUri;
            if (formsApiSession['tokenType'] == 'jwt') {
                this.formsApi = new FormsApi(formsApiSession, formsApiConfigResponse.data);
            } else if (this.users) {
                const jwtResponse = JSON.parse(await this.users.getUserJwt(formsApiSession.audience));

                if (jwtResponse['data'] && jwtResponse['data']['token']) {
                    formsApiSession.convertToJwt(jwtResponse['data']);
                    this.formsApi = new FormsApi(formsApiSession, formsApiConfigResponse.data);
                }
            }
        }
    }

    async createObjectsApi(sessionToken) {
        const objectsApiConfigResponse = JSON.parse(await this.configuration.getObjectsApiConfig());

        if (objectsApiConfigResponse && objectsApiConfigResponse['data']) {
            const objectsApiSession = sessionToken.createCopy();
            objectsApiSession.baseUrl = objectsApiConfigResponse.data['apiUrl'];
            objectsApiSession.apiUrl = '';
            if (objectsApiSession['tokenType'] == 'jwt') {
                this.objectsApi = new ObjectsApi(objectsApiSession, objectsApiConfigResponse.data);
            } else if (this.users) {
                const jwtResponse = JSON.parse(await this.users.getUserJwt(objectsApiSession.audience));

                if (jwtResponse['data'] && jwtResponse['data']['token']) {
                    objectsApiSession.convertToJwt(jwtResponse['data']);
                    this.objectsApi = new ObjectsApi(objectsApiSession, objectsApiConfigResponse.data);
                }
            }
        }
    }

    async createStudioApi(sessionToken) {
        const studioApiConfigResponse = JSON.parse(await this.configuration.getStudioApiConfig());

        if (studioApiConfigResponse && studioApiConfigResponse['data']) {
            const studioApiSession = sessionToken.createCopy();
            studioApiSession.baseUrl = studioApiConfigResponse.data['studioApiUrl'];
            studioApiSession.apiUrl = '';
            if (studioApiSession['tokenType'] == 'jwt') {
                this.studioApi = new StudioApi(studioApiSession, studioApiConfigResponse.data);
            } else if (this.users) {
                const jwtResponse = JSON.parse(await this.users.getUserJwt(studioApiSession.audience));

                if (jwtResponse['data'] && jwtResponse['data']['token']) {
                    studioApiSession.convertToJwt(jwtResponse['data']);
                    this.studioApi = new StudioApi(studioApiSession, studioApiConfigResponse.data);
                }
            }
        }
    }

    async createNotificationsApi(sessionToken) {
        const notificationsApiConfigResponse = JSON.parse(await this.configuration.getNotificationsApiConfig());

        if (notificationsApiConfigResponse && notificationsApiConfigResponse['data']) {
            const notificationsApiSession = sessionToken.createCopy();
            notificationsApiSession.baseUrl = notificationsApiConfigResponse.data['apiUrl'];
            notificationsApiSession.apiUrl = this.yamlConfig.NotificationsApiUri;
            if (notificationsApiSession['tokenType'] == 'jwt') {
                this.notificationsApi = new NotificationsApi(notificationsApiSession, notificationsApiConfigResponse.data);
            } else if (this.users) {
                const jwtResponse = JSON.parse(await this.users.getUserJwt(notificationsApiSession.audience));

                if (jwtResponse['data'] && jwtResponse['data']['token']) {
                    notificationsApiSession.convertToJwt(jwtResponse['data']);
                    this.notificationsApi = new NotificationsApi(notificationsApiSession, notificationsApiConfigResponse.data);
                }
            }
        }
    }

    async _convertToJwt(sessionToken) {
        sessionToken.convertToJwt(await this.__getUserJwt(sessionToken.audience));
    }

    /**
     * Gets a JWT for the script user from VVCore.
     * @private
     * @param {string} audience
     * @returns {Promise<{ token: string, expires: string }>} The `data` of the VVCore `users/getjwt` response.
     * @throws {Error} The response has no `data.token`.
     */
    async __getUserJwt(audience) {
        const jwtResponse = JSON.parse(await this.users.getUserJwt(audience));
        if (jwtResponse['data'] && jwtResponse['data']['token']) {
            return jwtResponse['data'];
        }
        throw new Error('Failed to get JWT: API response missing data.token property');
    }

    /**
     * Sets where `scheduledProcess.postCompletion` sends the Completion of the current scheduled Run.
     *
     * Call it after authentication. With `studioapi`, Completions go to StudioApi with a fresh JWT for the script
     * user, and never to VVCore. Any other value, or no value, keeps the VVCore route.
     * @param {string|null} [target] - The completion target selector: `CompletionTarget.StudioApi` (`studioapi`),
     *   or `null` for VVCore.
     * @returns {void}
     */
    setCompletionTarget(target) {
        if (target === CompletionTarget.StudioApi) {
            this.__postCompletionToTarget = (runToken, action, result, message) =>
                this.__postCompletionToStudioApi(runToken, action, result, message);
            return;
        }

        if (target !== null && target !== undefined && target !== '') {
            debug('Unknown completion target "%s"; Completions go to VVCore', target);
        }
        this.__postCompletionToTarget = null;
    }

    /**
     * Posts a Completion to StudioApi with a fresh JWT from VVCore, and logs any failure before the request.
     * @private
     * @param {string} runToken
     * @param {string} action
     * @param {boolean|string} result
     * @param {string} [message]
     * @returns {Promise<string>} JSON string from StudioApi.
     * @throws {Error} The client has no enabled StudioApi, VVCore gives no JWT valid for more than 30 seconds, or the
     *   StudioApi request fails.
     */
    async __postCompletionToStudioApi(runToken, action, result, message) {
        try {
            if (!this.studioApi?.isEnabled) {
                throw new Error('Cannot post the Completion: the completion target is studioapi, but StudioApi is not available on this client');
            }
            // Gets the JWT from VVCore: the StudioApi host has no token endpoint, so its session cannot refresh itself.
            this.studioApi.useJwt(await this.__getUserJwt(this._httpHelper._sessionToken.audience));
        } catch (error) {
            debug('postCompletion to StudioApi failed for Run token %s: %s', runToken, error.message);
            throw error;
        }

        return this.studioApi.scheduledRuns.postCompletion(runToken, action, result, message);
    }

    endsWith(source, suffix) {
        return source.indexOf(suffix, source.length - suffix.length) !== -1;
    }

    /**
     * Get the current security token
     * @returns {string} The access token
     */
    getSecurityToken() {
        return this._httpHelper._sessionToken.accessToken;
    }

    /**
     * Check if the client is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this._httpHelper._sessionToken.isAuthenticated;
    }

    /**
     * Get the base URL
     * @returns {string} The base URL
     */
    getBaseUrl() {
        return this._httpHelper._sessionToken.baseUrl;
    }
}

/**
 * Authentication class for obtaining VaultApi client instances.
 */
export class Authorize extends common.authorize {
    /**
     * Authenticate and get a VaultApi client instance
     * @param {string} clientId - OAuth client ID
     * @param {string} clientSecret - OAuth client secret
     * @param {string} userId - User username
     * @param {string} password - User password
     * @param {string} audience - OAuth audience
     * @param {string} baseVaultUrl - VisualVault base URL
     * @param {string} customerAlias - Customer alias
     * @param {string} databaseAlias - Database alias
     * @returns {Promise<VVClient>} Authenticated client instance
     */
    async getVaultApi(clientId, clientSecret, userId, password, audience, baseVaultUrl, customerAlias, databaseAlias) {
        debug('getVaultApi called for user: %s, customer: %s/%s', userId, customerAlias, databaseAlias);

        const config = this.jsyaml.load(this.fs.readFileSync(__dirname + '/config.yml', 'utf8'));

        if (this.endsWith(baseVaultUrl, '/')) {
            baseVaultUrl = baseVaultUrl.substring(0, baseVaultUrl.length - 1);
        }

        const apiUrl = config.ApiUri.replace('{custalias}', customerAlias).replace('{custdbalias}', databaseAlias);
        const authenticationUrl = config.AutheticateUri;

        const sessionToken = await this.acquireSecurityToken(clientId, clientSecret, userId, password, audience, baseVaultUrl, apiUrl, customerAlias, databaseAlias, authenticationUrl);

        // Each `create*Api` below repoints `baseUrl` on its session copy to a service host, but only VVCore
        // issues tokens: without these, a copy has no address to refresh against.
        sessionToken.issuerBaseUrl = baseVaultUrl;
        sessionToken.jwtIssuerUrl = baseVaultUrl + apiUrl + config.ResourceUri.UsersGetJwt;

        const client = new VVClient(sessionToken);

        try {
            await client._convertToJwt(sessionToken);
            await Promise.all([
                client.createDocApi(sessionToken),
                client.createFormsApi(sessionToken),
                client.createObjectsApi(sessionToken),
                client.createStudioApi(sessionToken),
                client.createNotificationsApi(sessionToken),
                client.createUtilizationApi(sessionToken),
            ]);
            return client;
        } catch (error) {
            debug('Failed to convert to JWT or create specialized APIs: %s', error.message);
            return client;
        }
    }

    /**
     * Get a VaultApi client from an existing JWT token
     * @param {string} jwt - JWT authentication token
     * @param {string} baseVaultUrl - VisualVault base URL
     * @param {string} customerAlias - Customer alias
     * @param {string} databaseAlias - Database alias
     * @param {Date} expirationDate - Token expiration date
     * @returns {Promise<VVClient>} Authenticated client instance
     */
    async getVaultApiFromJwt(jwt, baseVaultUrl, customerAlias, databaseAlias, expirationDate) {
        debug('getVaultApiFromJwt called for customer: %s/%s', customerAlias, databaseAlias);

        const config = this.jsyaml.load(this.fs.readFileSync(__dirname + '/config.yml', 'utf8'));

        if (this.endsWith(baseVaultUrl, '/')) {
            baseVaultUrl = baseVaultUrl.substring(0, baseVaultUrl.length - 1);
        }

        const apiUrl = config.ApiUri.replace('{custalias}', customerAlias).replace('{custdbalias}', databaseAlias);
        const authenticationUrl = apiUrl + config.ResourceUri.UsersGetJwt;
        const jwtIssuerUrl = baseVaultUrl + authenticationUrl;

        if (expirationDate && expirationDate >= new Date(new Date().getTime() + 30 * 1000)) {
            const sessionToken = new common.sessionToken();

            sessionToken.accessToken = jwt;
            sessionToken.baseUrl = baseVaultUrl;
            sessionToken.apiUrl = apiUrl;
            sessionToken.authenticationUrl = authenticationUrl;
            sessionToken.customerAlias = customerAlias;
            sessionToken.databaseAlias = databaseAlias;
            sessionToken.expirationDate = expirationDate;
            sessionToken.isAuthenticated = true;
            sessionToken.isJwt = true;
            sessionToken.issuerBaseUrl = baseVaultUrl;
            sessionToken.jwtIssuerUrl = jwtIssuerUrl;

            const client = new VVClient(sessionToken);

            return Promise.all([
                client.createDocApi(sessionToken),
                client.createFormsApi(sessionToken),
                client.createObjectsApi(sessionToken),
                client.createStudioApi(sessionToken),
                client.createNotificationsApi(sessionToken),
                client.createUtilizationApi(sessionToken),
            ])
            .then(() => client)
            .catch((error) => {
                debug('Failed to create specialized APIs: %s', error.message);
                return client;
            });
        } else {
            const token = await this.acquireJwt(jwt, baseVaultUrl, apiUrl, authenticationUrl, customerAlias, databaseAlias);

            token.issuerBaseUrl = baseVaultUrl;
            token.jwtIssuerUrl = jwtIssuerUrl;

            const client = new VVClient(token);

            try {
                await Promise.all([
                    client.createDocApi(token),
                    client.createFormsApi(token),
                    client.createObjectsApi(token),
                    client.createStudioApi(token),
                    client.createNotificationsApi(token),
                    client.createUtilizationApi(token),
                ]);
                return client;
            } catch (error) {
                debug('Failed to create specialized APIs: %s', error.message);
                return client;
            }
        }
    }

    endsWith(source, suffix) {
        return source.indexOf(suffix, source.length - suffix.length) !== -1;
    }
}

// Export helper classes from formsManager for backward compatibility
export const forms = {
    returnField: ReturnField,
    formFieldCollection: FormFieldCollection
};

export default {
    vvClient: VVClient,
    authorize: Authorize,
    forms
};
