import { Service } from '@n8n/di';

type TestRunSummaryStub = {
	id: string;
	status: string;
	createdAt: Date;
	testCaseExecutions?: unknown[];
};

/**
 * Stub — evaluation test runs are not available without the Enterprise module.
 */
@Service()
export class EvaluationTestRunService {
	async findManyAndCount(
		_workflowId: string,
		_pagination: { offset: number; limit: number },
		_status?: string,
	): Promise<{ testRuns: TestRunSummaryStub[]; count: number }> {
		return { testRuns: [], count: 0 };
	}

	async findSummaryByWorkflowId(
		_runId: string,
		_workflowId: string,
	): Promise<TestRunSummaryStub | null> {
		return null;
	}

	async findTestCasesAndCount(
		_runId: string,
		_workflowId: string,
		_pagination: { offset: number; limit: number },
	): Promise<{ testCases: unknown[]; count: number } | null> {
		return null;
	}

	async findOneByIdAndWorkflowId(
		_runId: string,
		_workflowId: string,
	): Promise<TestRunSummaryStub | null> {
		return null;
	}

	async assertEvaluationQuotaAvailable(_workflowId: string): Promise<void> {
		throw new Error('Evaluations are not available in this fork');
	}
}
