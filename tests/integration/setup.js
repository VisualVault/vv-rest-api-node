import dotenv from 'dotenv';
import path from 'path';

// Try to load from the Current Working Directory (Project Root)
dotenv.config(); 

// Fallback: Try to load from the specific relative path just in case
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Required environment variables for integration tests
 */
const REQUIRED_ENV_VARS = [
  'VV_CLIENT_ID',
  'VV_CLIENT_SECRET',
  'VV_USERNAME',
  'VV_PASSWORD',
  'VV_BASE_URL',
  'VV_CUSTOMER_ALIAS',
  'VV_DATABASE_ALIAS'
];

/**
 * Validates that all required environment variables are set
 * @returns {object} Configuration object with all env vars
 * @throws {Error} If any required variables are missing
 */
export function getTestConfig() {
  const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for integration tests:\n` +
      `  ${missing.join('\n  ')}\n\n` +
      `Copy .env.example to .env and fill in your test credentials.`
    );
  }

  return {
    clientId: process.env.VV_CLIENT_ID,
    clientSecret: process.env.VV_CLIENT_SECRET,
    username: process.env.VV_USERNAME,
    password: process.env.VV_PASSWORD,
    baseUrl: process.env.VV_BASE_URL,
    customerAlias: process.env.VV_CUSTOMER_ALIAS,
    databaseAlias: process.env.VV_DATABASE_ALIAS,
    audience: process.env.VV_AUDIENCE || '',
    // Optional pre-configured test resource IDs
    testCustomQueryName: process.env.VV_TEST_CUSTOM_QUERY_NAME || null,
    testCustomQueryId: process.env.VV_TEST_CUSTOM_QUERY_ID || null,
    // FormsManager AND FormInstanceManager tests
    testFormTemplateRevisionIdForCreate: process.env.VV_TEST_FORM_TEMPLATE_REVISION_ID_FOR_CREATE || null,
    // Unreleased form template IDs (separate because releaseFormTemplate is a one-way operation)
    testUnreleasedFormTemplateIdForImport: process.env.VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_IMPORT || null,
    testUnreleasedFormTemplateIdForRelease: process.env.VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_RELEASE || null,
    // CustomerDatabaseManager tests (user assignment/removal from database)
    testCustomerDatabaseId: process.env.VV_TEST_CUSTOMER_DATABASE_ID || null,
    testCustomerDatabaseUsername: process.env.VV_TEST_CUSTOMER_DATABASE_USERNAME || null,
    testCustomerDatabaseAuthUserId: process.env.VV_TEST_CUSTOMER_DATABASE_AUTH_USER_ID || null,
    // ProjectsManager tests (alert subscriptions)
    testProjectId: process.env.VV_TEST_PROJECT_ID || null,
    testProjectEventId: process.env.VV_TEST_PROJECT_EVENT_ID || null,
    // ScheduledProcessManager tests (completion notification)
    testScheduledProcessId: process.env.VV_TEST_SCHEDULED_PROCESS_ID || null,
    // ScriptsManager tests (web services)
    testWebServiceName: process.env.VV_TEST_WEB_SERVICE_NAME || null,
    // CustomerManager tests (customer user assignment)
    testCustomerId: process.env.VV_TEST_CUSTOMER_ID || null,
    testCustomerUsername: process.env.VV_TEST_CUSTOMER_USERNAME || null,
    // SecurityMembersManager tests (security member operations)
    testSecurityParentId: process.env.VV_TEST_SECURITY_PARENT_ID || null,
    testSecurityMemberId: process.env.VV_TEST_SECURITY_MEMBER_ID || null,
    // ReportsManager tests (PDF generation)
    testReportId: process.env.VV_TEST_REPORT_ID || null,
    // LibraryManager tests (folder operations)
    testFolderSecurityId: process.env.VV_TEST_FOLDER_SECURITY_ID || null,
    testFolderSecurityMemberId: process.env.VV_TEST_FOLDER_SECURITY_MEMBER_ID || null,
    testFolderEventId: process.env.VV_TEST_FOLDER_EVENT_ID || null,
    testFolderAlertUserId: process.env.VV_TEST_FOLDER_ALERT_USER_ID || null,
    testFolderIndexFieldId: process.env.VV_TEST_FOLDER_INDEX_FIELD_ID || null,
    // DocumentsManager tests (index field operations)
    testIndexFolderId: process.env.VV_TEST_INDEX_FOLDER_ID || null,
    // DocumentsManager tests (zip status operations)
    testDocumentDhId: process.env.VV_TEST_DOCUMENT_DH_ID || null,
    // ModelManager tests (intelligent object model operations)
    testModelId: process.env.VV_TEST_MODEL_ID || null,
    //ObjectManager tests (intelligent object operations)
    testObjectModelId: process.env.VV_TEST_OBJECT_MODEL_ID || null,
    testObjectInstanceId: process.env.VV_TEST_OBJECT_INSTANCE_ID || null,
    // UserNotificationsManager tests (user notification operations)
    testNotifyUserId: process.env.VV_TEST_USER_NOTIFICATION_USER_ID  || null,
    // WorkflowManager tests (workflow operations)
    testWorkflowId: process.env.VV_TEST_WORKFLOW_ID || null,
  };
}

/**
 * Checks if integration tests can run (env vars are configured)
 * @returns {boolean}
 */
export function canRunIntegrationTests() {
  return REQUIRED_ENV_VARS.every(key => !!process.env[key]);
}

/**
 * Skip helper for conditional test execution
 * Use: describeIf(canRunIntegrationTests())('test suite', () => {...})
 */
export const describeIf = (condition) => condition ? describe : describe.skip;
