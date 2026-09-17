import { Service } from '@n8n/di';

type TestRunStub = {
	id: string;
	status: string;
	createdAt: Date;
};

/**
 * Stub — evaluation test runner is not available without the Enterprise module.
 */
@Service()
export class TestRunnerService {
	async startTestRun(
		..._args: unknown[]
	): Promise<{ testRun: TestRunStub; finished: Promise<void> }> {
		throw new Error('Evaluations are not available in this fork');
	}

	canBeCancelled(_testRun: unknown): boolean {
		return true;
	}

	async cancelTestRun(_runId: string): Promise<void> {
		throw new Error('Evaluations are not available in this fork');
	}
}
