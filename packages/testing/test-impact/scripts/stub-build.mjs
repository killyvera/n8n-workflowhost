/**
 * Minimal dist stub so consumers (e.g. playwright-janitor) typecheck during
 * monorepo `pnpm build`. Runtime n8n does not load this package.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });

writeFileSync(join(dist, 'index.js'), 'module.exports = {};\n');

writeFileSync(
	join(dist, 'index.d.ts'),
	`export type FileDiffs = Record<string, { before: string; after: string }>;
export type DiscoveredSpec = {
	path: string;
	capabilities: string[];
	services: string[];
	fixturePools?: string[];
};
export type LockfileImporters = Record<string, unknown>;
export type LockfileSnapshots = Record<string, unknown>;
export type WorkspaceImporters = Record<string, unknown>;
export type ManifestChangeKind = string;
export type SelectionStrategy = unknown;
export declare const RUNTIME_SECTIONS: string[];
export declare function encodeImpactMap(...args: unknown[]): unknown;
export declare function buildImpactMap(...args: unknown[]): unknown;
export declare function distributeShards(...args: unknown[]): unknown;
export declare function selectTests(...args: unknown[]): unknown;
export declare function changedRuntimeDepsFromManifests(...args: unknown[]): unknown;
export declare function changedOverrideTargets(...args: unknown[]): unknown;
export declare function isBackendConfig(...args: unknown[]): boolean;
export declare function isTsconfig(...args: unknown[]): boolean;
export declare function isNonImpactful(...args: unknown[]): boolean;
export declare function filterImpactfulChanges(...args: unknown[]): unknown;
export declare function forcesBroad(...args: unknown[]): boolean;
export declare function classifyManifestChange(...args: unknown[]): unknown;
export declare function dropDevDepOnlyDeps(...args: unknown[]): unknown;
export declare function changedRuntimeDeps(...args: unknown[]): unknown;
export declare function stripDependencyFiles(...args: unknown[]): unknown;
export declare function dependentDirs(...args: unknown[]): unknown;
export declare function runtimeClosure(...args: unknown[]): unknown;
export declare function selectImpactedTests(...args: unknown[]): unknown;
export declare class CoverageMapStrategy {}
export declare class DependencyGraphStrategy {}
`,
);
