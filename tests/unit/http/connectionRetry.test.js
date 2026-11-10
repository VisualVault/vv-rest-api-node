import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';

const BASE_URL = 'https://vv.example.test';
const API_PREFIX = '/api/v1/cust/db';

/**
 * Builds the error native fetch() rejects with when no HTTP response comes back.
 * @param {string} code - The system error code, for example 'ECONNREFUSED'.
 * @returns {TypeError} A `TypeError('fetch failed')` with the system error on `cause`.
 */
function connectionError(code) {
    const cause = new Error(`connect ${code}`);
    cause.code = code;
    return new TypeError('fetch failed', { cause });
}

/**
 * Creates a fake VV server behind a stubbed global fetch.
 * @returns {object} The fake server: `requests`, `failNext`, `respond`, and `fetch`.
 */
function createFakeVv() {
    const requests = [];
    const failures = [];
    const routes = [];

    const fake = {
        requests,
        /**
         * Queues connection errors for the next requests whose path ends with `pathSuffix`.
         * @param {string} pathSuffix - The URL path suffix to match.
         * @param {string[]} codes - One error code per failed attempt, in order.
         */
        failNext(pathSuffix, codes) {
            for (const code of codes) {
                failures.push({ pathSuffix, code });
            }
        },
        /**
         * Sets the response for requests whose path ends with `pathSuffix`.
         * @param {string} pathSuffix - The URL path suffix to match.
         * @param {Function} handler - Returns a `Response` for the request.
         */
        respond(pathSuffix, handler) {
            routes.unshift({ pathSuffix, handler });
        },
        fetch: vi.fn(async (input, init = {}) => {
            const url = new URL(String(input));
            let body = init.body;
            if (body instanceof FormData) {
                body = await new Response(body).text();
            } else if (body instanceof URLSearchParams) {
                body = body.toString();
            }
            requests.push({ url: url.toString(), path: url.pathname, method: init.method || 'GET', headers: init.headers, body });

            const failureIndex = failures.findIndex(f => url.pathname.endsWith(f.pathSuffix));
            if (failureIndex !== -1) {
                const [failure] = failures.splice(failureIndex, 1);
                throw connectionError(failure.code);
            }

            const route = routes.find(r => url.pathname.endsWith(r.pathSuffix));
            if (route) {
                return route.handler({ url, init, body });
            }
            if (url.pathname.includes('/configuration/')) {
                return Response.json({});
            }
            return Response.json({ meta: { status: 404 } }, { status: 404 });
        }),
    };

    return fake;
}

/**
 * Builds a client from a JWT that is valid for an hour, so no token request is made.
 * @returns {Promise<import('../../../lib/VVRestApi.js').VVClient>}
 */
function clientFromValidJwt() {
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    return new Authorize().getVaultApiFromJwt('jwt-token', BASE_URL, 'cust', 'db', expires);
}

/**
 * Fakes only the timers the retry backoff uses, so fetch body encoding still runs on real I/O.
 */
function useFakeTimers() {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
}

/**
 * Lets a pending call run to completion while fake timers are installed.
 * @param {Promise} promise - The call under test.
 * @returns {Promise<{value: *, error: *}>} The settled value or error.
 */
async function settle(promise) {
    let settled = false;
    const result = promise.then(value => ({ value }), error => ({ error }));
    result.finally(() => { settled = true; });
    while (!settled) {
        await vi.runAllTimersAsync();
        await new Promise(resolve => setImmediate(resolve));
    }
    return result;
}

describe('connection retry', () => {
    let vv;

    beforeEach(() => {
        vv = createFakeVv();
        vi.stubGlobal('fetch', vv.fetch);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('returns the response of a CRUD call that succeeds after a refused connection', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/sites/site-1/users', () => Response.json({ data: [{ name: 'alice' }] }));
        vv.failNext('/sites/site-1/users', ['ECONNREFUSED']);
        useFakeTimers();

        const { value, error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error).toBeUndefined();
        expect(JSON.parse(value)).toEqual({ data: [{ name: 'alice' }] });
    });

    it('gives the caller the connection error after 3 failed retries', async () => {
        const client = await clientFromValidJwt();
        vv.failNext('/sites/site-1/users', ['ECONNRESET', 'ECONNRESET', 'ECONNRESET', 'ECONNRESET']);
        useFakeTimers();

        const { error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error).toBeInstanceOf(TypeError);
        expect(error.cause.code).toBe('ECONNRESET');
        expect(vv.requests.filter(r => r.path.endsWith('/sites/site-1/users'))).toHaveLength(4);
    });

    it('waits 250 ms, then 500 ms, then 750 ms between attempts', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/sites/site-1/users', () => Response.json({ data: [] }));
        vv.failNext('/sites/site-1/users', ['ETIMEDOUT', 'ETIMEDOUT', 'ETIMEDOUT']);
        useFakeTimers();
        const attempts = () => vv.requests.filter(r => r.path.endsWith('/sites/site-1/users')).length;

        const call = client.users.getUsers({}, 'site-1');

        await vi.advanceTimersByTimeAsync(0);
        expect(attempts()).toBe(1);
        await vi.advanceTimersByTimeAsync(249);
        expect(attempts()).toBe(1);
        await vi.advanceTimersByTimeAsync(1);
        expect(attempts()).toBe(2);
        await vi.advanceTimersByTimeAsync(499);
        expect(attempts()).toBe(2);
        await vi.advanceTimersByTimeAsync(1);
        expect(attempts()).toBe(3);
        await vi.advanceTimersByTimeAsync(749);
        expect(attempts()).toBe(3);
        await vi.advanceTimersByTimeAsync(1);
        expect(attempts()).toBe(4);
        await call;
    });

    it('does not retry a connection error that is not in the retryable list', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/sites/site-1/users', () => Response.json({ data: [] }));
        vv.failNext('/sites/site-1/users', ['CERT_HAS_EXPIRED']);
        useFakeTimers();

        const { error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error.cause.code).toBe('CERT_HAS_EXPIRED');
        expect(vv.requests.filter(r => r.path.endsWith('/sites/site-1/users'))).toHaveLength(1);
    });

    it('does not retry an HTTP error response', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/sites/site-1/users', () => new Response('service unavailable', { status: 503 }));
        useFakeTimers();

        const { error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error.message).toBe('service unavailable');
        expect(vv.requests.filter(r => r.path.endsWith('/sites/site-1/users'))).toHaveLength(1);
    });

    it.each([401, 403])('does not retry a %d response and rejects with its meta as in 2.1.0', async (status) => {
        const client = await clientFromValidJwt();
        vv.respond('/sites/site-1/users', () => Response.json({ meta: { status, statusMsg: 'Denied' } }, { status }));
        useFakeTimers();

        const { error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error.message).toBe(JSON.stringify({ status, statusMsg: 'Denied' }));
        expect(vv.requests.filter(r => r.path.endsWith('/sites/site-1/users'))).toHaveLength(1);
    });

    it('still retries a 429 response', async () => {
        const client = await clientFromValidJwt();
        let calls = 0;
        vv.respond('/sites/site-1/users', () => {
            calls++;
            return calls === 1
                ? Response.json({ meta: { status: 429 } }, { status: 429 })
                : Response.json({ data: [] });
        });
        useFakeTimers();

        const { value, error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error).toBeUndefined();
        expect(JSON.parse(value)).toEqual({ data: [] });
        expect(calls).toBe(2);
    });

    it('sends the full upload body again when a stream upload is retried', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/files', () => Response.json({ data: { id: 'file-1' } }));
        vv.failNext('/files', ['ECONNRESET']);
        useFakeTimers();

        const { value, error } = await settle(
            client.files.postFile({ documentId: 'doc-1', fileName: 'a.txt' }, Buffer.from('file contents'))
        );

        expect(error).toBeUndefined();
        expect(JSON.parse(value)).toEqual({ data: { id: 'file-1' } });
        const uploads = vv.requests.filter(r => r.path.endsWith('/files'));
        expect(uploads).toHaveLength(2);
        expect(uploads[1].method).toBe('POST');
        expect(uploads[1].body).toContain('doc-1');
        expect(uploads[1].body).toContain('filename="a.txt"');
        expect(uploads[1].body).toContain('file contents');
    });

    it('returns the file bytes of a stream download that succeeds after a DNS failure', async () => {
        const client = await clientFromValidJwt();
        vv.respond('/files/file-1', () => new Response(Buffer.from('downloaded bytes')));
        vv.failNext('/files/file-1', ['EAI_AGAIN']);
        useFakeTimers();

        const { value, error } = await settle(client.files.getFileBytesId('file-1'));

        expect(error).toBeUndefined();
        expect(value.toString()).toBe('downloaded bytes');
    });

    it('acquires a token when the token request first hits an unreachable host', async () => {
        vv.respond('/OAuth/Token', () => Response.json({
            access_token: 'access-1', expires_in: 3600, refresh_token: 'refresh-1', token_type: 'bearer',
        }));
        vv.failNext('/OAuth/Token', ['EHOSTUNREACH']);
        useFakeTimers();

        const { value: client, error } = await settle(
            new Authorize().getVaultApi('client-id', 'client-secret', 'user', 'pass', '', BASE_URL, 'cust', 'db')
        );

        expect(error).toBeUndefined();
        expect(client.getSecurityToken()).toBe('access-1');
        const tokenRequests = vv.requests.filter(r => r.path === '/OAuth/Token');
        expect(tokenRequests).toHaveLength(2);
        expect(new URLSearchParams(tokenRequests[1].body).get('grant_type')).toBe('password');
    });

    it('acquires a JWT when the JWT request first gets a reset connection', async () => {
        const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        vv.respond('/users/getjwt', () => Response.json({ data: { token: 'jwt-2', expires } }));
        vv.failNext('/users/getjwt', ['ECONNRESET']);
        useFakeTimers();

        const { value: client, error } = await settle(
            new Authorize().getVaultApiFromJwt('jwt-1', BASE_URL, 'cust', 'db')
        );

        expect(error).toBeUndefined();
        expect(client.getSecurityToken()).toBe('jwt-2');
        const jwtRequests = vv.requests.filter(r => r.path === `${API_PREFIX}/users/getjwt`);
        expect(jwtRequests).toHaveLength(2);
    });

    it('refreshes an expiring token when the refresh request first times out', async () => {
        let issued = 0;
        let failNextRefresh = false;
        vv.respond('/OAuth/Token', ({ body }) => {
            if (new URLSearchParams(body).get('grant_type') === 'refresh_token' && failNextRefresh) {
                failNextRefresh = false;
                throw connectionError('ETIMEDOUT');
            }
            issued++;
            return Response.json({ access_token: `access-${issued}`, expires_in: 10, refresh_token: `refresh-${issued}`, token_type: 'bearer' });
        });
        vv.respond('/sites/site-1/users', () => Response.json({ data: [] }));
        const client = await new Authorize().getVaultApi('client-id', 'client-secret', 'user', 'pass', '', BASE_URL, 'cust', 'db');
        const firstRequestAfterSetup = vv.requests.length;
        failNextRefresh = true;
        useFakeTimers();

        const { value, error } = await settle(client.users.getUsers({}, 'site-1'));

        expect(error).toBeUndefined();
        expect(JSON.parse(value)).toEqual({ data: [] });
        const grants = vv.requests.slice(firstRequestAfterSetup)
            .filter(r => r.path === '/OAuth/Token')
            .map(r => new URLSearchParams(r.body).get('grant_type'));
        expect(grants).toEqual(['refresh_token', 'refresh_token']);
        const usersRequest = vv.requests.find(r => r.path.endsWith('/sites/site-1/users'));
        expect(usersRequest.headers.Authorization).toBe(`Bearer access-${issued}`);
    });
});
