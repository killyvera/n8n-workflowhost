<script setup lang="ts">
import { computed, useCssModule } from 'vue';
import { BOTO_BRANDING } from '@/config/boto-branding';
import LogoDark from '@/assets/boto/logo-dark.svg';
import LogoLight from '@/assets/boto/logo-light.svg';
import LogoMark from '@/assets/boto/logo-mark.svg';

const props = withDefaults(
	defineProps<{
		/** large = auth/setup; small = sidebar */
		size?: 'large' | 'small';
		collapsed?: boolean;
		/** Prefer dark-fill assets on light auth backgrounds */
		variant?: 'auto' | 'dark' | 'light';
	}>(),
	{
		size: 'large',
		collapsed: false,
		variant: 'auto',
	},
);

const $style = useCssModule();

const useDarkFill = computed(() => {
	if (props.variant === 'dark') return true;
	if (props.variant === 'light') return false;
	return props.size === 'large';
});

const showWordmark = computed(() => {
	if (props.size === 'large') return true;
	return !props.collapsed;
});

const containerClasses = computed(() => {
	if (props.size === 'large') {
		return [$style.logoContainer, $style.large];
	}
	return [
		$style.logoContainer,
		$style.sidebar,
		props.collapsed ? $style.sidebarCollapsed : $style.sidebarExpanded,
	];
});
</script>

<template>
	<div
		:class="containerClasses"
		data-test-id="boto-logo"
		:title="BOTO_BRANDING.productName"
		:aria-label="BOTO_BRANDING.productName"
	>
		<LogoMark v-if="!showWordmark" :class="$style.mark" />
		<LogoDark v-else-if="useDarkFill" :class="$style.logo" />
		<LogoLight v-else :class="$style.logo" />
	</div>
</template>

<style lang="scss" module>
.logoContainer {
	display: flex;
	justify-content: center;
	align-items: center;
}

.logo {
	width: 100%;
	height: auto;
	display: block;
}

.mark {
	width: 28px;
	height: auto;
	display: block;
}

.large {
	width: 220px;
}

.sidebar {
	justify-content: flex-start;
}

.sidebarExpanded {
	width: 120px;
}

.sidebarCollapsed {
	width: 28px;
}
</style>
