import { computed, type ComputedRef } from 'vue';

/** Agent evaluations feature flag — always off in this fork. */
export function useAgentEvalsFlag(): ComputedRef<boolean> {
	return computed(() => false);
}
