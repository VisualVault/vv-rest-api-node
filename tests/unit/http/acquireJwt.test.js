import { afterEach, describe, expect, it, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';

const BASE_URL = 'https://vault.test';
const API_URL = '/api/v1/cust/db';
const AUTH_URL = '/api/v1/cust/db/users/getjwt';
const CALLER_JWT = 'caller-jwt';

/**
 * Stubs global `fetch` with a single response, recording each request it receives.
 * @param {number} status - The HTTP status to answer with.
 * @param {object} body - The JSON body to answer with.
 * @returns {Array<{ url: string, method: string, authorization: string }>} The requests received.
 */
function stubFetch(status, body) {
    const requests = [];
    vi.stubGlobal('fetch', async (input, init = {}) => {
        requests.push({ url: String(input), method: init.method, authorization: init.headers?.Authorization });
        return new Response(JSON.stringify(body), { status });
    });
    return requests;
}

const acquire = () => new Authorize().acquireJwt(CALLER_JWT, BASE_URL, API_URL, AUTH_URL, 'cust', 'db');

describe('Authorize.acquireJwt', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('builds a JWT session from the issuer response, presenting the caller JWT as the bearer', async () => {
        const expires = '2030-01-01T00:00:00Z';
        const requests = stubFetch(200, { data: { token: 'issued-jwt', expires } });

        const session = await acquire();

        expect(requests).toEqual([{ url: BASE_URL + AUTH_URL, method: 'GET', authorization: 'Bearer ' + CALLER_JWT }]);
        expect(session.accessToken).toBe('issued-jwt');
        expect(session.expirationDate).toEqual(new Date(expires));
        expect(session.isJwt).toBe(true);
        expect(session.isAuthenticated).toBe(true);
        expect(session.baseUrl).toBe(BASE_URL);
        expect(session.apiUrl).toBe(API_URL);
    });

    it('rejects when the issuer refuses the caller JWT', async () => {
        stubFetch(401, { message: 'denied' });

        await expect(acquire()).rejects.toThrow(/Authorization has been refused for current credentials \(HTTP 401\)/);
    });

    it('rejects with a clear error when the issuer response carries no token', async () => {
        stubFetch(200, { data: null });

        await expect(acquire()).rejects.toThrow('the issuer response carries no data.token');
    });
});
