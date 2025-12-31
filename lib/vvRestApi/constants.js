export class Constants {
    constructor() {
        // Empty constructor - properties are defined as instance properties
    }

    alertEventIds = {
        // Folder Events
        folderSecurityModified: "F06FD123-2C52-4F43-9122-34335A5BD8C6",         // "CategorySecurity"
        childFolderSecurityModified: "30167D46-86CF-4E89-B1AE-FC00BB378F67",    // "CategorySecurityCascade"
        folderDocumentAdded: "3702CFBF-555C-4032-BFB2-E25829788BAC",            // "NewCategoryDoc"
        childFolderDocumentAdded: "28946E3C-AEAF-402B-BCE3-8DEAC3D19877",       // "NewCategoryDocCascade"

        // Document Events
        documentCheckedIn: "D47804AB-AEE9-4002-BAB5-9F1AC0366076",          // "CheckIn"
        documentCheckedOut: "4BBA55C1-7AF6-48FF-BFBE-EC7A58EB7F01",         // "CheckOut"
        documentDetailsModified: "3B9D493F-2B45-4877-ABC1-5CA74F92723D",    // "DocumentDetails"
        documentSecurityModified: "BAC187DC-78A8-4A8B-B50F-DB5D5AEE11B9",   // "DocumentSecurity"
        documentViewed: "140B9E97-8D93-48D0-837B-AB4FD419B6D6",             // "DocumentViewed"

        // Project Events
        projectDocumentAddedOrRemoved: "300DB724-5C51-4C38-B2E2-FFE19634A373",      // "NewProjectDoc"
        projectViewed: "92F0C5F4-68DC-4309-9ABF-13B8E2198F79"                       // "ProjectView"
    };

    securityRoles = {
        // RoleType
        Owner: "Owner",
        Editor: "Editor",
        Viewer: "Viewer"
    };

    securityMemberType = {
        // MemberType
        User: "User",
        Group: "Group"
    };

    relationType = {
        Parent: "Parent",
        Child: "Child",
        Peer: "Peer"
    };
}

export default Constants;
