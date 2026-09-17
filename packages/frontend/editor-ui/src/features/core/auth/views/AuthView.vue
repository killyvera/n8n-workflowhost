<script setup lang="ts">
import SSOLogin from '@/features/settings/sso/components/SSOLogin.vue';
import type { FormFieldValueUpdate, IFormBoxConfig } from '@/Interface';
import type { EmailOrLdapLoginIdAndPassword } from './SigninView.vue';
import BotoLogo from '@/app/components/BotoLogo.vue';
import { BOTO_BRANDING } from '@/config/boto-branding';

import { N8nFormBox, N8nText } from '@n8n/design-system';
withDefaults(
	defineProps<{
		form: IFormBoxConfig;
		formLoading?: boolean;
		subtitle?: string;
		withSso?: boolean;
	}>(),
	{
		formLoading: false,
		withSso: false,
	},
);

const emit = defineEmits<{
	update: [FormFieldValueUpdate];
	submit: [values: EmailOrLdapLoginIdAndPassword];
	secondaryClick: [];
}>();

const onUpdate = (e: FormFieldValueUpdate) => {
	emit('update', e);
};

const onSubmit = (data: unknown) => {
	emit('submit', data as EmailOrLdapLoginIdAndPassword);
};

const onSecondaryClick = () => {
	emit('secondaryClick');
};
</script>

<template>
	<div :class="$style.container">
		<BotoLogo size="large" variant="dark" />
		<div :class="$style.brandMeta">
			<N8nText size="large" bold>{{ BOTO_BRANDING.productName }}</N8nText>
			<N8nText size="small" color="text-light">{{ BOTO_BRANDING.tagline }}</N8nText>
			<N8nText size="small" color="text-light">
				{{ BOTO_BRANDING.poweredBy }} · {{ BOTO_BRANDING.basedOn }}
			</N8nText>
		</div>
		<div v-if="subtitle" :class="$style.textContainer">
			<N8nText size="large">{{ subtitle }}</N8nText>
		</div>
		<div :class="$style.formContainer">
			<N8nFormBox
				v-bind="form"
				data-test-id="auth-form"
				:button-loading="formLoading"
				@secondary-click="onSecondaryClick"
				@submit="onSubmit"
				@update="onUpdate"
			>
				<SSOLogin v-if="withSso" />
			</N8nFormBox>
		</div>
		<div :class="$style.hosting">
			<N8nText size="small" color="text-light">{{ BOTO_BRANDING.hostingName }}</N8nText>
		</div>
	</div>
</template>

<style lang="scss" module>
body {
	background-color: var(--color--background--light-2);
}

.container {
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-top: var(--spacing--2xl);

	> * {
		width: 352px;
	}
}

.textContainer {
	text-align: center;
}

.brandMeta {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing--3xs);
	margin: var(--spacing--m) 0 var(--spacing--l);
	text-align: center;
}

.formContainer {
	padding-bottom: var(--spacing--xl);
}

.hosting {
	margin-top: var(--spacing--m);
	text-align: center;
}
</style>
