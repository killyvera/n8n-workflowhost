<script setup lang="ts">
import { computed, useCssModule } from 'vue';
import { BOTO_BRANDING } from '@/config/boto-branding';
import LogoDark from '@/assets/boto/logo-dark.svg';
import LogoLight from '@/assets/boto/logo-light.svg';

const props = withDefaults(
	defineProps<{
		/** large = auth hero; compact = auth inline; small = sidebar */
		size?: 'large' | 'compact' | 'small';
		collapsed?: boolean;
		/** dark = near-black fill (light UI); light = near-white fill (dark sidebar) */
		variant?: 'auto' | 'dark' | 'light';
	}>(),
	{
		size: 'compact',
		collapsed: false,
		variant: 'auto',
	},
);

const $style = useCssModule();

/** Sidebar / dark surfaces need the light (white) wordmark. */
const useLightFill = computed(() => {
	if (props.variant === 'light') return true;
	if (props.variant === 'dark') return false;
	return props.size === 'small';
});

const containerClasses = computed(() => {
	const classes = [$style.logoContainer];
	if (props.size === 'large') classes.push($style.large);
	else if (props.size === 'compact') classes.push($style.compact);
	else {
		classes.push($style.sidebar);
		classes.push(props.collapsed ? $style.sidebarCollapsed : $style.sidebarExpanded);
	}
	return classes;
});
</script>

<template>
	<div
		:class="containerClasses"
		data-test-id="boto-logo"
		:title="BOTO_BRANDING.productName"
		:aria-label="BOTO_BRANDING.productName"
	>
		<LogoLight v-if="useLightFill" :class="$style.logo" />
		<LogoDark v-else :class="$style.logo" />
	</div>
</template>

<style lang="scss" module>
.logoContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-shrink: 0;
}

.logo {
	width: auto;
	height: auto;
	display: block;
}

.large {
	width: 180px;

	.logo {
		width: 100%;
	}
}

.compact {
	width: 72px;

	.logo {
		width: 100%;
	}
}

.sidebar {
	justify-content: flex-start;
	height: 22px;
}

.sidebarExpanded {
	width: auto;
	max-width: 120px;

	.logo {
		height: 22px;
		width: auto;
	}
}

.sidebarCollapsed {
	width: auto;
	max-width: 36px;

	.logo {
		height: 20px;
		width: auto;
	}
}
</style>
