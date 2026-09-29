import vvRestApi, { Authorize, VVClient, RoleType } from 'visualvault-api';
import { MemberType } from 'visualvault-api/constants';

const auth: Authorize = new vvRestApi.authorize();

async function useClient(client: VVClient): Promise<void> {
    const forms: string = await client.forms.getFormTemplates({ q: '' });
    const variables: object = await client.studioApi.workflow.getWorkflowVariables(null, 'workflow-id');
    console.log(forms, variables, RoleType, MemberType, auth);
}

void useClient;
