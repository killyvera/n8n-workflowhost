import { CommunityRegisteredRequestDto } from '@n8n/api-types';
import { AuthenticatedRequest } from '@n8n/db';
import { Get, Post, RestController, GlobalScope, Body } from '@n8n/decorators';
import { InstanceSettings } from 'n8n-core';

import { LicenseRequest } from '@/requests';
import { UrlService } from '@/services/url.service';

import { LicenseService } from './license.service';

@RestController('/license')
export class LicenseController {
	constructor(
		private readonly licenseService: LicenseService,
		private readonly instanceSettings: InstanceSettings,
		private readonly urlService: UrlService,
	) {}

	@Get('/')
	async getLicenseData() {
		return await this.licenseService.getLicenseData();
	}

	@Post('/enterprise/request_trial')
	@GlobalScope('license:manage')
	async requestEnterpriseTrial(req: AuthenticatedRequest) {
		await this.licenseService.requestEnterpriseTrial(req.user);
	}

	@Post('/enterprise/community-registered')
	@GlobalScope('license:manage')
	async registerCommunityEdition(
		req: AuthenticatedRequest,
		_res: Response,
		@Body payload: CommunityRegisteredRequestDto,
	) {
		return await this.licenseService.registerCommunityEdition({
			userId: req.user.id,
			email: payload.email,
			instanceId: this.instanceSettings.instanceId,
			instanceUrl: this.urlService.getInstanceBaseUrl(),
			licenseType: 'community-registered',
		});
	}

	@Post('/activate')
	@GlobalScope('license:manage')
	async activateLicense(req: LicenseRequest.Activate) {
		const { activationKey, eulaUri } = req.body;
		if (eulaUri) {
			await this.licenseService.activateLicense(activationKey, eulaUri, req.user.email);
		} else {
			await this.licenseService.activateLicense(activationKey);
		}
		return await this.getTokenAndData();
	}

	@Post('/renew')
	@GlobalScope('license:manage')
	async renewLicense() {
		await this.licenseService.renewLicense();
		return await this.getTokenAndData();
	}

	private async getTokenAndData() {
		const managementToken = this.licenseService.getManagementJwt();
		const data = await this.licenseService.getLicenseData();
		return { ...data, managementToken };
	}
}
