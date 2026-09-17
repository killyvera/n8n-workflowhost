import type { ModuleInterface } from '@n8n/decorators';
import { BackendModule, OnShutdown } from '@n8n/decorators';
import { Container } from '@n8n/di';

@BackendModule({ name: 'external-secrets', licenseFlag: 'feat:externalSecrets' })
export class ExternalSecretsModule implements ModuleInterface {
	async init() {
		await import('./external-secrets.controller.js');
		await import('./external-secrets-settings.controller.js');

		await import('./secrets-providers-types.controller.js');
		await import('./secrets-providers-connections.controller.js');
		await import('./secrets-providers-completions.controller.js');
		await import('./secrets-providers-project.controller.js');

		const { ExternalSecretsManager } = await import('./external-secrets-manager.js');
		const { ExternalSecretsProxy } = await import('n8n-core');

		const externalSecretsManager = Container.get(ExternalSecretsManager);
		const externalSecretsProxy = Container.get(ExternalSecretsProxy);

		await externalSecretsManager.init();
		externalSecretsProxy.setManager(externalSecretsManager);
	}

	async settings() {
		const { ExternalSecretsConfig } = await import('./external-secrets.config.js');
		const config = Container.get(ExternalSecretsConfig);

		const { ExternalSecretsSettingsService } = await import(
			'./external-secrets-settings.service.js'
		);
		const settingsService = Container.get(ExternalSecretsSettingsService);

		return {
			multipleConnections: config.externalSecretsMultipleConnections,
			forProjects: config.externalSecretsForProjects,
			roleBasedAccess: config.externalSecretsRoleBasedAccess,
			systemRolesEnabled: config.externalSecretsRoleBasedAccess
				? await settingsService.isSystemRolesEnabled()
				: false,
		};
	}

	@OnShutdown()
	async shutdown() {
		const { ExternalSecretsManager } = await import('./external-secrets-manager.js');

		Container.get(ExternalSecretsManager).shutdown();
	}
}
