import vvRestApi, { Authorize, VVClient, RoleType, CompletionTarget } from 'visualvault-api';
import type { LoginEvent, LoginEventsPage, LoginEventsResponse } from 'visualvault-api';
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

async function useUtilization(client: VVClient): Promise<void> {
    if (!client.utilization) {
        return;
    }

    const raw: string = await client.utilization.loginEvents.getLoginEvents({
        startDate: new Date('2026-03-01T00:00:00Z'),
        endDate: '2026-03-31',
        take: 250,
        cursor: 'opaque-cursor',
        params: { loginType: 'API' }
    });

    // getLoginEvents returns the response unparsed; casting the parse gives the row and envelope types.
    const response = JSON.parse(raw) as LoginEventsResponse;
    const status: number = response.meta.status;
    const nextCursor: string | null | undefined = response.meta.nextCursor;
    const page: LoginEventsPage | null = response.data;
    const rows: LoginEvent[] = page ? page.rows : [];

    for (const event of rows) {
        const eventId: string = event.eventId;
        const eventTime: string = event.eventTime;
        const loginType: string = event.loginType;
        const userDisplayName: string | null = event.userDisplayName;
        console.log(eventId, eventTime, loginType, userDisplayName);
    }

    console.log(status, nextCursor, page?.dataVersion, page?.minEventDate);
}

void useUtilization;

void useClient;
