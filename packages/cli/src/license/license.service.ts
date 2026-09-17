import { LicenseState, Logger } from '@n8n/backend-common';
import { WorkflowRepository } from '@n8n/db';
import { Service } from '@n8n/di';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { License } from '@/license';

@Service()
export class LicenseService {
	constructor(
		private readonly logger: Logger,
		private readonly license: License,
		private readonly licenseState: LicenseState,
		private readonly workflowRepository: WorkflowRepository,
	) {}

	async getLicenseData() {
		const triggerCount = await this.workflowRepository.getActiveTriggerCount();
		const workflowsWithEvaluationsCount =
			await this.workflowRepository.getWorkflowsWithEvaluationCount();

		return {
			usage: {
				activeWorkflowTriggers: {
					value: triggerCount,
					limit: this.license.getTriggerLimit(),
					warningThreshold: 0.8,
				},
				workflowsHavingEvaluations: {
					value: workflowsWithEvaluationsCount,
					limit: this.licenseState.getMaxWorkflowsWithEvaluations(),
				},
			},
			license: {
				planId: 'self-hosted-oss',
				planName: this.license.getPlanName(),
			},
		};
	}

	async requestEnterpriseTrial(_user: unknown) {
		throw new BadRequestError(
			'Enterprise trial is not available in this fork. Features are enabled locally.',
		);
	}

	async registerCommunityEdition(_payload: {
		userId: string;
		email: string;
		instanceId: string;
		instanceUrl: string;
		licenseType: string;
	}): Promise<{ title: string; text: string }> {
		return {
			title: 'Self-hosted OSS',
			text: 'This fork does not register with n8n Cloud. Local entitlements are already active.',
		};
	}

	getManagementJwt(): string {
		return '';
	}

	async activateLicense(
		_activationKey: string,
		_eulaUri?: string,
		_userEmail?: string,
	): Promise<void> {
		this.logger.info('License activation ignored — local entitlements are always active');
	}

	async renewLicense() {
		this.logger.debug('License renew ignored — local entitlements have no expiry');
	}
}
