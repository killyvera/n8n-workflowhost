import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * Disabled evaluation store stub (Enterprise evaluation UI removed).
 */
export const useEvaluationStore = defineStore('evaluation', () => {
	const isFeatureEnabled = ref(false);
	const isEvaluationEnabled = computed(() => false);
	const testRunsById = ref<Record<string, unknown>>({});
	const testCaseExecutionsById = ref<Record<string, unknown>>({});

	async function fetchTestRuns(_workflowId?: string): Promise<unknown[]> {
		return [];
	}

	async function getTestRun(_params: unknown): Promise<null> {
		return null;
	}

	async function fetchTestCaseExecutions(_params: unknown): Promise<unknown[]> {
		return [];
	}

	return {
		isFeatureEnabled,
		isEvaluationEnabled,
		testRunsById,
		testCaseExecutionsById,
		fetchTestRuns,
		getTestRun,
		fetchTestCaseExecutions,
	};
});
