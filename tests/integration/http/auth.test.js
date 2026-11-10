import { describe, it, expect, beforeAll } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('Authentication Integration Tests', () => {
  let config;
  let client;

  beforeAll(async () => {
    config = getTestConfig();

    // Authenticate once and reuse for tests that need a valid client
    const auth = new Authorize();
    client = await auth.getVaultApi(
      config.clientId,
      config.clientSecret,
      config.username,
      config.password,
      config.audience,
      config.baseUrl,
      config.customerAlias,
      config.databaseAlias
    );
  }, 60000);

  describe('OAuth Authentication', () => {
    it('should authenticate with valid credentials and return a client', () => {
      expect(client, 'Auth should return a client object').toBeDefined();
      expect(client.isAuthenticated(), 'Client should be authenticated').toBe(true);
      expect(client.getSecurityToken(), 'Client should have a security token').toBeTruthy();
      expect(client.getBaseUrl(), 'Client should have correct base URL').toBe(config.baseUrl);
    });

    it('should fail authentication with invalid user credentials', async () => {
      const auth = new Authorize();

      await expect(
        auth.getVaultApi(
          config.clientId,
          config.clientSecret,
          'invalid-user',
          'invalid-password',
          config.audience,
          config.baseUrl,
          config.customerAlias,
          config.databaseAlias
        )
      ).rejects.toThrow(/invalid|unauthorized|denied/i);
    });

    it('should fail authentication with invalid client credentials', async () => {
      const auth = new Authorize();

      await expect(
        auth.getVaultApi(
          'invalid-client-id',
          'invalid-client-secret',
          config.username,
          config.password,
          config.audience,
          config.baseUrl,
          config.customerAlias,
          config.databaseAlias
        )
      ).rejects.toThrow(/invalid|unauthorized|denied/i);
    });
  });

  describe('Client Initialization', () => {
    it('should initialize all API managers after authentication', () => {
      // Core managers should be available
      expect(client.users, 'users manager should be initialized').toBeDefined();
      expect(client.forms, 'forms manager should be initialized').toBeDefined();
      expect(client.documents, 'documents manager should be initialized').toBeDefined();
      expect(client.library, 'library manager should be initialized').toBeDefined();
      expect(client.groups, 'groups manager should be initialized').toBeDefined();
      expect(client.sites, 'sites manager should be initialized').toBeDefined();
      expect(client.files, 'files manager should be initialized').toBeDefined();
      expect(client.email, 'email manager should be initialized').toBeDefined();
      expect(client.customQuery, 'customQuery manager should be initialized').toBeDefined();
      expect(client.scripts, 'scripts manager should be initialized').toBeDefined();
    });
  });

  describe('JWT Authentication', () => {
    let jwt;
    let jwtExpires;
    let passwordUserId;

    beforeAll(async () => {
      const jwtResponse = JSON.parse(await client.users.getUserJwt());
      jwt = jwtResponse.data.token;
      jwtExpires = new Date(jwtResponse.data.expires);

      const userResponse = JSON.parse(await client.currentUser.getCurrentUser({}));
      passwordUserId = userResponse.data.id;
    }, 60000);

    it('should return a working client from a JWT with a valid expiration date', async () => {
      const auth = new Authorize();
      const jwtClient = await auth.getVaultApiFromJwt(
        jwt,
        config.baseUrl,
        config.customerAlias,
        config.databaseAlias,
        jwtExpires
      );

      const response = JSON.parse(await jwtClient.currentUser.getCurrentUser({}));
      expect(response.meta.status, 'getCurrentUser with the JWT client should return success status').toBe(200);
      expect(response.data.id, 'JWT client should act as the same user as the password login').toBe(passwordUserId);
    });

    it('should exchange a JWT with no expiration date and return a working client', async () => {
      const auth = new Authorize();
      const jwtClient = await auth.getVaultApiFromJwt(
        jwt,
        config.baseUrl,
        config.customerAlias,
        config.databaseAlias
      );

      const response = JSON.parse(await jwtClient.currentUser.getCurrentUser({}));
      expect(response.meta.status, 'getCurrentUser with the exchanged JWT client should return success status').toBe(200);
      expect(response.data.id, 'Exchanged JWT client should act as the same user as the password login').toBe(passwordUserId);
    });
  });
});
