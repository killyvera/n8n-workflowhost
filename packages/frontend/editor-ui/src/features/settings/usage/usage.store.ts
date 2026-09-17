import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import type { UsageState } from '@n8n/api-types';
import * as usageApi from '@n8n/rest-api-client/api/usage';
import { useRootStore } from '@n8n/stores/useRootStore';
import { useSettingsStore } from '@n8n/stores/settings.store';

export type UsageTelemetry = {
	instance_id: string;
	action: 'view_plans' | 'manage_plan' | 'add_activation_key' | 'desktop_view_plans';
	plan_name_current: string;
	usage: number;
	quota: number;
};

const DEFAULT_PLAN_NAME = 'Self-Hosted OSS';
const DEFAULT_STATE: UsageState = {
	loading: true,
	data: {
		usage: {
			activeWorkflowTriggers: {
				limit: -1,
				value: 0,
				warningThreshold: 0.8,
			},
			workflowsHavingEvaluations: {
				value: 0,
				limit: 0,
			},
		},
		license: {
			planId: 'self-hosted-oss',
			planName: DEFAULT_PLAN_NAME,
		},
	},
};

export const useUsageStore = defineStore('usage', () => {
	const rootStore = useRootStore();
	const settingsStore = useSettingsStore();

	const state = reactive<UsageState>({ ...DEFAULT_STATE });
	const hasLoadedLicense = ref(false);

	const planName = computed(() => state.data.license.planName || DEFAULT_PLAN_NAME);
	const planId = computed(() => state.data.license.planId);
	const activeWorkflowTriggersLimit = computed(() => state.data.usage.activeWorkflowTriggers.limit);
	const activeWorkflowTriggersCount = computed(() => state.data.usage.activeWorkflowTriggers.value);
	const workflowsWithEvaluationsLimit = computed(
		() => state.data.usage.workflowsHavingEvaluations.limit,
	);
	const workflowsWithEvaluationsCount = computed(
		() => state.data.usage.workflowsHavingEvaluations.value,
	);
	const executionPercentage = computed(
		() => (activeWorkflowTriggersCount.value / activeWorkflowTriggersLimit.value) * 100,
	);
	const instanceId = computed(() => settingsStore.settings.instanceId);
	const managementToken = computed(() => state.data.managementToken);
	const appVersion = computed(() => settingsStore.settings.versionCli);
	const commonSubscriptionAppUrlQueryParams = computed(
		() => `instanceid=${instanceId.value}&version=${appVersion.value}`,
	);
	const subscriptionAppUrl = computed(() => '');

	const setLoading = (loading: boolean) => {
		state.loading = loading;
	};

	const setData = (data: UsageState['data']) => {
		state.data = data;
		hasLoadedLicense.value = true;
	};

	const getLicenseInfo = async () => {
		const data = await usageApi.getLicense(rootStore.restApiContext);
		setData(data);
	};

	/** Activation is a no-op against the remote license server in this fork. */
	const activateLicense = async (_activationKey: string, _eulaUri?: string) => {
		await getLicenseInfo();
		await settingsStore.getSettings();
		await settingsStore.getModuleSettings();
	};

	const refreshLicenseManagementToken = async () => {
		await getLicenseInfo();
	};

	const requestEnterpriseLicenseTrial = async () => {
		// Enterprise trial / n8n Cloud registration is disabled in this fork.
	};

	const registerCommunityEdition = async (_email: string) => ({
		title: 'Self-hosted OSS',
		text: 'Local entitlements are already active. No registration with n8n Cloud is required.',
	});

	return {
		setLoading,
		getLicenseInfo,
		setData,
		activateLicense,
		refreshLicenseManagementToken,
		requestEnterpriseLicenseTrial,
		registerCommunityEdition,
		hasLoadedLicense,
		planName,
		planId,
		activeWorkflowTriggersLimit,
		activeWorkflowTriggersCount,
		workflowsWithEvaluationsLimit,
		workflowsWithEvaluationsCount,
		executionPercentage,
		instanceId,
		managementToken,
		appVersion,
		isCloseToLimit: computed(() =>
			state.data.usage.activeWorkflowTriggers.limit < 0
				? false
				: activeWorkflowTriggersCount.value / activeWorkflowTriggersLimit.value >=
					state.data.usage.activeWorkflowTriggers.warningThreshold,
		),
		viewPlansUrl: computed(
			() => `${subscriptionAppUrl.value}?${commonSubscriptionAppUrlQueryParams.value}`,
		),
		managePlanUrl: computed(
			() =>
				`${subscriptionAppUrl.value}/manage?token=${managementToken.value}&${commonSubscriptionAppUrlQueryParams.value}`,
		),
		isLoading: computed(() => state.loading),
		telemetryPayload: computed<UsageTelemetry>(() => ({
			instance_id: instanceId.value,
			action: 'view_plans',
			plan_name_current: planName.value,
			usage: activeWorkflowTriggersCount.value,
			quota: activeWorkflowTriggersLimit.value,
		})),
	};
});
