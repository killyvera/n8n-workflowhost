import type { ICredentialDataDecryptedObject, ICredentialType } from 'n8n-workflow';

/**
 * Stub for dynamic-credentials shared-field diffing.
 * Without the EE module, credential updates never rewrite shared connections.
 */
export function getChangedSharedFields(
	_credentialType: ICredentialType,
	_oldData: ICredentialDataDecryptedObject,
	_newData: ICredentialDataDecryptedObject,
): string[] {
	return [];
}
