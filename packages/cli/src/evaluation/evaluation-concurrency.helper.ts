import type { GlobalConfig } from '@n8n/config';

type ExecutionsConfig = GlobalConfig['executions'];

/**
 * Resolve evaluation concurrency for this OSS fork.
 * Returns a positive limit (default 1). Env override: N8N_EVALUATION_CONCURRENCY.
 */
export function resolveEvaluationConcurrencyLimit(
	_executionsConfig: ExecutionsConfig,
	_license?: unknown,
): number {
	const fromEnv = Number(process.env.N8N_EVALUATION_CONCURRENCY);
	if (Number.isFinite(fromEnv) && fromEnv > 0) {
		return Math.floor(fromEnv);
	}
	return 1;
}
