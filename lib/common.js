// Re-export the modernized HTTP modules
export { HttpHelper as httpHelper } from './http/httpHelper.js';
export { SessionToken as sessionToken } from './http/sessionToken.js';
export { Authorize as authorize } from './http/authorize.js';

// Default export for backward compatibility
import { HttpHelper } from './http/httpHelper.js';
import { SessionToken } from './http/sessionToken.js';
import { Authorize } from './http/authorize.js';

export default {
    httpHelper: HttpHelper,
    sessionToken: SessionToken,
    authorize: Authorize
};
