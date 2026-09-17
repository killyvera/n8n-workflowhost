import { computed, ref } from 'vue';

/**
 * Workflow evaluation node presence — always empty/disabled.
 */
export function useWorkflowEvaluationState() {
	return {
		evaluationTriggerExists: computed(() => false),
		evaluationSetMetricsNodeExist: computed(() => false),
		evaluationSetOutputsNodeExist: computed(() => false),
		metricSourceByKey: ref<Record<string, unknown>>({}),
	};
}
