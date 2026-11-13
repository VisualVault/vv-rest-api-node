import { SessionToken } from './sessionToken.js';
import { fetchWithRetry } from './fetchWithRetry.js';
import createDebug from 'debug';
import yaml from 'js-yaml';
import fs from 'fs';

const debug = createDebug('visualvault:auth');

export class Authorize {
    constructor() {
        this.jsyaml = yaml;
        this.fs = fs;
    }

    async acquireSecurityToken(clientId, clientSecret, userId, password, audience, baseUrl, apiUrl, customerAlias, databaseAlias, authenticationUrl) {
        debug('acquireSecurityToken called for user: %s', userId);

        try {
            const sessionToken = await this.__getToken(
                clientId,
                clientSecret,
                userId,
                password,
                audience,
                baseUrl,
                customerAlias,
                databaseAlias,
                authenticationUrl,
                true
            );

            debug('acquireSecurityToken success');

            if (typeof (sessionToken) != 'undefined' && sessionToken != null) {
                sessionToken.baseUrl = baseUrl;
                sessionToken.apiUrl = apiUrl;
                sessionToken.authenticationUrl = authenticationUrl;
                sessionToken.customerAlias = customerAlias;
                sessionToken.databaseAlias = databaseAlias;
                sessionToken.clientId = clientId;
                sessionToken.clientSecret = clientSecret;
                sessionToken.userId = userId;
                sessionToken.password = password;
                sessionToken.audience = audience;
                sessionToken.isAuthenticated = true;
            }

            return sessionToken;
        } catch (error) {
            debug('acquireSecurityToken failed: %s', error.message);
            throw error;
        }
    }

    async acquireJwt(jwt, baseUrl, apiUrl, authenticationUrl, customerAlias, databaseAlias) {
        debug('acquireJwt called');

        try {
            const sessionToken = await this.__getJwt(
                jwt,
                baseUrl,
                customerAlias,
                databaseAlias,
                authenticationUrl,
                true
            );

            debug('acquireJwt success');

            if (typeof (sessionToken) != 'undefined' && sessionToken != null) {
                sessionToken.baseUrl = baseUrl;
                sessionToken.apiUrl = apiUrl;
                sessionToken.authenticationUrl = authenticationUrl;
                sessionToken.customerAlias = customerAlias;
                sessionToken.databaseAlias = databaseAlias;
                sessionToken.isAuthenticated = true;
                sessionToken.isJwt = true;
            }

            return sessionToken;
        } catch (error) {
            debug('acquireJwt failed: %s', error.message);
            throw error;
        }
    }

    async reacquireSecurityToken(sessionToken) {
        debug('reacquireSecurityToken called (isJwt: %s)', sessionToken.isJwt);

        try {
            if (sessionToken.isJwt) {
                const jwt = await this.__reissueJwt(sessionToken);

                sessionToken.convertToJwt(jwt);
                // The replacement is a JWT, which no refresh_token grant can renew.
                sessionToken.refreshToken = null;
                sessionToken.isAuthenticated = true;

                debug('reacquireSecurityToken success (JWT)');
                return sessionToken;
            } else {
                const newToken = await this.__getToken(
                    sessionToken.clientId,
                    sessionToken.clientSecret,
                    sessionToken.userId,
                    sessionToken.password,
                    sessionToken.audience,
                    sessionToken.issuerBaseUrl || sessionToken.baseUrl,
                    sessionToken.customerAlias,
                    sessionToken.databaseAlias,
                    sessionToken.authenticationUrl,
                    true
                );

                sessionToken.accessToken = newToken.accessToken;
                sessionToken.expiresIn = newToken.expiresIn;
                sessionToken.refreshToken = newToken.refreshToken;
                sessionToken.tokenType = newToken.tokenType;
                sessionToken.expirationDate = newToken.expirationDate;
                sessionToken.isAuthenticated = true;

                debug('reacquireSecurityToken success (password grant)');
                return sessionToken;
            }
        } catch (error) {
            debug('reacquireSecurityToken failed: %s', error.message);
            throw error;
        }
    }

    /**
     * Gets a replacement JWT from VVCore for a session whose JWT is at or near expiry.
     *
     * Presents the token the session already holds; if the issuer refuses it, re-authenticates with the
     * session's credentials and asks again. `jwtIssuerUrl` holds the issuer address, which `baseUrl` cannot
     * supply on a session repointed at a specialized service host.
     * @private
     * @param {SessionToken} sessionToken - The session to re-issue for. Not modified.
     * @returns {Promise<{ token: string, expires: string }>} The `data` of the VVCore `users/getjwt` response.
     * @throws {Error} The session carries no `jwtIssuerUrl`; or the issuer refused the held token and the
     *   session has no `clientId` and `password` to re-authenticate with; or the issuer returned no token.
     */
    async __reissueJwt(sessionToken) {
        if (!sessionToken.jwtIssuerUrl) {
            throw new Error('Unable to refresh JWT: the session carries no token issuer');
        }

        const url = new URL(sessionToken.jwtIssuerUrl);
        if (sessionToken.audience) {
            url.searchParams.set('audience', sessionToken.audience);
        }

        debug('__reissueJwt - URL: %s', url.toString());

        // Refresh fires 30 seconds before expiry, so the held token is usually still valid: try it before
        // spending a password grant. A session built from a caller-supplied JWT has no credentials for that.
        try {
            return await this.__getJwtFrom(url.toString(), sessionToken.accessToken);
        } catch (error) {
            if (!sessionToken.clientId || !sessionToken.password) {
                throw error;
            }
            debug('__reissueJwt - the held token was refused (%s), falling back to the password grant', error.message);
        }

        const oauthToken = await this.__getToken(
            sessionToken.clientId,
            sessionToken.clientSecret,
            sessionToken.userId,
            sessionToken.password,
            sessionToken.audience,
            sessionToken.issuerBaseUrl || sessionToken.baseUrl,
            sessionToken.customerAlias,
            sessionToken.databaseAlias,
            sessionToken.authenticationUrl
        );

        return await this.__getJwtFrom(url.toString(), oauthToken.accessToken);
    }

    /**
     * Reads a JWT from the issuer, presenting the given token as the bearer.
     * @private
     * @param {string} url - The issuer URL, query parameters already applied.
     * @param {string} bearer - Rejected by the issuer once the token behind it has expired.
     * @returns {Promise<{ token: string, expires: string }>} The `data` of the VVCore `users/getjwt` response.
     * @throws {Error} The issuer refused the bearer (HTTP 400, 401 or 403), or answered with no `data.token`.
     */
    async __getJwtFrom(url, bearer) {
        const response = await fetchWithRetry(url, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + bearer }
        });

        const body = await response.text();

        if (response.status === 401 || response.status === 403 || response.status === 400) {
            throw new Error(`Authorization has been refused for current credentials (HTTP ${response.status}): ${body.substring(0, 200)}`);
        }
        if (response.status !== 200) {
            throw new Error(`Unknown response for JWT: HTTP ${response.status}`);
        }

        const responseObject = JSON.parse(body);

        if (!responseObject['data'] || !responseObject['data']['token']) {
            throw new Error('Unable to refresh JWT: the issuer response carries no data.token');
        }

        return responseObject['data'];
    }

    async acquireRefreshToken(sessionToken) {
        if (sessionToken.isJwt) {
            return await this.reacquireSecurityToken(sessionToken);
        }

        const claim = {
            grant_type: 'refresh_token',
            refresh_token: sessionToken.refreshToken,
            client_id: sessionToken.clientId,
            client_secret: sessionToken.clientSecret
        };

        if (sessionToken['audience']) {
            claim['audience'] = sessionToken['audience'];
        }

        // Only the issuer host serves the token endpoint; `baseUrl` may be a service host that does not.
        const urlSecurity = (sessionToken.issuerBaseUrl || sessionToken.baseUrl) + sessionToken.authenticationUrl;
        debug('acquireRefreshToken - URL: %s', urlSecurity);

        try {
            const response = await fetchWithRetry(urlSecurity, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(claim)
            });

            const body = await response.text();

            if (response.status === 200) {
                debug('acquireRefreshToken success');

                const responseObject = JSON.parse(body);
                sessionToken.accessToken = responseObject.access_token;
                sessionToken.expiresIn = responseObject.expires_in;
                sessionToken.refreshToken = responseObject.refresh_token;
                sessionToken.tokenType = responseObject.token_type;

                const expireDate = new Date();
                expireDate.setSeconds(expireDate.getSeconds() + sessionToken.expiresIn);

                sessionToken.expirationDate = expireDate;
                sessionToken.isAuthenticated = true;

                return sessionToken;
            } else if (response.status === 401 || response.status === 403 || response.status === 400) {
                sessionToken.isAuthenticated = false;
                throw new Error(`Authorization has been refused for current credentials (HTTP ${response.status}): ${body.substring(0, 200)}`);
            } else {
                sessionToken.isAuthenticated = false;
                throw new Error(`Unknown response for access token: HTTP ${response.status}`);
            }
        } catch (error) {
            sessionToken.isAuthenticated = false;
            debug('acquireRefreshToken error: %s', error.message);
            throw error;
        }
    }

    async __getToken(clientId, clientSecret, userId, password, audience, baseUrl, customerAlias, databaseAlias, authenticationUrl) {
        const sessionToken = new SessionToken();

        const claim = {
            grant_type: 'password',
            client_id: clientId,
            client_secret: clientSecret,
            username: userId,
            password: password,
            scope: 'vault'
        };

        const urlSecurity = baseUrl + authenticationUrl;
        debug('__getToken - URL: %s, user: %s, customer: %s/%s, audience: %s', urlSecurity, userId, customerAlias, databaseAlias, audience);

        try {
            const response = await fetchWithRetry(urlSecurity, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(claim)
            });

            const body = await response.text();

            if (response.status === 200) {
                const responseObject = JSON.parse(body);
                sessionToken.accessToken = responseObject.access_token;
                sessionToken.expiresIn = responseObject.expires_in;
                sessionToken.refreshToken = responseObject.refresh_token;
                sessionToken.tokenType = responseObject.token_type;

                const expireDate = new Date();
                expireDate.setSeconds(expireDate.getSeconds() + sessionToken.expiresIn);

                sessionToken.expirationDate = expireDate;
                sessionToken.isAuthenticated = true;

                debug('__getToken success');
                return sessionToken;
            } else if (response.status === 401 || response.status === 403 || response.status === 400) {
                sessionToken.isAuthenticated = false;
                throw new Error(`Authorization has been refused for current credentials (HTTP ${response.status}): ${body.substring(0, 200)}`);
            } else {
                sessionToken.isAuthenticated = false;
                throw new Error(`Unknown response for access token: HTTP ${response.status}`);
            }
        } catch (error) {
            sessionToken.isAuthenticated = false;
            debug('__getToken error: %s', error.message);
            throw error;
        }
    }

    async __getJwt(jwt, baseUrl, customerAlias, databaseAlias, authenticationUrl) {
        const sessionToken = new SessionToken();

        const headers = {
            Authorization: 'Bearer ' + jwt,
        };

        const urlSecurity = baseUrl + authenticationUrl;
        debug('__getJwt - URL: %s, customer: %s/%s', urlSecurity, customerAlias, databaseAlias);

        try {
            const response = await fetchWithRetry(urlSecurity, {
                method: 'GET',
                headers
            });

            const body = await response.text();

            if (response.status === 200) {
                const responseObject = JSON.parse(body);

                sessionToken.accessToken = responseObject.data.token;
                sessionToken.expirationDate = new Date(responseObject.data.expires);
                sessionToken.isAuthenticated = true;
                sessionToken.isJwt = true;

                debug('__getJwt success');
                return sessionToken;
            } else if (response.status === 401 || response.status === 403 || response.status === 400) {
                sessionToken.isAuthenticated = false;
                throw new Error(`Authorization has been refused for current credentials (HTTP ${response.status}): ${body.substring(0, 200)}`);
            } else {
                sessionToken.isAuthenticated = false;
                throw new Error(`Unknown response for JWT: HTTP ${response.status}`);
            }
        } catch (error) {
            sessionToken.isAuthenticated = false;
            debug('__getJwt error: %s', error.message);
            throw error;
        }
    }

    endsWith(source, suffix) {
        return source.indexOf(suffix, source.length - suffix.length) !== -1;
    }
}

export default Authorize;