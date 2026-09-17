import { hasScope } from './has-scope';
import type { AuthPrincipal, Scope, ScopeOptions } from '../types';
import { getAuthPrincipalScopes } from './get-role-scopes';

/**
 * Checks if an auth-principal has specified global scope(s).
 * @param principal - The authentication principal to check permissions for
 * @param scope - Scope(s) to verify
 */
export const hasGlobalScope = (
	principal: AuthPrincipal,
	scope: Scope | Scope[],
	scopeOptions?: ScopeOptions,
): boolean => {
	const global = getAuthPrincipalScopes(principal);
	return hasScope(scope, { global }, undefined, scopeOptions);
};
