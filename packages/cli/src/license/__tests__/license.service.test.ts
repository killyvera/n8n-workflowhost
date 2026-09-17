import type { LicenseState } from '@n8n/backend-common';
import type { WorkflowRepository } from '@n8n/db';
import { mock } from 'vitest-mock-extended';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import type { License } from '@/license';
import { LicenseService } from '@/license/license.service';

describe('LicenseService (local entitlements)', () => {
	const license = mock<License>();
	const licenseState = mock<LicenseState>();
	const workflowRepository = mock<WorkflowRepository>();
	const licenseService = new LicenseService(mock(), license, licenseState, workflowRepository);

	license.getTriggerLimit.mockReturnValue(-1);
	license.getPlanName.mockReturnValue('Self-Hosted OSS');
	licenseState.getMaxWorkflowsWithEvaluations.mockReturnValue(0);
	workflowRepository.getActiveTriggerCount.mockResolvedValue(7);
	workflowRepository.getWorkflowsWithEvaluationCount.mockResolvedValue(0);

	beforeEach(() => vi.clearAllMocks());

	describe('getLicenseData', () => {
		it('should return usage and local plan data', async () => {
			const data = await licenseService.getLicenseData();
			expect(data).toEqual({
				usage: {
					activeWorkflowTriggers: {
						limit: -1,
						value: 7,
						warningThreshold: 0.8,
					},
					workflowsHavingEvaluations: {
						limit: 0,
						value: 0,
					},
				},
				license: {
					planId: 'self-hosted-oss',
					planName: 'Self-Hosted OSS',
				},
			});
		});
	});

	describe('activateLicense', () => {
		it('should no-op activate', async () => {
			await licenseService.activateLicense('activation-key');
			expect(license.activate).not.toHaveBeenCalled();
		});
	});

	describe('requestEnterpriseTrial', () => {
		it('should reject trial requests', async () => {
			await expect(licenseService.requestEnterpriseTrial({})).rejects.toBeInstanceOf(
				BadRequestError,
			);
		});
	});

	describe('registerCommunityEdition', () => {
		it('should return local notice without calling n8n Cloud', async () => {
			const result = await licenseService.registerCommunityEdition({
				userId: '1',
				email: 'a@b.c',
				instanceId: 'id',
				instanceUrl: 'http://localhost',
				licenseType: 'community-registered',
			});
			expect(result.title).toBe('Self-hosted OSS');
		});
	});
});
