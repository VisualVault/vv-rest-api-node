import StaleCursorError from './staleCursorError.js';

/**
 * One occurrence of a user signing in to a Database, through the UI or through the API.
 *
 * Database, Customer and user identity repeat on every row, so a response loads straight into a warehouse table.
 * Every GUID and date arrives as a string.
 * @typedef {object} LoginEvent
 * @property {string} eventId - The row's only stable identifier, as a hex string.
 * @property {string} eventTime - When the login happened, UTC to millisecond precision. Also the field the feed is
 *   sorted and paged by.
 * @property {string} eventType - The kind of event the row is, always `UserLoginEvent` on this route.
 * @property {string} loginType - Which surface the user came in through: `UI` for an interactive sign-in, `API` for
 *   a token-authenticated call.
 * @property {string} databaseId - The Database the login happened in, which is always the caller's own.
 * @property {string|null} databaseName - The Database's name as recorded when the row was loaded, not a live lookup.
 * @property {string|null} customerId - The Customer owning `databaseId`.
 * @property {string|null} customerName - The Customer's name, recorded on the row like `databaseName`.
 * @property {string} usId - Who logged in, as the user record inside `databaseId`.
 * @property {string|null} userName - The name the account signs in with.
 * @property {string|null} userDisplayName - The user's name for showing a row to a human. Not an identifier, and
 *   not necessarily unique.
 * @property {string|null} authenticationUserId - The authentication account the sign-in was made with, where the
 *   row carries one.
 * @property {string|null} instanceId - Always null: the service does not populate this field.
 * @property {string|null} instanceUrl - The base URL of the instance that served the login.
 */

/**
 * The `data` of a successful LoginEvent response: the rows, and the freshness stamp of the data behind them.
 * @typedef {object} LoginEventsPage
 * @property {string|null} dataVersion - The day the Utilization data was last loaded, `yyyy-MM-dd`, and null when
 *   no load has run.
 * @property {string|null} minEventDate - The earliest day the loaded data covers, and null when no load has run.
 *   It reports coverage, not the oldest date the service will accept.
 * @property {LoginEvent[]} rows - The matching LoginEvents, empty when nothing matched.
 */

/**
 * The envelope of a LoginEvent response, carrying the outcome and the Cursor that reaches the next page.
 * @typedef {object} LoginEventsMeta
 * @property {number} status - The HTTP status the request would have had. The service answers every request with
 *   HTTP 200, so this is the only place a failure is reported.
 * @property {string|null} [message] - A description of the outcome.
 * @property {Array<{message?: string|null, code?: string|null, translation?: string|null}>|null} [errors] - The
 *   errors behind a failing `status`.
 * @property {string|null} [nextCursor] - The Cursor that reaches the page after this one, absent when the caller
 *   has everything.
 */

/**
 * A parsed LoginEvent response, as `JSON.parse` of what `getLoginEvents` returns.
 *
 * `getLoginEvents` returns the response unparsed, so a caller who wants these types casts the parse:
 * `JSON.parse(raw) as LoginEventsResponse` in TypeScript, or a `@type` annotation in JavaScript.
 * @typedef {object} LoginEventsResponse
 * @property {LoginEventsMeta} meta - The outcome of the request. Check `meta.status` before consuming `data`.
 * @property {LoginEventsPage|null} data - The page, and null when the request failed.
 */

/** The largest page size the Utilization service accepts. */
const MAX_PAGE_SIZE = 1000;

/** The error code the Utilization service reports when a data load has ended a Cursor's validity. */
const STALE_CURSOR_CODE = '409.4';

/**
 * Reports whether an envelope refused the request because the Cursor is no longer valid.
 * @param {LoginEventsMeta} meta - The envelope's `meta`, as parsed.
 * @returns {boolean} True when the service reported the stale-Cursor error code.
 */
function isStaleCursor(meta) {
    return Array.isArray(meta?.errors) && meta.errors.some((error) => error?.code === STALE_CURSOR_CODE);
}

/**
 * Formats a date for the wire as `yyyy-MM-dd`.
 *
 * A `Date` is read from its UTC parts, so the caller's time zone never shifts the day they asked for. Anything
 * else is passed through untouched, for the service to validate.
 * @param {Date|string} date - A `Date`, or a string already in the form the service accepts.
 * @returns {Date|string} The formatted date, or the input unchanged when it is not a `Date`.
 */
function toWireDate(date) {
    if (!(date instanceof Date)) {
        return date;
    }

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${date.getUTCFullYear()}-${month}-${day}`;
}

/**
 * Sets a query parameter, unless the caller gave no value for it.
 * @param {object} params - The query parameters being built. Mutated.
 * @param {string} name - The parameter name on the wire.
 * @param {*} value - The value to set, where `undefined` and `null` mean "leave it out".
 * @returns {void}
 */
function addParam(params, name, value) {
    if (value !== undefined && value !== null) {
        params[name] = value;
    }
}

/**
 * Queries LoginEvents from the Utilization service.
 *
 * All methods resolve to a `Promise<string>` holding the JSON-encoded response. The service answers every request
 * with HTTP 200 and reports the real outcome in `meta.status`, so a caller must read `meta.status` before
 * consuming `data`. A failing envelope is returned, never thrown.
 */
export class LoginEventsManager {
    /**
     * @param {object} httpHelper - HTTP helper carrying the Utilization session and base URL.
     */
    constructor(httpHelper) {
        this._httpHelper = httpHelper;
    }

    /**
     * Retrieves one page of LoginEvents for a date range.
     *
     * Results are scoped to the caller's own Database, which the service takes from the token; no Database
     * identifier is sent. Both bounds are inclusive and interpreted in UTC, so a day boundary is a UTC boundary.
     * @param {object} options - The query.
     * @param {Date|string} options.startDate - The first day to report on, inclusive. A string is sent as given; a
     *   `Date` is formatted `yyyy-MM-dd` from its UTC parts.
     * @param {Date|string} options.endDate - The last day to report on, inclusive, on the same terms as `startDate`.
     * @param {number} [options.take] - How many rows to return. When omitted, the service applies its own default.
     * @param {string} [options.cursor] - The Cursor from the previous page's `meta.nextCursor`, to continue a walk.
     *   Opaque: hand back what was handed out, unmodified.
     * @param {object} [options.params] - Query parameters this wrapper does not name, sent as given. The four named
     *   options above win over any entry here that collides with them.
     * @returns {Promise<string>} The unparsed JSON response holding the page.
     */
    getLoginEvents({ startDate, endDate, take, cursor, params: extraParams }) {
        const resourceUri = this._httpHelper._config.ResourceUri.UtilizationApi.LoginEvents;
        const url = this._httpHelper.getUrl(resourceUri);
        const opts = { method: 'GET' };
        const params = { ...extraParams };

        // Omitted values stay off the query string: an `undefined` sent anyway reaches the service as the text
        // "undefined", which it reports as an unparseable date rather than a missing parameter.
        addParam(params, 'StartDate', toWireDate(startDate));
        addParam(params, 'EndDate', toWireDate(endDate));
        addParam(params, 'Take', take);
        addParam(params, 'Cursor', cursor);

        return this._httpHelper.doVvClientRequest(url, opts, params, null);
    }

    /**
     * Walks every page of LoginEvents in a date range, yielding one unparsed response per iteration.
     *
     * Only one page is held at a time, so a range covering hundreds of thousands of LoginEvents costs one page of
     * memory. The walk ends when the service offers no following Cursor.
     * @param {object} options - The query, on the same terms as `getLoginEvents`.
     * @param {Date|string} options.startDate - The first day to report on, inclusive.
     * @param {Date|string} options.endDate - The last day to report on, inclusive.
     * @param {number} [options.take] - How many rows to request per page. Defaults to the largest page the service
     *   allows, which makes the fewest round trips over a bulk walk.
     * @param {object} [options.params] - Query parameters this wrapper does not name, sent as given.
     * @yields {string} The unparsed JSON response holding one page, to parse as a single-page response.
     * @throws {StaleCursorError} A load of Utilization data ended the Cursor's validity part way through the walk.
     *   Every other failure is reported in the envelope and yielded to the caller.
     */
    async *iterateLoginEvents({ startDate, endDate, take = MAX_PAGE_SIZE, params }) {
        let cursor;

        for (;;) {
            const page = await this.getLoginEvents({ startDate, endDate, take, cursor, params });
            const { meta } = JSON.parse(page);

            if (cursor && isStaleCursor(meta)) {
                throw new StaleCursorError();
            }

            yield page;

            cursor = meta?.nextCursor;
            if (!cursor) {
                return;
            }
        }
    }
}

export default LoginEventsManager;
