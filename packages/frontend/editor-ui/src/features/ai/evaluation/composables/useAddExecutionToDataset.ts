import { computed, type ComputedRef, type Ref } from 'vue';

/**
 * "Add execution to dataset" — disabled in this fork.
 */
export function useAddExecutionToDataset(_workflowId?: Ref<string> | string): {
	isFeatureEnabled: ComputedRef<boolean>;
} {
	return {
		isFeatureEnabled: computed(() => false),
	};
}
