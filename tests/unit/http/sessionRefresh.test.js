import { afterEach, describe, expect, it, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';

const VAULT_URL = 'https://vault.test';
const API_PATH = '/api/v1/cust/db';
const AUDIENCE = 'test-audience';
const JWT_LIFETIME_MS = 60 * 1000;
const HELD_JWT = 'caller-held-jwt';

const SITES_ENVELOPE = {
    meta: { status: 200, message: 'OK', errors: [] },
    data: [{ id: '3f8a1c20-0000-4000-8000-00000000000a', name: 'Default Site' }],
};

/**
 * Builds a fake VVCore for global `fetch`.
 *
 * Its routes refuse a caller presenting a token past its expiry, so a session that never refreshes fails here.
 * @param {object} [options]
 * @param {boolean} [options.jwtAvailable] - Whether VVCore issues a JWT, leaving the client on its OAuth token
 *   when it does not. Defaults to issuing one.
 * @param {boolean} [options.refreshTokenAccepted] - Whether the token endpoint honors a `refresh_token` grant,
 *   driving the session onto the password grant when it does not. Defaults to honoring it.
 * @returns {{ fetch: Function, requests: Array<object> }} `fetch` to stub globally, and every request it received.
 */
function createFakeVvCore({ jwtAvailable = true, refreshTokenAccepted = true } = {}) {
    const requests = [];
    let tokensIssued = 0;
    /** Every token this server has issued, against the instant it stops being valid. */
    const expiries = new Map();

    const json = (status, body) => new Response(JSON.stringify(body), { status });

    /**
     * Records the expiry of a token this server is about to hand out.
     * @param {string} token - The token being issued.
     * @returns {number} The instant it stops being valid, in epoch milliseconds.
     */
    const issue = (token) => {
        const expiresAt = Date.now() + JWT_LIFETIME_MS;
        expiries.set(token, expiresAt);
        return expiresAt;
    };
    const expired = (token) => expiries.has(token) && expiries.get(token) <= Date.now();

    const fetch = async (input, init = {}) => {
        const url = new URL(input);
        const method = init.method || 'GET';
        const bearer = ((init.headers || {}).Authorization || '').replace('Bearer ', '');
        const body = init.body instanceof URLSearchParams ? init.body : new URLSearchParams();
        requests.push({ path: url.pathname, method, authorization: bearer, grantType: body.get('grant_type') });

        if (url.pathname === '/OAuth/Token' && method === 'POST') {
            if (body.get('grant_type') === 'refresh_token' && !refreshTokenAccepted) {
                return json(400, { error: 'invalid_grant' });
            }
            tokensIssued += 1;
            const accessToken = `oauth-${tokensIssued}`;
            issue(accessToken);
            return json(200, { access_token: accessToken, expires_in: JWT_LIFETIME_MS / 1000, refresh_token: 'refresh', token_type: 'Bearer' });
        }

        if (url.pathname === `${API_PATH}/users/getjwt`) {
            if (!jwtAvailable) {
                return json(200, { meta: { status: 403, errors: [{ message: 'No JWT for this user' }] }, data: null });
            }
            if (expired(bearer)) {
                return json(401, { meta: { status: 401, statusMsg: 'Token expired' } });
            }
            tokensIssued += 1;
            const token = `jwt-${tokensIssued}`;
            return json(200, { meta: { status: 200 }, data: { token, expires: new Date(issue(token)).toISOString() } });
        }
        if (url.pathname === `${API_PATH}/sites` && method === 'GET') {
            if (expired(bearer)) {
                return json(401, { meta: { status: 401, statusMsg: 'Token expired' } });
            }
            return json(200, SITES_ENVELOPE);
        }
        // No specialized API is configured, keeping this fake to the VVCore routes under test.
        if (url.pathname.startsWith(`${API_PATH}/configuration/`)) {
            return json(200, { meta: { status: 200 }, data: null });
        }
        return json(404, { meta: { status: 404, statusMsg: `No fake route for ${method} ${url}` } });
    };

    return { fetch, requests };
}

describe('a VVCore manager on a session whose token has expired', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('refreshes the session and serves the call', async () => {
        const startedAt = new Date('2026-03-05T12:00:00Z');
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(startedAt);

        const server = createFakeVvCore();
        vi.stubGlobal('fetch', server.fetch);
        const client = await new Authorize()
            .getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db');

        // Past the expiry of the JWT issued at authentication, so the call must refresh before it can be served.
        vi.setSystemTime(new Date(startedAt.getTime() + JWT_LIFETIME_MS + 1000));
        const sites = await client.sites.getSites();

        expect(JSON.parse(sites)).toEqual(SITES_ENVELOPE);
    });

    it('falls back to the password grant when the refresh token is refused, and serves the call', async () => {
        const startedAt = new Date('2026-03-05T12:00:00Z');
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(startedAt);

        // No JWT for this user, so the session stays on its OAuth token; with the refresh grant refused too,
        // the only way back is the password grant.
        const server = createFakeVvCore({ jwtAvailable: false, refreshTokenAccepted: false });
        vi.stubGlobal('fetch', server.fetch);
        const client = await new Authorize()
            .getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db');

        vi.setSystemTime(new Date(startedAt.getTime() + JWT_LIFETIME_MS + 1000));
        const sites = await client.sites.getSites();

        expect(JSON.parse(sites)).toEqual(SITES_ENVELOPE);
    });

    it('renews a caller-supplied JWT, which carries no credentials to fall back on', async () => {
        const startedAt = new Date('2026-03-05T12:00:00Z');
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(startedAt);

        const server = createFakeVvCore();
        vi.stubGlobal('fetch', server.fetch);
        const client = await new Authorize().getVaultApiFromJwt(
            HELD_JWT, VAULT_URL, 'cust', 'db', new Date(startedAt.getTime() + JWT_LIFETIME_MS));

        // Inside the 30-second window but before the token dies, which is when a refresh normally fires.
        vi.setSystemTime(new Date(startedAt.getTime() + JWT_LIFETIME_MS - 15 * 1000));
        const sites = await client.sites.getSites();

        expect(JSON.parse(sites)).toEqual(SITES_ENVELOPE);
    });
});
