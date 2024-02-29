import {
	type IExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodeExecutionData,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
	type ICredentialTestFunctions,
	type ICredentialsDecrypted,
	type INodeCredentialTestResult,
} from 'n8n-workflow';
import { rowOperations, rowFields } from './RowDescription';
import env from './../../constant';
type FieldsUiValues = {
	fieldId: string;
	fieldValue: string;
};
const apiUrl: string = env.VITE_APPIZAP_SERVER_URL ?? 'p';
console.log('test', apiUrl);
export class DbBuilder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DbBuilder',
		name: 'dbBuilder',
		icon: 'file:dbBuilder.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Add, get, delete and update data in a table',
		defaults: {
			name: 'DbBuilder',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'dbBuilderApi',
				required: true,
				testedBy: 'dbBuilderApiCredentialTest',
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Row',
						value: 'row',
					},
				],
				default: 'row',
			},
			...rowOperations,
			...rowFields,
		],
	};

	methods = {
		loadOptions: {
			async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credData = await this.getCredentials('dbBuilderApi');
				const returnData: INodePropertyOptions[] = [];
				const option: any = {
					method: 'GET',
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/tableList/public`,
				};
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const data = await this.helpers.request(option);
				console.log('this is process', option.uri, data);
				try {
					JSON.parse(data).forEach((ele: any) => {
						returnData.push({
							value: ele.name,
							name: ele.name,
						});
					});
				} catch (err) {
					console.log(err);
					// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown, n8n-local-rules/no-plain-errors
					throw Error('something went wrong');
				}
				console.log('this is test ', returnData, credData.orgId);
				return returnData;
			},
			async getTableColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				const credData = await this.getCredentials('dbBuilderApi');
				const option: any = {
					method: 'GET',
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/tableList/public`,
				};
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const data = await this.helpers.request(option);
				console.log('this is get column', option.uri, data);
				const tableName = this.getNodeParameter('tableId', 0) as string;
				try {
					JSON.parse(data).forEach((ele: any) => {
						if (ele.name == tableName) {
							Object.keys(ele.schema).forEach((col) => {
								returnData.push({
									value: col,
									name: col,
								});
							});
						}
					});
				} catch (err) {
					console.log(err);
					// eslint-disable-next-line n8n-nodes-base/node-execute-block-wrong-error-thrown, n8n-local-rules/no-plain-errors
					throw Error('something went wrong');
				}
				return returnData;
			},
		},
		credentialTest: {
			async dbBuilderApiCredentialTest(
				this: ICredentialTestFunctions,
				credential: ICredentialsDecrypted,
			): Promise<INodeCredentialTestResult> {
				try {
					console.log(credential);
				} catch (error) {
					return {
						status: 'Error',
						message: 'The Service Key is invalid',
					};
				}

				return {
					status: 'OK',
					message: 'Connection successful!',
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const returnData: INodeExecutionData[] = [];
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);
		const tableName = this.getNodeParameter('tableId', 0) as string;
		console.log('execute', JSON.stringify(items));
		const credData = await this.getCredentials('dbBuilderApi');
		if (resource === 'row') {
			if (operation === 'list') {
				const option: any = {
					method: 'GET',
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/list/${tableName}`,
				};
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const res = await this.helpers.request(option);
					const { data } = JSON.parse(res);
					data.forEach((ele: INodeExecutionData) => {
						returnData.push({ json: ele });
					});
				} catch (error) {
					console.log(error);
					// eslint-disable-next-line n8n-local-rules/no-plain-errors
					throw Error(error.message);
				}
			}
			if (operation === 'create') {
				const fields = this.getNodeParameter('fieldsUi.fieldValues', 0, []) as FieldsUiValues[];
				console.log('thsi is fiels', fields);
				const dataObj: any = {};
				fields?.forEach((ele: FieldsUiValues) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					dataObj[ele.fieldId] = ele.fieldValue;
				});
				console.log(dataObj);
				const option: any = {
					method: 'POST',
					body: JSON.stringify(dataObj),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/newrow/${tableName}`,
				};
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const res = await this.helpers.request(option);
					const { data } = JSON.parse(res);
					data.forEach((ele: INodeExecutionData) => {
						returnData.push({ json: ele });
					});
					returnData.push({ json: { status: 200 } });
					console.log('this is create data', data);
				} catch (error) {
					console.log(error);
					// eslint-disable-next-line n8n-local-rules/no-plain-errors
					throw Error(error.message);
				}
			}
			if (operation === 'update') {
				const fields = this.getNodeParameter('fieldsUi.fieldValues', 0, []) as FieldsUiValues[];
				const id = this.getNodeParameter('id', 0) as string;
				const dataObj: any = {};
				fields?.forEach((ele: FieldsUiValues) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					dataObj[ele.fieldId] = ele.fieldValue;
				});
				const option: any = {
					method: 'PATCH',
					body: JSON.stringify(dataObj),
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/updaterow/${tableName}/${id}`,
				};
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const res = await this.helpers.request(option);
					const { data } = JSON.parse(res);
					data.forEach((ele: INodeExecutionData) => {
						returnData.push({ json: ele });
					});
					console.log('this is create data', data);
				} catch (error) {
					console.log(error);
					// eslint-disable-next-line n8n-local-rules/no-plain-errors
					throw Error(error.message);
				}
			}
			if (operation === 'delete') {
				const id = this.getNodeParameter('id', 0) as string;
				const option: any = {
					method: 'DELETE',
					headers: {
						'Content-type': 'application/json; charset=UTF-8',
					},
					uri: apiUrl + `organizations/${credData.orgId}/dbBuilder/deleteRow/${tableName}/${id}`,
				};
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const res = await this.helpers.request(option);
					const { data } = JSON.parse(res);
					data.forEach((ele: INodeExecutionData) => {
						returnData.push({ json: ele });
					});
					console.log('this is create data', data);
				} catch (error) {
					console.log(error);
					// eslint-disable-next-line n8n-local-rules/no-plain-errors
					throw Error(error.message);
				}
			}
		}
		return [returnData];
	}
}
