/**
 * Barrel file for visualvault-node package.
 * Re-exports all public APIs for convenient single-import usage.
 *
 * @example
 * // Import everything from package root
 * import { Authorize, VVClient, RoleType, MemberType } from 'visualvault-node';
 *
 * // Or import just what you need from subpaths
 * import { Authorize } from 'visualvault-node';
 * import { RoleType, MemberType } from 'visualvault-node/constants';
 */

// Main API exports
export { VVClient, Authorize } from './VVRestApi.js';
export { default } from './VVRestApi.js';

// Constants exports
export { RoleType, MemberType, CompletionTarget } from './constants.js';

// Utilization exports
export { StaleCursorError } from './utilizationApi/staleCursorError.js';

// Utilization response types, for casting a parsed LoginEvent response
/**
 * @typedef {import('./utilizationApi/loginEventsManager.js').LoginEvent} LoginEvent
 * @typedef {import('./utilizationApi/loginEventsManager.js').LoginEventsPage} LoginEventsPage
 * @typedef {import('./utilizationApi/loginEventsManager.js').LoginEventsMeta} LoginEventsMeta
 * @typedef {import('./utilizationApi/loginEventsManager.js').LoginEventsResponse} LoginEventsResponse
 */
