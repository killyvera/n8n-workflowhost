import type { IRestApiContext } from '@n8n/rest-api-client';

/**
 * Stub — no promotable changes without the promotions backend module.
 */
export async function getPromotableChanges(
	_context: IRestApiContext,
	_projectId: string,
): Promise<unknown[]> {
	return [];
}
