import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';
import { StaleCursorError } from '../../../lib/index.js';

const VAULT_URL = 'https://vault.test';
const UTILIZATION_URL = 'https://utilization.test';
const STUDIO_URL = 'https://studio.test';
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
 * The envelope the fake VVCore sites route answers with.
 * @type {object}
 */
const SITES_ENVELOPE = {
    meta: { status: 200, message: 'OK', errors: [] },
    data: [{ id: '3f8a1c20-0000-4000-8000-00000000000a', name: 'Default Site' }],
};

/**
 * Builds a fake VisualVault server for global `fetch`, recording every request and routing by URL and method.
 * @param {object} [options]
 * @param {object} [options.loginsEnvelope] - The envelope the Utilization logins route answers with.
 * @param {Function} [options.loginsHandler] - Answers the logins route per request, so successive requests can
 *   get different envelopes. Receives the recorded request and returns an envelope. Overrides `loginsEnvelope`.
 * @param {boolean} [options.jwtAvailable] - Whether VVCore issues a JWT, leaving the client on its OAuth token
 *   when it does not.
 * @param {number} [options.jwtLifetimeMs] - How long each issued JWT stays valid. Defaults to one hour.
 * @param {boolean} [options.utilizationEnabled] - The `isEnabled` flag the Utilization discovery route reports.
 *   Defaults to enabled.
 * @param {string} [options.utilizationApiUrl] - The host the Utilization discovery route reports. Defaults to the
 *   fake Utilization host.
 * @param {boolean} [options.utilizationRouteMissing] - Whether the Utilization discovery route answers 404, as a
 *   VVCore predating the endpoint does. Defaults to the route being present.
 * @param {boolean} [options.studioApiDiscoverable] - Whether StudioApi discovery reports a service. Defaults to
 *   reporting none.
 * @param {number} [options.studioApiDelayMs] - How long StudioApi discovery waits before answering. Defaults to
 *   answering at once.
 * @returns {{ fetch: Function, requests: Array<object>, loginsEnvelope: object }} The fake server. Assigning
 *   `loginsEnvelope` on it changes what the logins route answers from then on.
 */
function createFakeVvServer({
    loginsEnvelope,
    loginsHandler,
    jwtAvailable = true,
    jwtLifetimeMs = 60 * 60 * 1000,
    utilizationEnabled = true,
    utilizationApiUrl = UTILIZATION_URL,
    utilizationRouteMissing = false,
    studioApiDiscoverable = false,
    studioApiDelayMs = 0,
} = {}) {
    const requests = [];
    let jwtsIssued = 0;
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
        const request = {
            url,
            method,
            path: url.pathname,
            host: url.origin,
            query: Object.fromEntries(url.searchParams),
            body: init.body,
            authorization: headers.Authorization,
        };
        requests.push(request);

        if (url.origin === VAULT_URL && url.pathname === '/OAuth/Token' && method === 'POST') {
            return json(200, { access_token: 'oauth-token', expires_in: 3600, refresh_token: 'refresh', token_type: 'Bearer' });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/users/getjwt` && method === 'GET') {
            if (!jwtAvailable) {
                return json(200, { meta: { status: 403, errors: [{ message: 'No JWT for this user' }] }, data: null });
            }
            jwtsIssued += 1;
            const expires = new Date(Date.now() + jwtLifetimeMs).toISOString();
            return json(200, { meta: { status: 200 }, data: { token: `jwt-${jwtsIssued}`, expires } });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/sites` && method === 'GET') {
            return json(200, SITES_ENVELOPE);
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/configuration/utilizationapi`) {
            if (utilizationRouteMissing) {
                return json(404, { meta: { status: 404, statusMsg: 'Not Found' } });
            }
            // The real endpoint answers with a populated `data` even where no Utilization service is configured.
            return json(200, {
                meta: { status: 200 },
                data: { isEnabled: utilizationEnabled, utilizationApiUrl },
            });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/configuration/studioapi`) {
            if (studioApiDelayMs) {
                await new Promise((resolve) => setTimeout(resolve, studioApiDelayMs));
            }
            const data = studioApiDiscoverable ? { isEnabled: true, studioApiUrl: STUDIO_URL } : null;
            return json(200, { meta: { status: 200 }, data });
        }
        if (url.origin === VAULT_URL && url.pathname.startsWith(`${API_PATH}/configuration/`)) {
            return json(200, { meta: { status: 200 }, data: null });
        }
        if (url.origin === UTILIZATION_URL && url.pathname === LOGINS_PATH && method === 'GET') {
            return json(200, loginsHandler ? loginsHandler(request) : server.loginsEnvelope);
        }
        return json(404, { meta: { status: 404, statusMsg: `No fake route for ${method} ${url}` } });
    };

    server.fetch = fetch;
    return server;
}

/**
 * Authenticates a client against the fake server.
 * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>}
 */
function authenticate() {
    return new Authorize()
        .getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db');
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

    it('queries the host discovery reported, with the consumer supplying none', async () => {
        const client = await authenticate();

        const page = await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        });

        expect(JSON.parse(page).data.rows).toEqual([LOGIN_EVENT]);
    });

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

});

/**
 * Builds a page envelope carrying one LoginEvent and the Cursor that reaches the page after it.
 * @param {string|null} nextCursor - The Cursor that reaches the following page, null on the last page.
 * @param {string} eventId - The row's identifier, so a test can tell one page from another.
 * @returns {object} The envelope the logins route answers with.
 */
function pageEnvelope(nextCursor, eventId) {
    return {
        meta: { status: 200, message: 'OK', errors: [], nextCursor },
        data: {
            dataVersion: '2026-03-05',
            minEventDate: '2025-03-05',
            rows: [{ ...LOGIN_EVENT, eventId }],
        },
    };
}

/**
 * Answers the logins route with a fixed sequence of pages, one per request.
 * @param {Array<object>} pages - The envelopes to answer with, in order.
 * @returns {Function} A logins handler for the fake server.
 */
function walkOf(pages) {
    let index = 0;
    return () => pages[index++];
}

/**
 * The envelope the service answers with once a data load has ended a Cursor's validity.
 * @type {object}
 */
const STALE_CURSOR_ENVELOPE = {
    meta: {
        status: 409,
        message: 'Conflict',
        errors: [
            {
                message: 'The cursor was issued under an earlier data version.',
                code: '409.4',
                translation: null,
            },
        ],
    },
    data: null,
};

/**
 * Drains an async iterable into an array.
 * @param {AsyncIterable<string>} walk - The pages to read.
 * @returns {Promise<Array<string>>} Every page the walk yielded, in order.
 */
async function collect(walk) {
    const pages = [];
    for await (const page of walk) {
        pages.push(page);
    }
    return pages;
}

describe('utilization.loginEvents.iterateLoginEvents', () => {
    let server;

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.useRealTimers();
    });

    /**
     * Stubs `fetch` with a fake server answering the given pages in order, then authenticates against it.
     * @param {Array<object>} pages - The envelopes the logins route answers with, in order.
     * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>} The authenticated client.
     */
    async function clientWalking(pages) {
        server = createFakeVvServer({ loginsHandler: walkOf(pages) });
        vi.stubGlobal('fetch', server.fetch);
        return authenticate();
    }

    /**
     * Reads the queries the walk sent to the Utilization host, in order.
     * @returns {Array<object>} The query parameters of each Utilization request, as sent.
     */
    function sentQueries() {
        return server.requests.filter((request) => request.host === UTILIZATION_URL).map((request) => request.query);
    }

    it('yields one unparsed page string per iteration until the data runs out', async () => {
        const pages = [
            pageEnvelope('cursor-1', 'event-1'),
            pageEnvelope('cursor-2', 'event-2'),
            pageEnvelope(null, 'event-3'),
        ];
        const client = await clientWalking(pages);

        const yielded = await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        expect(yielded).toEqual(pages.map((page) => JSON.stringify(page)));
    });

    it('resends the Cursor the service issued, byte for byte, on the following request', async () => {
        const cursor = 'eyJkIjoiMjAyNi0wMy0wNCJ9+/=abc';
        const client = await clientWalking([pageEnvelope(cursor, 'event-1'), pageEnvelope(null, 'event-2')]);

        await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        expect(sentQueries().map((query) => query.Cursor)).toEqual([undefined, cursor]);
    });

    it('stops after the page that offers no following Cursor, sending no further request', async () => {
        const client = await clientWalking([pageEnvelope('cursor-1', 'event-1'), pageEnvelope(null, 'event-2')]);

        await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        expect(sentQueries()).toHaveLength(2);
    });

    it('asks for the largest page the service allows when the caller sets no page size', async () => {
        const client = await clientWalking([pageEnvelope('cursor-1', 'event-1'), pageEnvelope(null, 'event-2')]);

        await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        expect(sentQueries().map((query) => query.Take)).toEqual(['1000', '1000']);
    });

    it('asks for the page size the caller set, on every page of the walk', async () => {
        const client = await clientWalking([pageEnvelope('cursor-1', 'event-1'), pageEnvelope(null, 'event-2')]);

        await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
            take: 250,
        }));

        expect(sentQueries().map((query) => query.Take)).toEqual(['250', '250']);
    });

    it('fetches a page only when the caller pulls it, never reading the walk ahead', async () => {
        const client = await clientWalking([
            pageEnvelope('cursor-1', 'event-1'),
            pageEnvelope('cursor-2', 'event-2'),
            pageEnvelope(null, 'event-3'),
        ]);

        const requestsSoFar = [];
        for await (const unusedPage of client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        })) {
            void unusedPage;
            requestsSoFar.push(sentQueries().length);
        }

        expect(requestsSoFar).toEqual([1, 2, 3]);
    });

    it('sends no further request when the caller abandons the walk part way', async () => {
        const client = await clientWalking([
            pageEnvelope('cursor-1', 'event-1'),
            pageEnvelope('cursor-2', 'event-2'),
            pageEnvelope(null, 'event-3'),
        ]);

        for await (const unusedPage of client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        })) {
            void unusedPage;
            break;
        }

        expect(sentQueries()).toHaveLength(1);
    });

    it('throws a StaleCursorError when a data load ends the Cursor mid-walk', async () => {
        const client = await clientWalking([pageEnvelope('cursor-1', 'event-1'), STALE_CURSOR_ENVELOPE]);

        const walk = collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        await expect(walk).rejects.toBeInstanceOf(StaleCursorError);
    });

    it('leaves the walk finished after a stale Cursor, rather than starting it again', async () => {
        const client = await clientWalking([
            pageEnvelope('cursor-1', 'event-1'),
            STALE_CURSOR_ENVELOPE,
            pageEnvelope(null, 'event-2'),
        ]);
        const walk = client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        });

        await walk.next();
        await expect(walk.next()).rejects.toBeInstanceOf(StaleCursorError);

        expect(await walk.next()).toEqual({ value: undefined, done: true });
        expect(sentQueries()).toHaveLength(2);
    });
    // Skipped: this test is the reproduction for an open defect, which is not specific to Utilization. A session
    // whose baseUrl is repointed to a service host no longer carries the VVCore URL, and only VVCore issues these
    // JWTs, so the session cannot refresh. docApi, formsApi, objectsApi, studioApi and notificationsApi share it.
    it.skip('carries on across a token that expires part way through the walk', async () => {
        const startedAt = new Date('2026-03-05T12:00:00Z');
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(startedAt);

        const pages = [pageEnvelope('cursor-1', 'event-1'), pageEnvelope(null, 'event-2')];
        let served = 0;
        server = createFakeVvServer({
            jwtLifetimeMs: 60 * 1000,
            loginsHandler: () => {
                // The token outlives the first page and not the second, so the walk crosses a token boundary.
                served += 1;
                if (served === 1) {
                    vi.setSystemTime(new Date(startedAt.getTime() + 45 * 1000));
                }
                return pages[served - 1];
            },
        });
        vi.stubGlobal('fetch', server.fetch);
        const client = await authenticate();

        const yielded = await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        const tokens = server.requests
            .filter((request) => request.host === UTILIZATION_URL)
            .map((request) => request.authorization);
        expect(yielded).toEqual(pages.map((page) => JSON.stringify(page)));
        expect(tokens[1]).not.toBe(tokens[0]);
    });

    it('yields a stale-Cursor refusal on the first request instead of throwing, there being no Cursor to stale', async () => {
        const client = await clientWalking([STALE_CURSOR_ENVELOPE]);

        const yielded = await collect(client.utilization.loginEvents.iterateLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        }));

        expect(yielded).toEqual([JSON.stringify(STALE_CURSOR_ENVELOPE)]);
    });
});

describe('utilization discovery', () => {
    let server;

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    /**
     * Stubs `fetch` with a fake server reporting the given Utilization configuration, then authenticates.
     * @param {object} utilizationConfig - The `utilizationEnabled` and `utilizationApiUrl` the instance reports.
     * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>} The authenticated client.
     */
    async function clientDiscovering(utilizationConfig) {
        server = createFakeVvServer(utilizationConfig);
        vi.stubGlobal('fetch', server.fetch);
        return authenticate();
    }

    it('discovers the service at the Utilization configuration route', async () => {
        await clientDiscovering({});

        expect(server.requests.map(({ method, host, path }) => ({ method, host, path })))
            .toContainEqual({ method: 'GET', host: VAULT_URL, path: `${API_PATH}/configuration/utilizationapi` });
    });

    it('leaves the module absent on an instance where the service is turned off', async () => {
        const client = await clientDiscovering({ utilizationEnabled: false });

        expect(client.utilization).toBeNull();
    });

    it.each([
        { label: 'an empty string', host: '' },
        { label: 'null', host: null },
    ])('leaves the module absent when the service is on but its host is $label', async ({ host }) => {
        const client = await clientDiscovering({ utilizationApiUrl: host });

        expect(client.utilization).toBeNull();
    });

    it('leaves an unrelated manager working on an instance without the service', async () => {
        const client = await clientDiscovering({ utilizationEnabled: false });

        expect(await client.sites.getSites()).toBe(JSON.stringify(SITES_ENVELOPE));
    });

    it('discovers the service for a consumer authorizing with a JWT it already holds', async () => {
        server = createFakeVvServer();
        vi.stubGlobal('fetch', server.fetch);

        const client = await new Authorize().getVaultApiFromJwt(
            'caller-held-jwt', VAULT_URL, 'cust', 'db', new Date(Date.now() + 60 * 60 * 1000));

        expect(client.utilization).not.toBeNull();
        expect(JSON.parse(await client.utilization.loginEvents.getLoginEvents({
            startDate: '2026-03-01',
            endDate: '2026-03-31',
        })).data.rows).toEqual([LOGIN_EVENT]);
    });

    it('leaves the module absent rather than half-built when VVCore issues no JWT for the service', async () => {
        server = createFakeVvServer({ jwtAvailable: false });
        vi.stubGlobal('fetch', server.fetch);

        const client = await new Authorize().getVaultApiFromJwt(
            'caller-held-jwt', VAULT_URL, 'cust', 'db', new Date(Date.now() + 60 * 60 * 1000));

        expect(client.utilization).toBeNull();
    });

    it('hands back every other module already discovered when VVCore has no Utilization endpoint', async () => {
        // The delay holds StudioApi discovery in flight so the Utilization 404 lands with a sibling unfinished.
        const client = await clientDiscovering({
            utilizationRouteMissing: true,
            studioApiDiscoverable: true,
            studioApiDelayMs: 50,
        });

        expect(client.studioApi).not.toBeNull();
        expect(client.utilization).toBeNull();
    });

    it('leaves VVCore managers pointed at the vault host once Utilization is discovered', async () => {
        const client = await clientDiscovering({});
        server.requests.length = 0;

        await client.sites.getSites();

        expect(server.requests.map(({ host, path }) => ({ host, path }))).toEqual([
            { host: VAULT_URL, path: `${API_PATH}/sites` },
        ]);
    });
});
