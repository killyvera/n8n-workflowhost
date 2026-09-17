import type { LicenseProvider } from '@n8n/backend-common';
import { Logger } from '@n8n/backend-common';
import {
	DEFAULT_WORKFLOW_HISTORY_PRUNE_LIMIT,
	LICENSE_FEATURES,
	LICENSE_QUOTAS,
	UNLIMITED_LICENSE_QUOTA,
	type BooleanLicenseFeature,
	type NumericLicenseFeature,
} from '@n8n/constants';
import { OnPubSubEvent, OnShutdown } from '@n8n/decorators';
import { Service } from '@n8n/di';
import { InstanceSettings } from 'n8n-core';

export type FeatureReturnType = Partial<
	{
		planName: string;
	} & { [K in NumericLicenseFeature]: number } & { [K in BooleanLicenseFeature]: boolean }
>;

type LicenseRefreshCallback = (cert: string) => void;

/**
 * Features enabled by local OSS replacements (no n8n Enterprise license).
 * Cloud-only / billing features stay off (AI credits, gateway, promotions).
 */
const ENABLED_FEATURES = new Set<BooleanLicenseFeature>([
	LICENSE_FEATURES.SHARING,
	LICENSE_FEATURES.LDAP,
	LICENSE_FEATURES.SAML,
	LICENSE_FEATURES.OIDC,
	LICENSE_FEATURES.MFA_ENFORCEMENT,
	LICENSE_FEATURES.LOG_STREAMING,
	LICENSE_FEATURES.ADVANCED_EXECUTION_FILTERS,
	LICENSE_FEATURES.VARIABLES,
	LICENSE_FEATURES.SOURCE_CONTROL,
	LICENSE_FEATURES.EXTERNAL_SECRETS,
	LICENSE_FEATURES.DEBUG_IN_EDITOR,
	LICENSE_FEATURES.BINARY_DATA_S3,
	LICENSE_FEATURES.BINARY_DATA_AZURE,
	LICENSE_FEATURES.EXECUTION_DATA_S3,
	LICENSE_FEATURES.EXECUTION_DATA_AZURE,
	LICENSE_FEATURES.MULTIPLE_MAIN_INSTANCES,
	LICENSE_FEATURES.WORKER_VIEW,
	LICENSE_FEATURES.ADVANCED_PERMISSIONS,
	LICENSE_FEATURES.PROJECT_ROLE_ADMIN,
	LICENSE_FEATURES.PROJECT_ROLE_EDITOR,
	LICENSE_FEATURES.PROJECT_ROLE_VIEWER,
	LICENSE_FEATURES.COMMUNITY_NODES_CUSTOM_REGISTRY,
	LICENSE_FEATURES.FOLDERS,
	LICENSE_FEATURES.INSIGHTS_VIEW_SUMMARY,
	LICENSE_FEATURES.INSIGHTS_VIEW_DASHBOARD,
	LICENSE_FEATURES.INSIGHTS_VIEW_HOURLY_DATA,
	LICENSE_FEATURES.API_KEY_SCOPES,
	LICENSE_FEATURES.WORKFLOW_DIFFS,
	LICENSE_FEATURES.NAMED_VERSIONS,
	LICENSE_FEATURES.CUSTOM_ROLES,
	LICENSE_FEATURES.WORKER_POOLS,
]);

const DISABLED_CLOUD_FEATURES = new Set<BooleanLicenseFeature>([
	LICENSE_FEATURES.AI_ASSISTANT,
	LICENSE_FEATURES.ASK_AI,
	LICENSE_FEATURES.AI_CREDITS,
	LICENSE_FEATURES.AI_GATEWAY,
	LICENSE_FEATURES.AI_GATEWAY_CLOUD_UBB,
	LICENSE_FEATURES.AI_BUILDER,
	LICENSE_FEATURES.SHOW_NON_PROD_BANNER,
	LICENSE_FEATURES.API_DISABLED,
	LICENSE_FEATURES.DYNAMIC_CREDENTIALS,
	// Environments v2 / promotions — module not shipped in this fork.
	// Real Git sync is SOURCE_CONTROL (kept enabled above).
	LICENSE_FEATURES.GIT_CONNECTIONS,
	LICENSE_FEATURES.PERSONAL_SPACE_POLICY,
	LICENSE_FEATURES.TOKEN_EXCHANGE,
	LICENSE_FEATURES.DATA_REDACTION,
	LICENSE_FEATURES.OTEL_CUSTOM_SPAN_ATTRIBUTES,
	LICENSE_FEATURES.WORKFLOW_REVIEWS,
	LICENSE_FEATURES.NODE_TYPE_POLICIES,
]);

const LOCAL_QUOTAS: Partial<Record<NumericLicenseFeature, number>> = {
	[LICENSE_QUOTAS.TRIGGER_LIMIT]: UNLIMITED_LICENSE_QUOTA,
	[LICENSE_QUOTAS.VARIABLES_LIMIT]: UNLIMITED_LICENSE_QUOTA,
	[LICENSE_QUOTAS.USERS_LIMIT]: UNLIMITED_LICENSE_QUOTA,
	[LICENSE_QUOTAS.WORKFLOW_HISTORY_PRUNE_LIMIT]: UNLIMITED_LICENSE_QUOTA,
	[LICENSE_QUOTAS.TEAM_PROJECT_LIMIT]: UNLIMITED_LICENSE_QUOTA,
	[LICENSE_QUOTAS.AI_CREDITS]: 0,
	[LICENSE_QUOTAS.AI_GATEWAY_BUDGET]: 0,
	[LICENSE_QUOTAS.INSIGHTS_MAX_HISTORY_DAYS]: 365,
	[LICENSE_QUOTAS.INSIGHTS_RETENTION_MAX_AGE_DAYS]: 365,
	[LICENSE_QUOTAS.INSIGHTS_RETENTION_PRUNE_INTERVAL_DAYS]: 24,
	[LICENSE_QUOTAS.WORKFLOWS_WITH_EVALUATION_LIMIT]: 0,
};

/**
 * Local entitlements provider. Replaces `@n8n_io/license-sdk` and the remote
 * license server. Features are on only when this fork ships an OSS module.
 */
@Service()
export class License implements LicenseProvider {
	private isShuttingDown = false;

	private refreshCallbacks: LicenseRefreshCallback[] = [];

	constructor(
		private readonly logger: Logger,
		private readonly instanceSettings: InstanceSettings,
	) {
		this.logger = this.logger.scoped('license');
	}

	async init(_opts: { forceRecreate?: boolean; isCli?: boolean } = {}) {
		if (this.isShuttingDown) {
			this.logger.warn('Local entitlements already shutting down');
			return;
		}
		this.logger.info('Local entitlements initialized (no remote license server)');
	}

	async loadCertStr(): Promise<string> {
		return '';
	}

	async saveCertStr(_value: string): Promise<void> {}

	onCertRefresh(refreshCallback: LicenseRefreshCallback): () => void {
		this.refreshCallbacks.push(refreshCallback);
		return () => {
			const index = this.refreshCallbacks.indexOf(refreshCallback);
			if (index > -1) {
				this.refreshCallbacks.splice(index, 1);
			}
		};
	}

	async activate(_activationKey: string, _eulaUri?: string, _userEmail?: string): Promise<void> {
		this.logger.info(
			'License activation is disabled in this fork. Features are enabled locally without a certificate.',
		);
	}

	@OnPubSubEvent('reload-license')
	async reload(): Promise<void> {
		this.logger.debug('Local entitlements reload (no-op)');
	}

	async renewIfDue(): Promise<void> {}

	async renew() {
		this.logger.debug('Local entitlements renew (no-op)');
	}

	async clear() {
		this.logger.info('Local entitlements clear (no-op)');
	}

	@OnShutdown()
	async shutdown() {
		this.isShuttingDown = true;
		this.logger.debug('Local entitlements shut down');
	}

	isLicensed(feature: BooleanLicenseFeature) {
		if (DISABLED_CLOUD_FEATURES.has(feature)) {
			return false;
		}
		return ENABLED_FEATURES.has(feature);
	}

	isCertValid(): boolean {
		return true;
	}

	hasFeatureInCert(feature: BooleanLicenseFeature): boolean {
		return this.isLicensed(feature);
	}

	/** @deprecated Use `LicenseState.isDynamicCredentialsLicensed` instead. */
	isDynamicCredentialsEnabled() {
		return this.isLicensed(LICENSE_FEATURES.DYNAMIC_CREDENTIALS);
	}

	/** @deprecated Use `LicenseState.isSharingLicensed` instead. */
	isSharingEnabled() {
		return this.isLicensed(LICENSE_FEATURES.SHARING);
	}

	/** @deprecated Use `LicenseState.isLogStreamingLicensed` instead. */
	isLogStreamingEnabled() {
		return this.isLicensed(LICENSE_FEATURES.LOG_STREAMING);
	}

	/** @deprecated Use `LicenseState.isLdapLicensed` instead. */
	isLdapEnabled() {
		return this.isLicensed(LICENSE_FEATURES.LDAP);
	}

	/** @deprecated Use `LicenseState.isSamlLicensed` instead. */
	isSamlEnabled() {
		return this.isLicensed(LICENSE_FEATURES.SAML);
	}

	/** @deprecated Use `LicenseState.isAiAssistantLicensed` instead. */
	isAiAssistantEnabled() {
		return this.isLicensed(LICENSE_FEATURES.AI_ASSISTANT);
	}

	/** @deprecated Use `LicenseState.isAskAiLicensed` instead. */
	isAskAiEnabled() {
		return this.isLicensed(LICENSE_FEATURES.ASK_AI);
	}

	/** @deprecated Use `LicenseState.isAiCreditsLicensed` instead. */
	isAiCreditsEnabled() {
		return this.isLicensed(LICENSE_FEATURES.AI_CREDITS);
	}

	/** @deprecated Use `LicenseState.isAdvancedExecutionFiltersLicensed` instead. */
	isAdvancedExecutionFiltersEnabled() {
		return this.isLicensed(LICENSE_FEATURES.ADVANCED_EXECUTION_FILTERS);
	}

	/** @deprecated Use `LicenseState.isAdvancedPermissionsLicensed` instead. */
	isAdvancedPermissionsLicensed() {
		return this.isLicensed(LICENSE_FEATURES.ADVANCED_PERMISSIONS);
	}

	/** @deprecated Use `LicenseState.isDebugInEditorLicensed` instead. */
	isDebugInEditorLicensed() {
		return this.isLicensed(LICENSE_FEATURES.DEBUG_IN_EDITOR);
	}

	/** @deprecated Use `LicenseState.isBinaryDataS3Licensed` instead. */
	isBinaryDataS3Licensed() {
		return this.isLicensed(LICENSE_FEATURES.BINARY_DATA_S3);
	}

	/** @deprecated Use `LicenseState.isMultiMainLicensed` instead. */
	isMultiMainLicensed() {
		return this.isLicensed(LICENSE_FEATURES.MULTIPLE_MAIN_INSTANCES);
	}

	/** @deprecated Use `LicenseState.isVariablesLicensed` instead. */
	isVariablesEnabled() {
		return this.isLicensed(LICENSE_FEATURES.VARIABLES);
	}

	/** @deprecated Use `LicenseState.isSourceControlLicensed` instead. */
	isSourceControlLicensed() {
		return this.isLicensed(LICENSE_FEATURES.SOURCE_CONTROL);
	}

	/** @deprecated Use `LicenseState.isExternalSecretsLicensed` instead. */
	isExternalSecretsEnabled() {
		return this.isLicensed(LICENSE_FEATURES.EXTERNAL_SECRETS);
	}

	/** @deprecated Use `LicenseState.isAPIDisabled` instead. */
	isAPIDisabled() {
		return this.isLicensed(LICENSE_FEATURES.API_DISABLED);
	}

	/** @deprecated Use `LicenseState.isWorkerViewLicensed` instead. */
	isWorkerViewLicensed() {
		return this.isLicensed(LICENSE_FEATURES.WORKER_VIEW);
	}

	/** @deprecated Use `LicenseState.isProjectRoleAdminLicensed` instead. */
	isProjectRoleAdminLicensed() {
		return this.isLicensed(LICENSE_FEATURES.PROJECT_ROLE_ADMIN);
	}

	/** @deprecated Use `LicenseState.isProjectRoleEditorLicensed` instead. */
	isProjectRoleEditorLicensed() {
		return this.isLicensed(LICENSE_FEATURES.PROJECT_ROLE_EDITOR);
	}

	/** @deprecated Use `LicenseState.isProjectRoleViewerLicensed` instead. */
	isProjectRoleViewerLicensed() {
		return this.isLicensed(LICENSE_FEATURES.PROJECT_ROLE_VIEWER);
	}

	/** @deprecated Use `LicenseState.isCustomNpmRegistryLicensed` instead. */
	isCustomNpmRegistryEnabled() {
		return this.isLicensed(LICENSE_FEATURES.COMMUNITY_NODES_CUSTOM_REGISTRY);
	}

	/** @deprecated Use `LicenseState.isFoldersLicensed` instead. */
	isFoldersEnabled() {
		return this.isLicensed(LICENSE_FEATURES.FOLDERS);
	}

	getCurrentEntitlements() {
		return [];
	}

	getValue<T extends keyof FeatureReturnType>(feature: T): FeatureReturnType[T] {
		if (feature === 'planName') {
			return 'Self-Hosted OSS' as FeatureReturnType[T];
		}
		if (feature in LOCAL_QUOTAS) {
			return LOCAL_QUOTAS[feature as NumericLicenseFeature] as FeatureReturnType[T];
		}
		if (typeof feature === 'string' && feature.startsWith('feat:')) {
			return this.isLicensed(feature as BooleanLicenseFeature) as FeatureReturnType[T];
		}
		return undefined as FeatureReturnType[T];
	}

	getManagementJwt(): string {
		return '';
	}

	getMainPlan(): undefined {
		return undefined;
	}

	getConsumerId() {
		return this.instanceSettings.instanceId || 'local';
	}

	/** @deprecated Use `LicenseState` instead. */
	getUsersLimit() {
		return this.getValue(LICENSE_QUOTAS.USERS_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	/** @deprecated Use `LicenseState` instead. */
	getTriggerLimit() {
		return this.getValue(LICENSE_QUOTAS.TRIGGER_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	/** @deprecated Use `LicenseState` instead. */
	getVariablesLimit() {
		return this.getValue(LICENSE_QUOTAS.VARIABLES_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	/** @deprecated Use `LicenseState` instead. */
	getAiCredits() {
		return this.getValue(LICENSE_QUOTAS.AI_CREDITS) ?? 0;
	}

	/** @deprecated Use `LicenseState` instead. */
	getWorkflowHistoryPruneLimit() {
		return (
			this.getValue(LICENSE_QUOTAS.WORKFLOW_HISTORY_PRUNE_LIMIT) ??
			DEFAULT_WORKFLOW_HISTORY_PRUNE_LIMIT
		);
	}

	/** @deprecated Use `LicenseState` instead. */
	getTeamProjectLimit() {
		return this.getValue(LICENSE_QUOTAS.TEAM_PROJECT_LIMIT) ?? UNLIMITED_LICENSE_QUOTA;
	}

	getPlanName(): string {
		return this.getValue('planName') ?? 'Self-Hosted OSS';
	}

	getExpiryDate(): Date | null {
		return null;
	}

	getTerminationDate(): Date | null {
		return null;
	}

	getExpiringInDays(): number | undefined {
		return undefined;
	}

	getTerminatingInDays(): number | undefined {
		return undefined;
	}

	getInfo(): string {
		return 'Local entitlements (no remote license)';
	}

	/** @deprecated Use `LicenseState` instead. */
	isWithinUsersLimit() {
		return this.getUsersLimit() === UNLIMITED_LICENSE_QUOTA;
	}
}
