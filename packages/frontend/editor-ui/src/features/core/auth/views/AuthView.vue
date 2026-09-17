<script setup lang="ts">
import SSOLogin from '@/features/settings/sso/components/SSOLogin.vue';
import type { FormFieldValueUpdate, IFormBoxConfig } from '@/Interface';
import type { EmailOrLdapLoginIdAndPassword } from './SigninView.vue';
import BotoLogo from '@/app/components/BotoLogo.vue';
import { BOTO_BRANDING } from '@/config/boto-branding';

import { N8nFormBox, N8nLink, N8nText } from '@n8n/design-system';
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
		<div :class="$style.brandBlock">
			<N8nText size="small" color="text-light">{{ BOTO_BRANDING.poweredByLabel }}</N8nText>
			<BotoLogo size="compact" />
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
			<N8nText tag="p" size="small" color="text-light">
				{{ BOTO_BRANDING.hostedBy }}
				<N8nLink :to="BOTO_BRANDING.hosting" new-window size="small">
					{{ BOTO_BRANDING.hostingName }}
				</N8nLink>
			</N8nText>
		</div>
	</div>
</template>

<style lang="scss" module>
.container {
	display: flex;
	align-items: center;
	flex-direction: column;
	padding-top: var(--spacing--2xl);

	> * {
		width: 352px;
	}
}

.brandBlock {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--spacing--2xs);
	margin-bottom: var(--spacing--2xl);
	text-align: center;
}

.textContainer {
	text-align: center;
	margin-bottom: var(--spacing--m);
}

.formContainer {
	padding-bottom: var(--spacing--m);
}

.hosting {
	text-align: center;
	margin-top: var(--spacing--l);
}
</style>
