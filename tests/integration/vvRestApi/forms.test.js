import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conditional test runners for tests requiring pre-configured unreleased templates
const skipImportTest = !process.env.VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_IMPORT;
const skipReleaseTest = !process.env.VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_RELEASE;

describeIf(canRunIntegrationTests())('FormsManager Integration Tests', () => {
  let config;
  let client;
  let testTemplateId; // Discovered or imported
  let testTemplateName; // Name of the test template
  let importedTemplateId; // Template created by import test
  let testCreateTemplateRevId // Revision ID of the create test template

  beforeAll(async () => {
    config = getTestConfig();

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

    testCreateTemplateRevId = config.testFormTemplateRevisionIdForCreate;

    const templateParams = testCreateTemplateRevId ? { q: `revisionId eq '${testCreateTemplateRevId}'` } : {};

    // Discover templates for subsequent tests
    const templatesResponse = await client.forms.getFormTemplates(templateParams);
    const templatesData = JSON.parse(templatesResponse);
    if (templatesData.data.length > 0) {
      testTemplateId = templatesData.data[0].id;
      testTemplateName = templatesData.data[0].name;
    }
  }, 60000); // Allow up to 60s for authentication and template discovery

  describe('importFormTemplate', () => {
    // Requires VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_IMPORT in .env
    it.skipIf(skipImportTest)('should update an existing form template from XML', async () => {
      const templateId = config.testUnreleasedFormTemplateIdForImport;

      const xmlPath = path.resolve(__dirname, '../_fixtures/test-form-template.xml');
      const buffer = fs.readFileSync(xmlPath);

      const importData = {
        name: 'Imported Template',
        description: 'Updated via integration test',
        revision: String(Date.now())
      };

      const response = await client.forms.importFormTemplate(importData, templateId, buffer);

      expect(response, 'importFormTemplate should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('importFormTemplate response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'importFormTemplate should return success status').toBe(200);

      if (data.data) {
        importedTemplateId = data.data.id || templateId;
        console.log('Updated template ID:', importedTemplateId);
      }
    });
  });

  describe('releaseFormTemplate', () => {
    // Requires VV_TEST_UNRELEASED_FORM_TEMPLATE_ID_FOR_RELEASE in .env
    // WARNING: This is a one-way operation - the template cannot be unreleased after this test runs
    it.skipIf(skipReleaseTest)('should release an unreleased form template', async () => {
      const templateId = config.testUnreleasedFormTemplateIdForRelease;

      const response = await client.forms.releaseFormTemplate(templateId);

      expect(response, 'releaseFormTemplate should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('releaseFormTemplate response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'releaseFormTemplate should return success status').toBe(200);

      // Verify the template is now released
      if (data.data) {
        expect(data.data.status, 'Released template should have status 1').toBe(1);
      }
    });
  });

  describe('getFormTemplates', () => {
    it('should return list of form templates', async () => {
      const response = await client.forms.getFormTemplates({});

      expect(response, 'getFormTemplates should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFormTemplates response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormTemplates should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);

      if (data.data.length > 0) {
        console.log('Form template object shape:', JSON.stringify(data.data[0], null, 2));
      }
    });

    it('should support query params for filtering', async () => {
      const response = await client.forms.getFormTemplates({
        fields: 'id, name, description'
      });

      expect(response, 'getFormTemplates with params should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormTemplates with params should return success status').toBe(200);
    });
  });

  describe('getFormTemplateIdByName', () => {
    it('should return template ID when template exists', async () => {
      expect(testTemplateName, 'testTemplateName should be set by beforeAll').toBeDefined();

      const result = await client.forms.getFormTemplateIdByName(testTemplateName);

      console.log('getFormTemplateIdByName result:', JSON.stringify(result, null, 2));

      expect(result).toHaveProperty('templateIdGuid');
      expect(result).toHaveProperty('templateRevisionIdGuid');
      expect(result.templateIdGuid, 'Template ID should match expected').toBe(testTemplateId);
    });

    it('should return undefined for non-existent template', async () => {
      const result = await client.forms.getFormTemplateIdByName('NonExistentTemplate_12345');

      expect(result).toHaveProperty('templateIdGuid');
      expect(result.templateIdGuid, 'Non-existent template should return undefined').toBe(undefined);
    });
  });

  describe('getFormTemplateFields', () => {
    it('should return fields for a form template', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      const response = await client.forms.getFormTemplateFields(testTemplateId);

      expect(response, 'getFormTemplateFields should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFormTemplateFields response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormTemplateFields should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('getForms', () => {
    it('should return form instances by template ID', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      const response = await client.forms.getForms({}, testTemplateId);

      expect(response, 'getForms should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getForms response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getForms should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);

      if (data.data.length > 0) {
        console.log('Form instance object shape:', JSON.stringify(data.data[0], null, 2));
      }
    });

    it('should return form instances by template name', async () => {
      expect(testTemplateName, 'testTemplateName should be set by beforeAll').toBeDefined();

      const response = await client.forms.getForms({}, testTemplateName);

      expect(response, 'getForms by name should return a response').toBeDefined();
      const data = JSON.parse(response);

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getForms by name should return success status').toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data), 'Response data should be an array').toBe(true);
    });
  });

  describe('postForms / deleteFormInstance', () => {
    it('should create and delete a form instance', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // First get template fields to know what data to submit
      const fieldsResponse = await client.forms.getFormTemplateFields(testTemplateId);
      const fieldsData = JSON.parse(fieldsResponse);

      console.log('Template fields for form creation:', JSON.stringify(fieldsData.data, null, 2));

      // Create a form instance with minimal data
      const formData = {};

      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      console.log('postForms response:', JSON.stringify(createData, null, 2));

      expect(createData).toHaveProperty('meta');
      // Accept 200, 201, or 500 with reporting error (form was still created)
      // 500 with "Form Instance created, but there was a problem saving the Reporting data"
      // means the form was created but reporting failed - this is a server config issue
      if (createData.meta.status === 500) {
        const isReportingError = createData.meta.errors?.some(e =>
          e.message?.includes('Form Instance created')
        );
        expect(isReportingError, 'If status is 500, should be a reporting error (form was still created)').toBe(true);
        console.log('Note: Form created but reporting data save failed (server config issue)');
        // Form was still created, test passes but skip cleanup since we don't have the ID
        return;
      }
      expect(createData.meta.status, 'postForms should return 201 Created').toBe(201);
      expect(createData).toHaveProperty('data');

      // Store the created instance ID
      const testFormInstanceId = createData.data.revisionId || createData.data.id;
      expect(testFormInstanceId, 'Created form should have an ID').toBeDefined();

      // Delete the form instance (cleanup)
      const deleteResponse = await client.forms.deleteFormInstance(testFormInstanceId);
      const deleteData = JSON.parse(deleteResponse);

      console.log('deleteFormInstance response:', JSON.stringify(deleteData, null, 2));

      expect(deleteData).toHaveProperty('meta');
      expect(deleteData.meta.status, 'deleteFormInstance should return success status').toBe(200);
    });
  });

  describe('getFormInstanceById', () => {
    let instanceId;

    afterEach(async () => {
      if (instanceId) {
        try {
          await client.forms.deleteFormInstance(instanceId);
          console.log('Cleanup - deleted form instance:', instanceId);
        } catch (error) {
          console.warn('Cleanup form instance failed:', error.message);
        }
        instanceId = null;
      }
    });

    it('should get a form instance by ID', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // Create a form instance to test with
      const formData = { textField: 'Test for getFormInstanceById' };
      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'Should be able to create form instance for test').toBe(201);

      instanceId = createData.data.revisionId || createData.data.id;
      expect(instanceId, 'Created form should have an ID').toBeDefined();

      const response = await client.forms.getFormInstanceById(testTemplateId, instanceId);

      expect(response, 'getFormInstanceById should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFormInstanceById response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormInstanceById should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('postFormRevision', () => {
    let formInstanceId;

    afterEach(async () => {
      if (formInstanceId) {
        try {
          await client.forms.deleteFormInstance(formInstanceId);
          console.log('Cleanup - deleted form instance:', formInstanceId);
        } catch (error) {
          console.warn('Cleanup form instance failed:', error.message);
        }
        formInstanceId = null;
      }
    });

    it('should create a new revision of an existing form', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // Create a form instance first
      const formData = { textField: 'Initial value' };
      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'Should be able to create form instance for test').toBe(201);

      formInstanceId = createData.data.revisionId || createData.data.id;
      expect(formInstanceId, 'Created form should have an ID').toBeDefined();

      // Create a new revision with updated data
      const revisionData = { textField: 'Updated value in revision' };

      const response = await client.forms.postFormRevision({}, revisionData, testTemplateId, formInstanceId);

      expect(response, 'postFormRevision should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('postFormRevision response:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'postFormRevision should return 201 Created').toBe(201);

      // Update to the new revision ID for cleanup
      formInstanceId = data.data?.revisionId || data.data?.id || formInstanceId;
    });
  });

  describe('getFormRelatedDocs', () => {
    let formId;

    afterEach(async () => {
      if (formId) {
        try {
          await client.forms.deleteFormInstance(formId);
          console.log('Cleanup - deleted form instance:', formId);
        } catch (error) {
          console.warn('Cleanup form instance failed:', error.message);
        }
        formId = null;
      }
    });

    it('should get related documents for a form', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // Create a form instance
      const formData = { textField: 'Test for related docs' };
      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'Should be able to create form instance for test').toBe(201);

      formId = createData.data.revisionId || createData.data.id;
      expect(formId, 'Created form should have an ID').toBeDefined();

      const response = await client.forms.getFormRelatedDocs(formId, {});

      expect(response, 'getFormRelatedDocs should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFormRelatedDocs response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormRelatedDocs should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('getFormRelatedForms', () => {
    let formId;

    afterEach(async () => {
      if (formId) {
        try {
          await client.forms.deleteFormInstance(formId);
          console.log('Cleanup - deleted form instance:', formId);
        } catch (error) {
          console.warn('Cleanup form instance failed:', error.message);
        }
        formId = null;
      }
    });

    it('should get related forms for a form', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // Create a form instance
      const formData = { textField: 'Test for related forms' };
      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'Should be able to create form instance for test').toBe(201);

      formId = createData.data.revisionId || createData.data.id;
      expect(formId, 'Created form should have an ID').toBeDefined();

      const response = await client.forms.getFormRelatedForms(formId, {});

      expect(response, 'getFormRelatedForms should return a response').toBeDefined();
      const data = JSON.parse(response);

      console.log('getFormRelatedForms response shape:', JSON.stringify(data, null, 2));

      expect(data).toHaveProperty('meta');
      expect(data.meta.status, 'getFormRelatedForms should return success status').toBe(200);
      expect(data).toHaveProperty('data');
    });
  });

  describe('getFormInstancePDF', () => {
    let instanceId;

    afterEach(async () => {
      if (instanceId) {
        try {
          await client.forms.deleteFormInstance(instanceId);
          console.log('Cleanup - deleted form instance:', instanceId);
        } catch (error) {
          console.warn('Cleanup form instance failed:', error.message);
        }
        instanceId = null;
      }
    });

    it('should get PDF for a form instance', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // Create a form instance
      const formData = { textField: 'Test for PDF generation' };
      const createResponse = await client.forms.postForms({}, formData, testTemplateId);
      const createData = JSON.parse(createResponse);

      expect(createData.meta.status, 'Should be able to create form instance for test').toBe(201);

      instanceId = createData.data.revisionId || createData.data.id;
      expect(instanceId, 'Created form should have an ID').toBeDefined();

      const response = await client.forms.getFormInstancePDF(testTemplateId, instanceId);

      expect(response, 'getFormInstancePDF should return a response').toBeDefined();
      // PDF response might be binary or base64 encoded
      console.log('getFormInstancePDF response type:', typeof response);
      console.log('getFormInstancePDF response length:', response.length);
    }, 60000); // Allow extra time for PDF generation
  });

  describe('Helper classes', () => {
    it('should create ReturnField instances', () => {
      const field = client.forms.returnField('field-id', 'fieldName', 'testValue', false, '');

      expect(field).toHaveProperty('id', 'field-id');
      expect(field).toHaveProperty('name', 'fieldName');
      expect(field).toHaveProperty('value', 'testValue');
      expect(field).toHaveProperty('isError', false);
      expect(field).toHaveProperty('errorMessage', '');
  });

    it('should use FormFieldCollection for field lookups', async () => {
      // Import FormFieldCollection for testing
      const { FormFieldCollection } = await import('../../../lib/vvRestApi/formsManager.js');

      const mockFields = [
        { id: 'field-1', name: 'FirstName', value: 'John' },
        { id: 'field-2', name: 'LastName', value: 'Doe' },
        { id: 'field-3', name: 'Email', value: 'john@example.com' }
      ];

      const collection = new FormFieldCollection(mockFields);

      // Test getFormFieldByName (case-insensitive)
      const firstName = collection.getFormFieldByName('firstname');
      expect(firstName).toBeDefined();
      expect(firstName.name).toBe('FirstName');
      expect(firstName.value).toBe('John');

      // Test getFormFieldById (case-insensitive)
      const field2 = collection.getFormFieldById('FIELD-2');
      expect(field2).toBeDefined();
      expect(field2.name).toBe('LastName');

      // Test getFieldArray
      const allFields = collection.getFieldArray();
      expect(allFields).toHaveLength(3);

      // Test non-existent field
      const notFound = collection.getFormFieldByName('NotExist');
      expect(notFound).toBeNull();
    });
  });
});
