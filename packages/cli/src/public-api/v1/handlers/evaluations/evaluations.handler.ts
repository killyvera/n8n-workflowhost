import type { AuthenticatedRequest } from '@n8n/db';
import { LicenseState } from '@n8n/backend-common';
import { Container } from '@n8n/di';
import type { Response } from 'express';

import type { TestRunRequest } from '../../../types';
import type { PublicAPIEndpoint } from '../../shared/handler.types';
import {
	projectScope,
	publicApiScope,
	validCursor,
} from '../../shared/middlewares/global.middleware';

import { ForbiddenError } from '@/errors/response-errors/forbidden.error';

type EvaluationsHandlers = {
	getTestRuns: PublicAPIEndpoint<TestRunRequest.GetMany>;
	getTestRun: PublicAPIEndpoint<TestRunRequest.GetOne>;
	getTestCases: PublicAPIEndpoint<TestRunRequest.GetCases>;
	createTestRun: PublicAPIEndpoint<TestRunRequest.Create>;
	cancelTestRun: PublicAPIEndpoint<TestRunRequest.Cancel>;
};

function assertEvaluationsUnavailable(): never {
	if (Container.get(LicenseState).getMaxWorkflowsWithEvaluations() === 0) {
		throw new ForbiddenError('Evaluations are not available on your plan');
	}
	throw new ForbiddenError('Evaluations are not available in this fork');
}

async function unavailable(_req: AuthenticatedRequest, _res: Response): Promise<Response> {
	assertEvaluationsUnavailable();
}

const evaluationsHandlers: EvaluationsHandlers = {
	getTestRuns: [
		publicApiScope('testRun:list'),
		projectScope('workflow:read', 'workflow'),
		validCursor,
		unavailable,
	],
	getTestRun: [
		publicApiScope('testRun:read'),
		projectScope('workflow:read', 'workflow'),
		unavailable,
	],
	getTestCases: [
		publicApiScope('testRun:read'),
		projectScope('workflow:read', 'workflow'),
		validCursor,
		unavailable,
	],
	createTestRun: [
		publicApiScope('testRun:create'),
		projectScope('workflow:execute', 'workflow'),
		unavailable,
	],
	cancelTestRun: [
		publicApiScope('testRun:cancel'),
		projectScope('workflow:execute', 'workflow'),
		unavailable,
	],
};

export default evaluationsHandlers;
