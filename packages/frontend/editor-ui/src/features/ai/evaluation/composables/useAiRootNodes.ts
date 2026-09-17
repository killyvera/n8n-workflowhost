import { computed, type ComputedRef } from 'vue';

export type AiRootNodeSummary = {
	name: string;
	type: string;
};

/** AI root nodes for evaluations — always empty in this fork. */
export function useAiRootNodes(): ComputedRef<AiRootNodeSummary[]> {
	return computed(() => []);
}
