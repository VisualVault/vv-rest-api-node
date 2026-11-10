import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createDebug from 'debug';
import { Authorize } from '../../../lib/VVRestApi.js';
import { CompletionTarget } from '../../../lib/constants.js';

const VAULT_URL = 'https://vault.test';
const STUDIO_API_URL = 'https://studio.test';
const API_PATH = '/api/v1/cust/db';
const AUDIENCE = 'test-audience';
const RUN_TOKEN = '8d3c1f6e-run-token';
const defaultDebugLog = createDebug.log;

/**
 * Builds a fake VV server for global `fetch`. It records every request and routes by URL and method.
 * @param {object} [options]
 * @param {boolean} [options.studioApiDiscoverable] - Whether `/configuration/studioapi` returns a StudioApi.
 * @param {boolean} [options.studioApiEnabled] - The `isEnabled` flag of the discovered StudioApi.
 * @param {number} [options.studioApiCompletionStatus] - HTTP status of the StudioApi Completion route.
 * @returns {{ fetch: Function, requests: Array<object>, issuedJwts: string[], jwtLifetimeMs: number }}
 *   Set `jwtLifetimeMs` to change the lifetime of the JWTs issued after that.
 */
function createFakeVvServer({ studioApiDiscoverable = true, studioApiEnabled = true, studioApiCompletionStatus = 200 } = {}) {
    const requests = [];
    const issuedJwts = [];
    let jwtCount = 0;
    const server = { requests, issuedJwts, jwtLifetimeMs: 60 * 60 * 1000 };

    const json = (status, body) => new Response(JSON.stringify(body), { status });

    const fetch = async (input, init = {}) => {
        const url = new URL(input);
        const method = init.method || 'GET';
        const headers = init.headers || {};
        requests.push({
            url,
            method,
            path: url.pathname,
            host: url.origin,
            query: Object.fromEntries(url.searchParams),
            body: init.body,
            authorization: headers.Authorization,
        });

        if (url.origin === VAULT_URL && url.pathname === '/OAuth/Token' && method === 'POST') {
            return json(200, { access_token: 'oauth-token', expires_in: 3600, refresh_token: 'refresh', token_type: 'Bearer' });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/users/getjwt` && method === 'GET') {
            jwtCount += 1;
            issuedJwts.push(`jwt-${jwtCount}`);
            const expires = new Date(Date.now() + server.jwtLifetimeMs).toISOString();
            return json(200, { meta: { status: 200 }, data: { token: `jwt-${jwtCount}`, expires } });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/configuration/studioapi`) {
            const data = studioApiDiscoverable ? { isEnabled: studioApiEnabled, studioApiUrl: STUDIO_API_URL } : null;
            return json(200, { meta: { status: 200 }, data });
        }
        if (url.origin === VAULT_URL && url.pathname.startsWith(`${API_PATH}/configuration/`)) {
            return json(200, { meta: { status: 200 }, data: null });
        }
        if (url.origin === VAULT_URL && url.pathname.startsWith(`${API_PATH}/scheduledProcess/`) && method === 'POST') {
            return json(200, { meta: { status: 200 }, data: 'vvcore-completion-recorded' });
        }
        if (url.origin === STUDIO_API_URL && url.pathname.endsWith('/completion') && method === 'POST') {
            return json(studioApiCompletionStatus, { meta: { status: studioApiCompletionStatus }, data: 'studioapi-completion-recorded' });
        }
        return json(404, { meta: { status: 404, statusMsg: `No fake route for ${method} ${url}` } });
    };

    server.fetch = fetch;
    return server;
}

/**
 * Turns on the library's `debug` output and captures it.
 *
 * Replaces `createDebug.log`; restore it to `defaultDebugLog` after the test.
 * @returns {() => string[]} A function that returns the log lines written so far.
 */
function captureDebugLog() {
    const lines = [];
    createDebug.enable('visualvault:*');
    createDebug.log = (...args) => lines.push(args.join(' '));
    return () => lines;
}

/**
 * Authenticates a client against the fake server the way a consumer does.
 * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>}
 */
function authenticate() {
    return new Authorize().getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db');
}

describe('scheduledProcess.postCompletion completion target', () => {
    let server;

    beforeEach(() => {
        server = createFakeVvServer();
        vi.stubGlobal('fetch', server.fetch);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        createDebug.disable();
        createDebug.log = defaultDebugLog;
    });

    describe('with no completion target', () => {
        let response;

        beforeEach(async () => {
            const client = await authenticate();
            server.requests.length = 0;
            response = await client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'All done');
        });

        it('sends one POST to VVCore scheduledProcess for the given id', () => {
            expect(server.requests.map(({ method, host, path }) => ({ method, host, path }))).toEqual([
                { method: 'POST', host: VAULT_URL, path: `${API_PATH}/scheduledProcess/${RUN_TOKEN}` },
            ]);
        });

        it('sends action, result and message in the query string and no body', () => {
            const [request] = server.requests;
            expect(request.query).toEqual({ action: 'complete', result: 'true', message: 'All done' });
            expect(request.body).toBeUndefined();
        });

        it('authorizes the Completion with the client JWT', () => {
            expect(server.requests[0].authorization).toBe('Bearer jwt-1');
        });

        it('returns the VVCore response', () => {
            expect(JSON.parse(response).data).toBe('vvcore-completion-recorded');
        });
    });

    describe('with completion target studioapi', () => {
        describe('when StudioApi accepts the Completion', () => {
            let response;

            beforeEach(async () => {
                const client = await authenticate();
                client.setCompletionTarget(CompletionTarget.StudioApi);
                server.requests.length = 0;
                server.issuedJwts.length = 0;
                response = await client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', false, 'Failed step 3');
            });

            it('sends a POST to the StudioApi run route for the Run token', () => {
                const completionRequests = server.requests.filter((request) => request.host === STUDIO_API_URL);
                expect(completionRequests.map(({ method, path }) => ({ method, path }))).toEqual([
                    { method: 'POST', path: `/api/v1/Microservices/runs/${RUN_TOKEN}/completion` },
                ]);
            });

            it('sends action, result and message in the query string and no body', () => {
                const completionRequest = server.requests.find((request) => request.host === STUDIO_API_URL);
                expect(completionRequest.query).toEqual({ action: 'complete', result: 'false', message: 'Failed step 3' });
                expect(completionRequest.body).toBeUndefined();
            });

            it('authorizes the Completion with a JWT that VVCore issued for this call', () => {
                const completionRequest = server.requests.find((request) => request.host === STUDIO_API_URL);
                expect(server.issuedJwts.map((jwt) => `Bearer ${jwt}`)).toContain(completionRequest.authorization);
            });

            it('never sends a request to VVCore scheduledProcess', () => {
                expect(server.requests.some((request) => request.path.includes('/scheduledProcess'))).toBe(false);
            });

            it('returns the StudioApi response', () => {
                expect(JSON.parse(response).data).toBe('studioapi-completion-recorded');
            });
        });

        it('accepts the plain string selector', async () => {
            const client = await authenticate();
            client.setCompletionTarget('studioapi');
            server.requests.length = 0;

            await client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'done');

            expect(server.requests.some((request) => request.host === STUDIO_API_URL)).toBe(true);
        });

        it('rejects on a StudioApi error and never posts the Completion to VVCore', async () => {
            server = createFakeVvServer({ studioApiCompletionStatus: 500 });
            vi.stubGlobal('fetch', server.fetch);
            const client = await authenticate();
            client.setCompletionTarget(CompletionTarget.StudioApi);

            await expect(client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, ''))
                .rejects.toThrow('"status":500');

            expect(server.requests.some((request) => request.path.includes('/scheduledProcess'))).toBe(false);
        });

        it('rejects with a clear error and never calls VVCore when the client has no StudioApi', async () => {
            server = createFakeVvServer({ studioApiDiscoverable: false });
            vi.stubGlobal('fetch', server.fetch);
            const client = await authenticate();
            client.setCompletionTarget('studioapi');
            server.requests.length = 0;
            const logLines = captureDebugLog();

            await expect(client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'done'))
                .rejects.toThrow(/StudioApi is not available/);

            expect(server.requests).toHaveLength(0);
            expect(logLines().some((line) => line.includes('StudioApi is not available'))).toBe(true);
        });

        it('rejects and never calls VVCore scheduledProcess when StudioApi is disabled', async () => {
            server = createFakeVvServer({ studioApiEnabled: false });
            vi.stubGlobal('fetch', server.fetch);
            const client = await authenticate();
            client.setCompletionTarget(CompletionTarget.StudioApi);

            await expect(client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'done'))
                .rejects.toThrow(/StudioApi is not available/);

            expect(server.requests.some((request) => request.path.includes('/scheduledProcess'))).toBe(false);
        });

        it('rejects without calling the StudioApi host when the JWT from VVCore expires within 30 seconds', async () => {
            const client = await authenticate();
            client.setCompletionTarget(CompletionTarget.StudioApi);
            server.jwtLifetimeMs = 10 * 1000;
            server.requests.length = 0;

            await expect(client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'done'))
                .rejects.toThrow(/expires within 30 seconds/);

            expect(server.requests.some((request) => request.host === STUDIO_API_URL)).toBe(false);
        });
    });

    describe('with an unknown completion target', () => {
        it('posts the Completion to VVCore and logs the unknown value', async () => {
            const logLines = captureDebugLog();
            const client = await authenticate();
            client.setCompletionTarget('lambda');
            server.requests.length = 0;

            await client.scheduledProcess.postCompletion(RUN_TOKEN, 'complete', true, 'done');

            expect(server.requests).toHaveLength(1);
            expect(server.requests[0].host).toBe(VAULT_URL);
            expect(server.requests[0].path).toBe(`${API_PATH}/scheduledProcess/${RUN_TOKEN}`);
            expect(logLines().some((line) => line.includes('lambda'))).toBe(true);
        });
    });
});
