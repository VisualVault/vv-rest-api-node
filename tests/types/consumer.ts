import vvRestApi, { Authorize, VVClient, RoleType, CompletionTarget } from 'visualvault-api';
import { MemberType, CompletionTarget as CompletionTargetFromConstants } from 'visualvault-api/constants';

const auth: Authorize = new vvRestApi.authorize();

async function useClient(client: VVClient): Promise<void> {
    const forms: string = await client.forms.getFormTemplates({ q: '' });
    const variables: object = await client.studioApi.workflow.getWorkflowVariables(null, 'workflow-id');
    client.setCompletionTarget('studioapi');
    client.setCompletionTarget(CompletionTarget.StudioApi);
    client.setCompletionTarget(CompletionTargetFromConstants.StudioApi);
    const completion: string = await client.scheduledProcess.postCompletion('run-token', 'complete', true, 'done');
    console.log(forms, variables, completion, RoleType, MemberType, auth);
}

void useClient;
