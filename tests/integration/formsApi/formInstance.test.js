import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { getTestConfig, canRunIntegrationTests, describeIf } from '../setup.js';
import { Authorize } from '../../../lib/VVRestApi.js';

describeIf(canRunIntegrationTests())('FormsInstanceManager Integration Tests', () => {
  let config;
  let client;
  let testTemplateId;   // ID of the test template
  let testTemplateRevId;// Revision ID of the test template
  let testTemplateName; // Name of the test template

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

    testTemplateRevId = config.testFormTemplateRevisionIdForCreate;

    // Discover templates for subsequent tests
    const templatesResponse = await client.forms.getFormTemplates({ q: `revisionId eq '${testTemplateRevId}'` });
    const templatesData = JSON.parse(templatesResponse);
    if (templatesData.data.length > 0) {
      const [ testTemplate ] = templatesData.data;
      testTemplateId = testTemplate.id;
      testTemplateRevId = testTemplate.revisionId;
      testTemplateName = testTemplate.name;
    }
  }, 60000); // Allow up to 60s for authentication and template lookup

  describe('postForm / postFormRevision', () => {
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

    it('should create and update a form revision', async () => {
      expect(testTemplateId, 'testTemplateId should be set by beforeAll').toBeDefined();

      // First get template fields to know what data to submit
      const fieldsResponse = await client.forms.getFormTemplateFields(testTemplateId);
      const fieldsData = JSON.parse(fieldsResponse);

      console.log('Template fields for form creation:', JSON.stringify(fieldsData.data, null, 2));

      /* CREATE FORM */

      const formData = {
        fields: fieldsData.data.formFieldList.reduce((fields, formField) => {
          if (formField.formFieldType == 1) { // Text
            fields.push({
              key: formField.id,
              value: "create-test:" + formField.name
            });
          }
          return fields;
        }, [])
      };

      console.log('Input data for form creation:', JSON.stringify(formData, null, 2));

      // Create a new form instance
      const createResponse = await client.formsApi.formInstances.postForm({}, formData, testTemplateRevId);
      const createData = JSON.parse(createResponse);

      console.log('postForms response:', JSON.stringify(createData, null, 2));

      expect(createData).toHaveProperty('meta');
      expect(createData.meta.status, 'postForm should return 201 Created').toBe(201);
      expect(createData).toHaveProperty('data');

      // Store the created instance ID
      instanceId = createData.data.formId;
      expect(instanceId, 'Created form instance should have an ID').toBeDefined();

      /* UPDATE FORM */

      const revFormData = {
        fields: [{ ...formData.fields[0], value: "update-test:" + new Date().toISOString() }]
      }
      console.log('Input data for form revision:', JSON.stringify(revFormData, null, 2));

      // Update the form instance
      const updateResponse = await client.formsApi.formInstances.postFormRevision({}, revFormData, testTemplateRevId, instanceId);
      const updateData = JSON.parse(updateResponse);

      console.log('postFormRevision response:', JSON.stringify(updateData, null, 2));

      expect(updateData).toHaveProperty('meta');
      expect(updateData.meta.status, 'postFormRevision should return 200 Success').toBe(200);
      expect(updateData).toHaveProperty('data');
      expect(updateData.data.formId, 'Updated form instance should have an ID').toBeDefined();
    });
  });
});
