import type { BaseMessage } from '@langchain/core/messages';
import type { IConnections, INode, INodeTypeDescription, IWorkflowGroup } from 'n8n-workflow';

/** Re-exported for MCP SDK reference content. */
export const SDK_IMPORT_STATEMENT = "import { workflow, node, trigger } from '@n8n/workflow-sdk';";

export type ValidationWarning = {
	code: string;
	message: string;
	nodeName?: string;
	parameterPath?: string;
};

export type ChatPayload = Record<string, unknown>;

export type LangchainMessage = BaseMessage;

export type StoredSession = {
	messages: LangchainMessage[];
	previousSummary?: string;
	updatedAt?: Date;
	activeVersionCardId?: string | null;
	resumeAfterRestoreMessageId?: string | null;
};

export type ISessionStorage = {
	getSession(threadId: string): Promise<StoredSession | null>;
	saveSession(threadId: string, data: StoredSession): Promise<void>;
};

export type ResourceLocatorCallbackFactory = (
	userId: string,
) => (...args: unknown[]) => Promise<unknown>;

export type CodeBuilderToolMeta = {
	toolName: string;
	displayTitle: string;
};

export const CODE_BUILDER_SEARCH_NODES_TOOL: CodeBuilderToolMeta = {
	toolName: 'search_nodes',
	displayTitle: 'Search nodes',
};
export const CODE_BUILDER_GET_NODE_TYPES_TOOL: CodeBuilderToolMeta = {
	toolName: 'get_node_types',
	displayTitle: 'Get node types',
};
export const CODE_BUILDER_VALIDATE_TOOL: CodeBuilderToolMeta = {
	toolName: 'validate_workflow_code',
	displayTitle: 'Validate workflow code',
};
export const CODE_BUILDER_VALIDATE_NODE_TOOL: CodeBuilderToolMeta = {
	toolName: 'validate_node',
	displayTitle: 'Validate node',
};
export const CODE_BUILDER_GET_SUGGESTED_NODES_TOOL: CodeBuilderToolMeta = {
	toolName: 'get_suggested_nodes',
	displayTitle: 'Get suggested nodes',
};
export const MCP_GET_SDK_REFERENCE_TOOL: CodeBuilderToolMeta = {
	toolName: 'get_workflow_sdk_reference',
	displayTitle: 'Get workflow SDK reference',
};
export const MCP_CREATE_WORKFLOW_FROM_CODE_TOOL: CodeBuilderToolMeta = {
	toolName: 'create_workflow_from_code',
	displayTitle: 'Create workflow from code',
};
export const MCP_ARCHIVE_WORKFLOW_TOOL: CodeBuilderToolMeta = {
	toolName: 'archive_workflow',
	displayTitle: 'Archive workflow',
};
export const MCP_UPDATE_WORKFLOW_TOOL: CodeBuilderToolMeta = {
	toolName: 'update_workflow',
	displayTitle: 'Update workflow',
};
export const MCP_EXPLORE_NODE_RESOURCES_TOOL: CodeBuilderToolMeta = {
	toolName: 'explore_node_resources',
	displayTitle: 'Explore node resources',
};
export const MCP_GET_WORKFLOW_BEST_PRACTICES_TOOL: CodeBuilderToolMeta = {
	toolName: 'get_workflow_best_practices',
	displayTitle: 'Get workflow best practices',
};

export function getWarningKey(warning: ValidationWarning): string {
	return `${warning.code}|${warning.nodeName ?? ''}|${warning.parameterPath ?? ''}`;
}

export function stripImportStatements(code: string): string {
	return code;
}

export function isLangchainMessagesArray(value: unknown): value is LangchainMessage[] {
	if (!Array.isArray(value)) return false;
	return value.every(
		(item) =>
			typeof item === 'object' &&
			item !== null &&
			'_getType' in item &&
			typeof (item as { _getType: unknown })._getType === 'function',
	);
}

export function createPassthroughSsrfGuard() {
	return {
		validateUrl: async () => undefined,
		validateRedirectSync: () => undefined,
		createSecureLookup: () => undefined,
	};
}

type ParseValidateOptions = {
	generatePinData?: boolean;
	nodeTypesProvider?: unknown;
};

/**
 * Stub validator used when the Enterprise AI workflow builder package is absent.
 * Callers that need real parsing must provide EE or replace this package.
 */
export class ParseValidateHandler {
	constructor(_options: ParseValidateOptions = {}) {}

	validateJSON(_workflow: unknown): ValidationWarning[] {
		return [];
	}

	async parseAndValidate(_code: string): Promise<{
		workflow: {
			name?: string;
			nodes: INode[];
			connections: IConnections;
			settings?: Record<string, unknown>;
			pinData?: Record<string, unknown>;
			nodeGroups?: IWorkflowGroup[];
			meta?: Record<string, unknown>;
		};
		warnings: ValidationWarning[];
	}> {
		throw new Error('AI workflow builder is not available in this fork');
	}
}

/**
 * Stub service — construction succeeds so DI wiring does not break; methods throw.
 */
export class AiWorkflowBuilderService {
	constructor(
		_nodeTypes?: INodeTypeDescription[],
		_sessionStorage?: ISessionStorage,
		..._rest: unknown[]
	) {}

	updateNodeTypes(_nodeTypes: INodeTypeDescription[]): void {}

	async *chat(_payload: ChatPayload, ..._rest: unknown[]): AsyncGenerator<unknown> {
		throw new Error('AI workflow builder is not available in this fork');
	}

	async getSessions(..._args: unknown[]): Promise<{ sessions: unknown[] }> {
		return { sessions: [] };
	}

	async getBuilderInstanceCredits(..._args: unknown[]): Promise<{
		creditsQuota: number;
		creditsClaimed: number;
	}> {
		return { creditsQuota: 0, creditsClaimed: 0 };
	}

	async clearSession(..._args: unknown[]): Promise<void> {}

	async truncateMessagesAfter(..._args: unknown[]): Promise<boolean> {
		return false;
	}
}
