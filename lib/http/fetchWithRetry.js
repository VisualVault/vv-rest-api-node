import createDebug from 'debug';

const debug = createDebug('visualvault:http');

const RETRYABLE_CODES = new Set(['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'EAI_AGAIN']);
const MAX_RETRIES = 3;
const RETRY_DELAY_STEP_MS = 250;

/**
 * Gets the system error code of a connection failure.
 * @param {*} error - The value fetch() rejected with.
 * @returns {string|undefined} The code from the error or its `cause`, or undefined when neither has one.
 */
function connectionErrorCode(error) {
    return error?.code ?? error?.cause?.code;
}

/**
 * Calls fetch() and retries when no HTTP response comes back.
 *
 * Retries up to 3 times on a connection error (`ECONNREFUSED`, `ECONNRESET`, `ETIMEDOUT`,
 * `ESOCKETTIMEDOUT`, `ENOTFOUND`, `EHOSTUNREACH`, `EAI_AGAIN`), waiting 250 ms times the attempt number.
 * Every method is retried, so a reset after the request was sent can repeat a write.
 * @param {string} url - The request URL.
 * @param {RequestInit} init - The fetch() options. The body must be reusable (not a stream).
 * @returns {Promise<Response>} The first HTTP response, whatever its status.
 * @throws {Error} The last connection error when every attempt fails, or any other fetch() error at once.
 */
export async function fetchWithRetry(url, init) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fetch(url, init);
        } catch (error) {
            const code = connectionErrorCode(error);
            if (!RETRYABLE_CODES.has(code) || attempt > MAX_RETRIES) {
                throw error;
            }
            debug('Connection error (%s) calling %s - retrying, attempt %d of %d', code, url, attempt, MAX_RETRIES);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_STEP_MS * attempt));
        }
    }
}

export default fetchWithRetry;
