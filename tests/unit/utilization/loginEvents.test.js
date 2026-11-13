import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';

const VAULT_URL = 'https://vault.test';
const UTILIZATION_URL = 'https://utilization.test';
const API_PATH = '/api/v1/cust/db';
const AUDIENCE = 'test-audience';
const LOGINS_PATH = '/api/v1/logins';

/**
 * One LoginEvent carrying every field of the row contract.
 * @type {object}
 */
const LOGIN_EVENT = {
    eventId: 'a1b2c3d4e5f6',
    eventTime: '2026-03-04T15:22:31.123Z',
    eventType: 'UserLoginEvent',
    loginType: 'UI',
    databaseId: '0842c8e9-61a8-eb11-8ad6-644bf02b9c8a',
    databaseName: 'Test Database',
    customerId: '1f2e3d4c-5b6a-4798-8899-aabbccddeeff',
    customerName: 'Test Customer',
    usId: 'f1c70000-0000-4000-8000-000000007500',
    userName: 'script.user',
    userDisplayName: 'Script User',
    authenticationUserId: 'c0ffee00-0000-4000-8000-000000000001',
    instanceId: null,
    instanceUrl: 'https://vault.test',
};

/**
 * Builds a fake VisualVault server for global `fetch`, recording every request and routing by URL and method.
 * @param {object} [options]
 * @param {object} [options.loginsEnvelope] - The envelope the Utilization logins route answers with.
 * @param {boolean} [options.jwtAvailable] - Whether VVCore issues a JWT, leaving the client on its OAuth token
 *   when it does not.
 * @returns {{ fetch: Function, requests: Array<object>, loginsEnvelope: object }} The fake server. Assigning
 *   `loginsEnvelope` on it changes what the logins route answers from then on.
 */
function createFakeVvServer({ loginsEnvelope, jwtAvailable = true } = {}) {
    const requests = [];
    const server = {
        requests,
        loginsEnvelope: loginsEnvelope ?? {
            meta: { status: 200, message: 'OK', errors: [] },
            data: { dataVersion: '2026-03-05', minEventDate: '2025-03-05', rows: [LOGIN_EVENT] },
        },
    };

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
            if (!jwtAvailable) {
                return json(200, { meta: { status: 403, errors: [{ message: 'No JWT for this user' }] }, data: null });
            }
            const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            return json(200, { meta: { status: 200 }, data: { token: 'jwt-1', expires } });
        }
        if (url.origin === VAULT_URL && url.pathname.startsWith(`${API_PATH}/configuration/`)) {
            return json(200, { meta: { status: 200 }, data: null });
        }
        if (url.origin === UTILIZATION_URL && url.pathname === LOGINS_PATH && method === 'GET') {
            return json(200, server.loginsEnvelope);
        }
        return json(404, { meta: { status: 404, statusMsg: `No fake route for ${method} ${url}` } });
    };

    server.fetch = fetch;
    return server;
}

/**
 * Authenticates a client against the fake server and wires Utilization to the fake host.
 * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>}
 */
async function authenticate() {
    const client = await new Authorize()
        .getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db');
    await client.__createUtilizationApi(UTILIZATION_URL);
    return client;
}

describe('utilization.loginEvents.getLoginEvents', () => {
    let server;

    beforeEach(() => {
        server = createFakeVvServer();
        vi.stubGlobal('fetch', server.fetch);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    /**
     * Reads the query the manager sent on the only Utilization request.
     * @returns {object} The query parameters, as sent.
     */
    function sentQuery() {
        return server.requests.find((request) => request.host === UTILIZATION_URL).query;
    }

    it('returns the response for the range unparsed, exactly as the service sent it', async () => {
        const client = await authenticate();

        const page = await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        });

        expect(page).toBe(JSON.stringify(server.loginsEnvelope));
    });

    it('sends one GET to the Utilization host carrying the range and no Database identifier', async () => {
        const client = await authenticate();
        server.requests.length = 0;

        await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        });

        expect(server.requests).toEqual([
            expect.objectContaining({
                method: 'GET',
                host: UTILIZATION_URL,
                path: LOGINS_PATH,
                query: { StartDate: '2026-03-01', EndDate: '2026-03-31' },
            }),
        ]);
    });

    it('formats a Date whose local day runs ahead of its UTC day from the UTC parts', async () => {
        vi.stubEnv('TZ', 'Pacific/Kiritimati');
        const client = await authenticate();

        // 2026-03-02 locally at UTC+14, 2026-03-01 in UTC.
        await client.utilization.loginEvents.getLoginEvents({
            startDate: new Date('2026-03-01T23:30:00Z'),
            endDate: new Date('2026-03-31T23:30:00Z'),
        });

        expect(sentQuery()).toEqual({ StartDate: '2026-03-01', EndDate: '2026-03-31' });
    });

    it('returns an envelope carrying an empty collection for a range with no LoginEvents, and raises nothing', async () => {
        server.loginsEnvelope = {
            meta: { status: 200, message: 'OK', errors: [] },
            data: { dataVersion: '2026-03-05', minEventDate: '2025-03-05', rows: [] },
        };
        const client = await authenticate();

        const page = await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        });

        expect(JSON.parse(page).data.rows).toEqual([]);
    });

    it('returns a failing envelope status to the caller instead of throwing', async () => {
        server.loginsEnvelope = {
            meta: {
                status: 400,
                message: 'Bad Request',
                errors: [{ message: 'startDate is older than the retention horizon', code: 'OlderThanRetention' }],
            },
            data: null,
        };
        const client = await authenticate();

        const page = await client.utilization.loginEvents.getLoginEvents({
            startDate: '2020-01-01',
            endDate: '2026-03-31',
        });

        expect(JSON.parse(page).meta.status).toBe(400);
    });

    it('sends the page size, and the Cursor exactly as the service issued it', async () => {
        const cursor = 'eyJkIjoiMjAyNi0wMy0wNCJ9+/=abc';
        const client = await authenticate();
        server.requests.length = 0;

        await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            take: 250,
            cursor,
        });

        expect(sentQuery()).toEqual({
            StartDate: '2026-03-01',
            EndDate: '2026-03-31',
            Take: '250',
            Cursor: cursor,
        });
    });

    it('sends query parameters the wrapper does not know about through the escape hatch', async () => {
        const client = await authenticate();
        server.requests.length = 0;

        await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            params: { loginType: 'API', includeTrialUsers: 'false' },
        });

        expect(sentQuery()).toEqual({
            StartDate: '2026-03-01',
            EndDate: '2026-03-31',
            loginType: 'API',
            includeTrialUsers: 'false',
        });
    });

    it('lets the named options win over colliding entries in the escape hatch', async () => {
        const client = await authenticate();
        server.requests.length = 0;

        await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            take: 250,
            params: { StartDate: '1999-01-01', Take: 1 },
        });

        expect(sentQuery()).toEqual({
            StartDate: '2026-03-01',
            EndDate: '2026-03-31',
            Take: '250',
        });
    });

    it('omits a date the caller left undefined, leaving the service to report it missing', async () => {
        const client = await authenticate();
        server.requests.length = 0;

        await client.utilization.loginEvents.getLoginEvents({
            startDate: undefined,
            endDate: '2026-03-31',
        });

        expect(sentQuery()).toEqual({ EndDate: '2026-03-31' });
    });

    it('leaves the module absent rather than half-built when VVCore issues no JWT', async () => {
        server = createFakeVvServer({ jwtAvailable: false });
        vi.stubGlobal('fetch', server.fetch);
        const client = await authenticate();

        expect(client.utilization).toBeNull();
    });
});
