import { computed, type ComputedRef } from 'vue';

/**
 * Evaluations license gate — not licensed in this OSS fork.
 */
export function useEvaluationsLicense(): {
	isLicensed: ComputedRef<boolean>;
	isResolved: ComputedRef<boolean>;
	ensureLicenseLoaded: () => Promise<void>;
} {
	return {
		isLicensed: computed(() => false),
		isResolved: computed(() => true),
		ensureLicenseLoaded: async () => undefined,
	};
}
