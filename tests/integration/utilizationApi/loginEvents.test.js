import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
// Import setup.js FIRST to ensure dotenv loads before checking env vars
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

/** How far back the suite queries when no lookback is configured. */
const DEFAULT_LOOKBACK_DAYS = 30;

const UTILIZATION_ABSENT =
  'The instance reports no Utilization service, so client.utilization is null. ' +
  'This suite needs an instance with Utilization enabled.';

/**
 * Builds a date a number of days from today.
 * @param {number} days - Days to add; negative moves into the past.
 * @returns {Date} The date, carrying today's time of day. Days are counted on the UTC calendar.
 */
function daysFromToday(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

// A range a year ahead of today. Utilization data only ever covers days that have passed, so no instance has a
// LoginEvent in this range.
const emptyRangeStart = daysFromToday(365);
const emptyRangeEnd = daysFromToday(366);

describeIf(canRunIntegrationTests())('LoginEventsManager Integration Tests', () => {
  let config;
  let client;
  let startDate;
  let endDate;

  beforeAll(async () => {
    config = getTestConfig();

    const lookbackDays = config.testUtilizationLookbackDays === null
      ? DEFAULT_LOOKBACK_DAYS
      : Number(config.testUtilizationLookbackDays);

    expect(
      Number.isInteger(lookbackDays) && lookbackDays > 0,
      'VV_TEST_UTILIZATION_LOOKBACK_DAYS should be a whole number of days greater than zero'
    ).toBe(true);

    startDate = daysFromToday(-lookbackDays);
    endDate = daysFromToday(0);

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

  beforeEach((ctx) => {
    ctx.skip(client.utilization === null, UTILIZATION_ABSENT);
  });

  describe('getLoginEvents', () => {
    it('should return LoginEvents carrying the contract fields', async () => {
      const response = await client.utilization.loginEvents.getLoginEvents({ startDate, endDate });

      expect(response, 'getLoginEvents should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data, 'Response should have meta property').toHaveProperty('meta');
      expect(data.meta.status, 'getLoginEvents should return success status').toBe(200);
      expect(data, 'Response should have data property').toHaveProperty('data');
      expect(Array.isArray(data.data.rows), 'data.rows should be an array').toBe(true);
      expect(
        data.data.rows.length,
        'The queried window should hold at least one LoginEvent; raise VV_TEST_UTILIZATION_LOOKBACK_DAYS to reach ' +
        'a window that has data'
      ).toBeGreaterThan(0);
      expect(data.data.dataVersion, 'A page should report the DataVersion behind it').toEqual(expect.any(String));
      expect(data.data.minEventDate, 'A page should report the earliest day the data covers').toEqual(
        expect.any(String)
      );

      const [row] = data.data.rows;

      expect(row.eventId, 'A LoginEvent should carry an eventId').toEqual(expect.any(String));
      expect(row.eventTime, 'A LoginEvent should carry an eventTime').toEqual(expect.any(String));
      expect(row.eventType, 'A LoginEvent should be a UserLoginEvent').toBe('UserLoginEvent');
      expect(['UI', 'API'], 'loginType should name the surface the user came in through').toContain(row.loginType);
      expect(row.databaseId, 'A LoginEvent should carry a databaseId').toEqual(expect.any(String));
      expect(row.usId, 'A LoginEvent should carry the user who logged in').toEqual(expect.any(String));
    });

    it('should return an empty collection for a range holding no LoginEvents', async () => {
      const response = await client.utilization.loginEvents.getLoginEvents({
        startDate: emptyRangeStart,
        endDate: emptyRangeEnd
      });

      const data = JSON.parse(response);

      expect(data.meta.status, 'An empty range should return success status').toBe(200);
      expect(data.data.rows, 'An empty range should return no rows').toEqual([]);
    });
  });

  describe('iterateLoginEvents', () => {
    it('should have its default page size accepted by the service', async () => {
      let firstPage = null;

      // The iterator sends the largest page size the service is documented to accept. A service that refuses that
      // size fails every default walk, and the one-row walk below sends a size small enough to hide it.
      for await (const page of client.utilization.loginEvents.iterateLoginEvents({ startDate, endDate })) {
        firstPage = JSON.parse(page);
        break;
      }

      expect(firstPage, 'The walk should yield a page').not.toBeNull();
      expect(firstPage.meta.status, 'The default page size should return success status').toBe(200);
    });

    it('should cross a page boundary onto a different LoginEvent', async () => {
      const pages = [];

      for await (const page of client.utilization.loginEvents.iterateLoginEvents({
        startDate,
        endDate,
        take: 1
      })) {
        pages.push(JSON.parse(page));

        // Two pages are enough to show the Cursor advanced; walking the rest would read every LoginEvent in the range.
        if (pages.length === 2) {
          break;
        }
      }

      expect(
        pages.length,
        'The queried window should hold at least two LoginEvents, so that a walk of one row per page crosses a ' +
        'page boundary; raise VV_TEST_UTILIZATION_LOOKBACK_DAYS to reach a window that has data'
      ).toBe(2);
      expect(pages[0].meta.nextCursor, 'The first page should offer a Cursor onto the next').toEqual(
        expect.any(String)
      );
      expect(pages[0].data.rows, 'The first page should hold the one row it asked for').toHaveLength(1);
      expect(pages[1].data.rows, 'The second page should hold the one row it asked for').toHaveLength(1);
      expect(
        pages[1].data.rows[0].eventId,
        'The second page should hold a different LoginEvent than the first'
      ).not.toBe(pages[0].data.rows[0].eventId);
    });

    it('should end the walk on a range holding no LoginEvents', async () => {
      const pages = [];

      for await (const page of client.utilization.loginEvents.iterateLoginEvents({
        startDate: emptyRangeStart,
        endDate: emptyRangeEnd
      })) {
        pages.push(JSON.parse(page));
      }

      expect(pages, 'An empty range should yield one page and end the walk').toHaveLength(1);
      expect(pages[0].meta.status, 'The one page should return success status').toBe(200);
      expect(pages[0].data.rows, 'The one page should hold no rows').toEqual([]);
      expect(pages[0].meta.nextCursor ?? null, 'The last page should offer no following Cursor').toBeNull();
    });
  });
});
