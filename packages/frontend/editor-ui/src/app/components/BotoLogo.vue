<script setup lang="ts">
import { computed, useCssModule } from 'vue';
import { useUIStore } from '@/app/stores/ui.store';
import { BOTO_BRANDING } from '@/config/boto-branding';
/** BOTO-only wordmark (no "Technologies") — dark fill for light theme */
import LogoWordDarkUrl from '@/assets/boto/logo-mark.svg?url';
/** BOTO-only wordmark — light fill for dark theme */
import LogoWordLightUrl from '@/assets/boto/logo-mark-word.svg?url';
import LogoMarkPng from '@/assets/boto/logo-mark.png';

const props = withDefaults(
	defineProps<{
		/** large = auth hero; compact = auth inline; small = sidebar */
		size?: 'large' | 'compact' | 'small';
		collapsed?: boolean;
		/** auto follows applied theme; light/dark force a fill */
		variant?: 'auto' | 'dark' | 'light';
	}>(),
	{
		size: 'compact',
		collapsed: false,
		variant: 'auto',
	},
);

const $style = useCssModule();
const uiStore = useUIStore();

const useLightFill = computed(() => {
	if (props.variant === 'light') return true;
	if (props.variant === 'dark') return false;
	return uiStore.appliedTheme === 'dark';
});

const isCollapsedMark = computed(() => props.size === 'small' && props.collapsed);

const logoSrc = computed(() => {
	if (isCollapsedMark.value) return LogoMarkPng;
	return useLightFill.value ? LogoWordLightUrl : LogoWordDarkUrl;
});

const containerClasses = computed(() => {
	const classes = [$style.logoContainer];
	if (useLightFill.value) classes.push($style.lightFill);
	else classes.push($style.darkFill);

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
		<!-- Collapsed: mask so glyph follows theme without opaque PNG plate -->
		<span
			v-if="isCollapsedMark"
			:class="$style.mark"
			:style="{
				WebkitMaskImage: `url(${LogoMarkPng})`,
				maskImage: `url(${LogoMarkPng})`,
			}"
			role="img"
			:aria-label="BOTO_BRANDING.shortName"
		/>
		<img v-else :src="logoSrc" :alt="BOTO_BRANDING.shortName" :class="$style.logoImg" />
	</div>
</template>

<style lang="scss" module>
.logoContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-shrink: 0;
	line-height: 0;
}

.lightFill {
	color: #f4f5f2;
}

.darkFill {
	color: #080a0c;
}

.logoImg {
	display: block;
	width: 100%;
	height: auto;
	object-fit: contain;
	background: transparent;
}

.mark {
	display: block;
	width: 22px;
	height: 22px;
	background-color: currentColor;
	mask-repeat: no-repeat;
	mask-position: center;
	mask-size: contain;
	-webkit-mask-repeat: no-repeat;
	-webkit-mask-position: center;
	-webkit-mask-size: contain;
}

.large {
	width: 140px;
}

.compact {
	width: 88px;
}

.sidebar {
	justify-content: flex-start;
	min-height: 22px;
}

.sidebarExpanded {
	width: 72px;

	.logoImg {
		width: 72px;
		height: 22px;
		object-fit: contain;
		object-position: left center;
	}
}

.sidebarCollapsed {
	width: 28px;
	justify-content: center;
}
</style>
