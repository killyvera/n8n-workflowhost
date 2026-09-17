import { defineFrontendModule } from '@n8n/frontend-module-sdk';

/**
 * Disabled Promotions module descriptor — routes/settings stay unregistered.
 */
export const PromotionsModule = defineFrontendModule({
	id: 'promotions',
	name: 'Promotions',
	description: 'Workflow promotions are not available in this fork',
	icon: 'git-branch',
	routes: [],
	settingsPages: [],
	modals: [],
});
