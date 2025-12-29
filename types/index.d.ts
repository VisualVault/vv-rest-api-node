// Type definitions for visualvault-api
// Project: https://github.com/VisualVault/visualvault-api
// Definitions by: VisualVault

declare module 'visualvault-api' {
    export class authorize {
        constructor();

        /**
         * Authenticate and get a VaultApi client instance
         * @param clientId OAuth client ID
         * @param clientSecret OAuth client secret
         * @param username User username
         * @param password User password
         * @param audience OAuth audience
         * @param baseUrl VisualVault base URL
         * @param customerAlias Customer alias
         * @param databaseAlias Database alias
         * @returns Promise that resolves to an authenticated client
         */
        getVaultApi(
            clientId: string,
            clientSecret: string,
            username: string,
            password: string,
            audience: string,
            baseUrl: string,
            customerAlias: string,
            databaseAlias: string
        ): Promise<VaultApiClient>;

        /**
         * Get a VaultApi client instance from an existing JWT token
         * @param jwtToken JWT authentication token
         * @param baseUrl VisualVault base URL
         * @param customerAlias Customer alias
         * @param databaseAlias Database alias
         * @param expirationDate Token expiration date
         * @returns Promise that resolves to an authenticated client
         */
        getVaultApiFromJwt(
            jwtToken: string,
            baseUrl: string,
            customerAlias: string,
            databaseAlias: string,
            expirationDate: Date
        ): Promise<VaultApiClient>;
    }

    export interface VaultApiClient {
        // Core API managers
        constants: any;
        configuration: any;
        customQuery: any;
        documents: any;
        email: any;
        files: any;
        forms: any;
        groups: any;
        library: any;
        sites: any;
        users: any;
        scheduledProcess: any;
        scripts: any;
        projects: any;
        customer: any;
        customerDatabase: any;
        indexFields: any;
        outsideProcesses: any;
        securityMembers: any;
        layouts: any;
        reports: any;

        // Extended API modules (when enabled)
        docApi?: any;
        formsApi?: any;
        objectsApi?: any;
        studioApi?: any;
        notificationsApi?: any;
    }

    export interface ApiParams {
        [key: string]: any;
    }

    export interface ApiResponse<T = any> {
        data: T;
        meta: {
            statusCode: number;
            message?: string;
            [key: string]: any;
        };
    }
}
