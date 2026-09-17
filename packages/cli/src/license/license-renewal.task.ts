import { Time } from '@n8n/constants';
import { SystemTask } from '@n8n/decorators';
import type { SystemTaskEffects, SystemTaskSchedule } from '@n8n/decorators';

import { License } from '@/license';

/** No-op renewal task — local entitlements do not expire. */
@SystemTask()
export class LicenseRenewalTask implements SystemTask {
	readonly name = 'license-renewal';

	readonly schedule: SystemTaskSchedule = {
		kind: 'interval',
		// Keep a long interval so the task registry stays stable; run is a no-op.
		intervalSeconds: (24 * Time.hours.toMilliseconds) / Time.seconds.toMilliseconds,
	};

	readonly effects: SystemTaskEffects = 'non-idempotent';

	readonly durable = false;

	readonly runOnTakeover = false;

	constructor(private readonly license: License) {}

	async run(): Promise<void> {
		await this.license.renewIfDue();
	}
}
