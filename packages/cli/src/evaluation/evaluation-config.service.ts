import { Service } from '@n8n/di';

/**
 * Stub — evaluation configs are not available without the Enterprise module.
 */
@Service()
export class EvaluationConfigService {
	async list(_workflowId: string): Promise<unknown[]> {
		return [];
	}

	async get(_workflowId: string, _configId: string): Promise<null> {
		return null;
	}

	async create(..._args: unknown[]): Promise<never> {
		throw new Error('Evaluation configs are not available in this fork');
	}

	async update(..._args: unknown[]): Promise<never> {
		throw new Error('Evaluation configs are not available in this fork');
	}

	async delete(..._args: unknown[]): Promise<void> {}
}
