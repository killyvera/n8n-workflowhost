import { mockLogger } from '@n8n/backend-test-utils';
import type { InstanceSettings } from 'n8n-core';
import { mock } from 'vitest-mock-extended';

import { License } from '@/license';

const MOCK_FEATURE_FLAG = 'feat:sharing';

describe('License (local entitlements)', () => {
	let license: License;
	const instanceSettings = mock<InstanceSettings>({
		instanceId: 'instance-id',
		instanceType: 'main',
		isLeader: true,
	});

	beforeEach(async () => {
		license = new License(mockLogger(), instanceSettings);
		await license.init();
	});

	test('init works without a remote license server', async () => {
		await expect(license.init()).resolves.toBeUndefined();
	});

	test("isLicensed('feat:sharing') is true", () => {
		expect(license.isLicensed(MOCK_FEATURE_FLAG)).toBe(true);
	});

	test("isLicensed('feat:aiCredits') is false", () => {
		expect(license.isLicensed('feat:aiCredits')).toBe(false);
	});

	test('getPlanName is Self-Hosted OSS', () => {
		expect(license.getPlanName()).toBe('Self-Hosted OSS');
	});

	test('activate is a no-op', async () => {
		await expect(license.activate('any-key')).resolves.toBeUndefined();
		expect(license.isLicensed(MOCK_FEATURE_FLAG)).toBe(true);
	});
});
