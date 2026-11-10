/**
 * Security role types for folder and document permissions.
 * Use these constants when calling security member functions.
 *
 * @example
 * import { RoleType } from 'visualvault-node';
 *
 * await client.library.putFolderSecurityMember(
 *   folderId,
 *   memberId,
 *   'User',
 *   RoleType.Viewer,
 *   false
 * );
 */
export const RoleType = Object.freeze({
    None: 0,
    Owner: 1,
    Editor: 2,
    Publisher: 3,
    Viewer: 4,
    Member: 5
});


/**
 * Security member types for folder and document permissions.
 * Use these constants when calling security member functions.
 *
 * @example
 * import { RoleType } from 'visualvault-node';
 *
 * await client.library.putFolderSecurityMember(
 *   folderId,
 *   memberId,
 *   MemberType.User,
 *   RoleType.Viewer,
 *   false
 * );
 */
export const MemberType = Object.freeze({
    User: 0,
    Group: 1
});


/**
 * Completion target selectors for `VVClient.setCompletionTarget`.
 *
 * @example
 * import { CompletionTarget } from 'visualvault-api';
 *
 * client.setCompletionTarget(CompletionTarget.StudioApi);
 */
export const CompletionTarget = Object.freeze({
    StudioApi: 'studioapi'
});

export default { RoleType, MemberType, CompletionTarget };

