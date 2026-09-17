import { Service } from '@n8n/di';

/**
 * Stub cleanup — no evaluation test-run table to repair in this fork.
 */
@Service()
export class TestRunCleanupService {
	async cleanupIncompleteRuns(): Promise<void> {}
}
