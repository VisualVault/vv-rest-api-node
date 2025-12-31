import createDebug from 'debug';

const debug = createDebug('visualvault:http');

export class HttpHelper {
    constructor(sessionToken, yamlConfig) {
        this._sessionToken = sessionToken;
        this._config = yamlConfig;
        this._maxRetries = 3;
    }

    async doVvClientRequest(url, options, params, data, buffer) {
        // If the token is within 30 seconds of expiration, refresh it
        if (this._sessionToken.expirationDate < new Date(new Date().getTime() + 30 * 1000)) {
            debug('accessToken has expired, calling __acquireRefreshToken');

            try {
                await this.__acquireRefreshToken();
                debug('return success from __acquireRefreshToken');
                return await this.__doVvClientCallRequest(url, options, params, data, buffer);
            } catch (error) {
                debug('return fail from __acquireRefreshToken: %s', error.message);
                throw new Error('Unable to obtain Authorization, error: ' + error);
            }
        } else {
            return await this.__doVvClientCallRequest(url, options, params, data, buffer);
        }
    }

    async __doVvClientCallRequest(url, options, params, data, buffer, retries = 0) {
        try {
            let responseData;

            if (options.method === 'GET') {
                responseData = await this.httpGet(url, params);
            } else if (options.method === 'GETSTREAM') {
                responseData = await this.httpGetStream(url, params);
            } else if (options.method === 'POST') {
                responseData = await this.httpPost(url, params, data);
            } else if (options.method === 'POSTSTREAM') {
                responseData = await this.httpPostStream(url, params, data, buffer);
            } else if (options.method === 'PUT') {
                responseData = await this.httpPut(url, params, data);
            } else if (options.method === 'PUTSTREAM') {
                responseData = await this.httpPutStream(url, params, data, buffer);
            } else if (options.method === 'DELETE') {
                responseData = await this.httpDelete(url, params);
            } else {
                throw new Error('http request method name error');
            }

            return responseData;
        } catch (error) {
            // Handle retry logic for 429 status
            if (error.status === 429 && retries < this._maxRetries) {
                const timeout = this.__getRetryDelay(error.retryTime);
                debug('Timed Out: Retrying in %d ms. (%d retries left)', timeout, this._maxRetries - retries - 1);

                await new Promise(resolve => setTimeout(resolve, timeout));
                return await this.__doVvClientCallRequest(url, options, params, data, buffer, retries + 1);
            }

            throw error;
        }
    }

    async __makeRequest(url, options) {
        const headers = {
            'Authorization': 'Bearer ' + this._sessionToken.accessToken,
            'Content-Type': 'application/json'
        };

        debug('Performing request to url: %s', url);

        const fetchOptions = {
            method: options.method,
            headers: { ...headers, ...options.headers }
        };

        // Add query parameters to URL
        if (options.qs && Object.keys(options.qs).length > 0) {
            const queryString = new URLSearchParams(options.qs).toString();
            url = `${url}?${queryString}`;
        }

        // Add body for POST/PUT requests
        if (options.json && (options.method === 'POST' || options.method === 'PUT')) {
            fetchOptions.body = JSON.stringify(options.json);
        }

        const response = await fetch(url, fetchOptions);
        const responseText = await response.text();

        if (!response.ok) {
            let parsedData;
            try {
                parsedData = JSON.parse(responseText);
            } catch (e) {
                parsedData = { meta: responseText };
            }

            if (response.status === 401 || response.status === 403) {
                this._sessionToken.isAuthenticated = false;
                throw new Error(JSON.stringify(parsedData.meta));
            } else if (response.status === 429) {
                const error = new Error(JSON.stringify(parsedData.meta));
                error.status = 429;
                error.retryTime = parsedData.meta?.retryTime;
                throw error;
            } else {
                throw new Error(responseText);
            }
        }

        return responseText;
    }

    async __makePostStreamRequest(url, options, buffer) {
        debug('Performing stream request to url: %s', url);

        const formData = new FormData();

        // Add form fields
        if (options.json) {
            for (const key in options.json) {
                if (options.json.hasOwnProperty(key)) {
                    formData.append(key, options.json[key]);
                }
            }
        }

        // Add file(s) to multipart data
        if (Buffer.isBuffer(buffer)) {
            // Single file
            const filename = options.json?.fileName || "file";
            const blob = new Blob([buffer]);
            formData.append('fileUpload', blob, filename);
        } else if (Array.isArray(buffer)) {
            // Multiple files
            for (let i = 0; i < buffer.length; i++) {
                const fileInfoObj = buffer[i];
                if (Buffer.isBuffer(fileInfoObj.buffer)) {
                    const fileName = fileInfoObj.fileName || `file${i}`;
                    const blob = new Blob([fileInfoObj.buffer]);
                    formData.append('fileUpload', blob, fileName);
                } else {
                    throw new Error(`Invalid 'buffer' property found on fileObj at index ${i}`);
                }
            }
        } else {
            throw new Error('Expecting Buffer');
        }

        const headers = {
            'Authorization': 'Bearer ' + this._sessionToken.accessToken
        };

        const response = await fetch(url, {
            method: options.method,
            headers,
            body: formData
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(responseText);
        }

        return responseText;
    }

    async httpGet(url, params) {
        const options = { method: 'GET', qs: params || {}, headers: {}, json: null };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makeRequest(url, options);
    }

    async httpGetStream(url, params) {
        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        const headers = {
            'Authorization': 'Bearer ' + this._sessionToken.accessToken,
            'Content-Type': 'application/json; charset=utf-8'
        };

        if (params && Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url = `${url}?${queryString}`;
        }

        const response = await fetch(url, { method: 'GET', headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        return Buffer.from(buffer);
    }

    async httpPost(url, params, data) {
        const options = { method: 'POST', qs: params || {}, json: data, headers: {} };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makeRequest(url, options);
    }

    async httpPostStream(url, params, data, buffer) {
        const options = { method: 'POST', qs: params || {}, json: data, headers: {} };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makePostStreamRequest(url, options, buffer);
    }

    async httpPut(url, params, data) {
        const options = { method: 'PUT', qs: params || {}, json: data, headers: {} };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makeRequest(url, options);
    }

    async httpPutStream(url, params, data, buffer) {
        const options = { method: 'PUT', qs: params || {}, json: data, headers: {} };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makePostStreamRequest(url, options, buffer);
    }

    async httpDelete(url, params) {
        const options = { method: 'DELETE', qs: params || {}, json: null, headers: {} };

        if (this._sessionToken.accessToken == null) {
            throw new Error('Access token is null');
        }

        return await this.__makeRequest(url, options);
    }

    async __acquireRefreshToken() {
        this._sessionToken.isAuthenticated = false;

        // Import authorize dynamically to avoid circular dependency
        const { Authorize } = await import('./authorize.js');
        const vvAuthorize = new Authorize();

        try {
            await vvAuthorize.acquireRefreshToken(this._sessionToken);
        } catch (error) {
            await vvAuthorize.reacquireSecurityToken(this._sessionToken);
        }
    }

    request(httpVerb, url, params, data) {
        const options = { method: httpVerb.toUpperCase() };
        debug('Performing %s request to url: %s', httpVerb.toUpperCase(), url);
        return this.doVvClientRequest(url, options, params, data);
    }

    getUrl(resourceUrl) {
        return this._sessionToken.baseUrl + this._sessionToken.apiUrl + resourceUrl;
    }

    __getRetryDelay(retryTime) {
        let delay = 10;
        if (retryTime && !isNaN(Date.parse(retryTime))) {
            const now = new Date();
            delay = Date.parse(retryTime) - now.getTime();
            if (delay < 0) {
                delay *= -1;
            }
        }
        return delay;
    }
}

export default HttpHelper;
