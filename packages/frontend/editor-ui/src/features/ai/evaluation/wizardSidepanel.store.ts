import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * Disabled evaluations wizard sidepanel stub.
 */
export const useEvaluationsWizardSidepanelStore = defineStore('evaluationsWizardSidepanel', () => {
	const isOpen = ref(false);
	const pendingSeedExecution = ref<unknown>(null);
	const activeStep = ref(0);

	const isFeatureEnabled = computed(() => false);

	function open(step = 0): void {
		activeStep.value = step;
		isOpen.value = true;
	}

	function close(): void {
		isOpen.value = false;
	}

	function setPendingSeedExecution(execution: unknown): void {
		pendingSeedExecution.value = execution;
	}

	function clearPendingSeedExecution(): void {
		pendingSeedExecution.value = null;
	}

	return {
		isOpen,
		isFeatureEnabled,
		pendingSeedExecution,
		activeStep,
		open,
		close,
		setPendingSeedExecution,
		clearPendingSeedExecution,
	};
});
