import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';
import env from './../constant';
console.log('this is db cred newf', env);

export class DbBuilderApi implements ICredentialType {
	name = 'dbBuilderApi';

	displayName = 'DbBuilder API';

	documentationUrl = 'supabase';

	properties: INodeProperties[] = [
		{
			displayName: 'Organizations ID',
			name: 'orgId',
			type: 'string',
			placeholder: '',
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			body: { query: 'select current_role;' },
			method: 'POST',
			baseURL: `${env.VITE_APPIZAP_SERVER_URL}`,
			url: '=organizations/{{$credentials.orgId}}/dbBuilder/customQuery',
		},
	};
}
