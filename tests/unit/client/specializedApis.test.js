import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Authorize } from '../../../lib/VVRestApi.js';

const VAULT_URL = 'https://vault.test';
const API_PATH = '/api/v1/cust/db';
const AUDIENCE = 'test-audience';
const HELD_JWT = 'caller-held-jwt';

/**
 * Every specialized API a consumer reaches off an authorized client, with the configuration each is discovered
 * from. `data` is the payload that route answers with, carrying the property that names the service host.
 * @type {Array<{ property: string, route: string, data: object }>}
 */
const SPECIALIZED_APIS = [
    { property: 'docApi', route: 'docapi', data: { isEnabled: true, apiUrl: 'https://doc.test' } },
    { property: 'formsApi', route: 'formsapi', data: { isEnabled: true, formsApiUrl: 'https://forms.test' } },
    { property: 'objectsApi', route: 'objectsapi', data: { isEnabled: true, apiUrl: 'https://objects.test' } },
    { property: 'studioApi', route: 'studioapi', data: { isEnabled: true, studioApiUrl: 'https://studio.test' } },
    { property: 'notificationsApi', route: 'notificationapi', data: { isEnabled: true, apiUrl: 'https://notify.test' } },
    { property: 'utilization', route: 'utilizationapi', data: { isEnabled: true, utilizationApiUrl: 'https://utilization.test' } },
];

const EVERY_PROPERTY = SPECIALIZED_APIS.map(({ property }) => property);

/**
 * Builds a fake VisualVault server for global `fetch` on which every specialized API is discoverable.
 * @returns {{ fetch: Function }} The fake server.
 */
function createFakeVvServer() {
    const json = (status, body) => new Response(JSON.stringify(body), { status });
    let jwtsIssued = 0;

    const fetch = async (input, init = {}) => {
        const url = new URL(input);
        const method = init.method || 'GET';

        if (url.origin === VAULT_URL && url.pathname === '/OAuth/Token' && method === 'POST') {
            return json(200, { access_token: 'oauth-token', expires_in: 3600, refresh_token: 'refresh', token_type: 'Bearer' });
        }
        if (url.origin === VAULT_URL && url.pathname === `${API_PATH}/users/getjwt`) {
            jwtsIssued += 1;
            const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            return json(200, { meta: { status: 200 }, data: { token: `jwt-${jwtsIssued}`, expires } });
        }

        const discovered = SPECIALIZED_APIS.find(
            ({ route }) => url.origin === VAULT_URL && url.pathname === `${API_PATH}/configuration/${route}`);
        if (discovered) {
            return json(200, { meta: { status: 200 }, data: discovered.data });
        }

        return json(404, { meta: { status: 404, statusMsg: `No fake route for ${method} ${url}` } });
    };

    return { fetch };
}

/**
 * Reads which specialized APIs an authorized client carries.
 * @param {import('../../../lib/VVRestApi.js').VVClient} client - The authorized client.
 * @returns {Array<string>} The property name of each specialized API the client holds, in declaration order.
 */
function specializedApisOn(client) {
    return EVERY_PROPERTY.filter((property) => client[property] !== null && client[property] !== undefined);
}

/**
 * The ways a consumer authorizes, each reaching a different branch of `Authorize`.
 * @type {Array<{ path: string, authorize: () => Promise<import('../../../lib/VVRestApi.js').VVClient> }>}
 */
const AUTHORIZATION_PATHS = [
    {
        path: 'getVaultApi',
        authorize: () => new Authorize()
            .getVaultApi('client-id', 'client-secret', 'script.user', 'password', AUDIENCE, VAULT_URL, 'cust', 'db'),
    },
    {
        path: 'getVaultApiFromJwt, with a JWT still valid',
        authorize: () => new Authorize()
            .getVaultApiFromJwt(HELD_JWT, VAULT_URL, 'cust', 'db', new Date(Date.now() + 60 * 60 * 1000)),
    },
    {
        path: 'getVaultApiFromJwt, exchanging a JWT with no expiration',
        authorize: () => new Authorize().getVaultApiFromJwt(HELD_JWT, VAULT_URL, 'cust', 'db'),
    },
];

describe('specialized API creation', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', createFakeVvServer().fetch);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe.each(AUTHORIZATION_PATHS)('authorizing through $path', ({ authorize }) => {
        it('carries every specialized API the instance makes discoverable', async () => {
            const client = await authorize();

            expect(specializedApisOn(client)).toEqual(EVERY_PROPERTY);
        });
    });
});
