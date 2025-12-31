import { SessionToken } from './sessionToken.js';
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
                const newToken = await this.__getJwt(
                    sessionToken.accessToken,
                    sessionToken.baseUrl,
                    sessionToken.customerAlias,
                    sessionToken.databaseAlias,
                    sessionToken.authenticationUrl,
                    true
                );

                debug('reacquireSecurityToken success (JWT)');
                return newToken;
            } else {
                const newToken = await this.__getToken(
                    sessionToken.clientId,
                    sessionToken.clientSecret,
                    sessionToken.userId,
                    sessionToken.password,
                    sessionToken.audience,
                    sessionToken.baseUrl,
                    sessionToken.customerAlias,
                    sessionToken.databaseAlias,
                    sessionToken.authenticationUrl,
                    true
                );

                debug('reacquireSecurityToken success (password grant)');
                return newToken;
            }
        } catch (error) {
            debug('reacquireSecurityToken failed: %s', error.message);
            throw error;
        }
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

        const urlSecurity = sessionToken.baseUrl + sessionToken.authenticationUrl;
        debug('acquireRefreshToken - URL: %s', urlSecurity);

        try {
            const response = await fetch(urlSecurity, {
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
            const response = await fetch(urlSecurity, {
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
            const response = await fetch(urlSecurity, {
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