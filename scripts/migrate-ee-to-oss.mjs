#!/usr/bin/env node
/**
 * Migrate Enterprise (.ee) paths to OSS module paths and rewrite imports.
 * Run from repo root: node scripts/migrate-ee-to-oss.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagesDir = path.join(root, 'packages');

/** Cloud / billing / out-of-scope modules to delete (plan fases 4 + deferred). */
const DELETE_DIR_GLOBS = [
	'packages/cli/src/modules/promotions',
	'packages/cli/src/modules/instance-reporting',
	'packages/cli/src/modules/dynamic-credentials',
	'packages/cli/src/modules/workflow-reviews',
	'packages/cli/src/evaluation',
	'packages/cli/test/integration/dynamic-credentials',
	'packages/frontend/editor-ui/src/features/integrations/promotions',
	'packages/frontend/editor-ui/src/features/ai/evaluation',
	'packages/@n8n/ai-workflow-builder',
];

function walk(dir, out = []) {
	if (!fs.existsSync(dir)) return out;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
		if (entry.isDirectory()) walk(full, out);
		else out.push(full);
	}
	return out;
}

function rmrf(target) {
	if (!fs.existsSync(target)) return;
	fs.rmSync(target, { recursive: true, force: true });
	console.log('deleted', path.relative(root, target));
}

function destWithoutEe(fromPath) {
	const rel = path.relative(root, fromPath);
	const parts = rel.split(path.sep);
	const newParts = parts.map((p) => {
		if (p.endsWith('.ee')) return p.slice(0, -3);
		return p.replace(/\.ee\./g, '.').replace(/\.ee$/, '');
	});
	return path.join(root, ...newParts);
}

function destFeatureFallback(fromPath) {
	const rel = path.relative(root, fromPath);
	const parts = rel.split(path.sep);
	const newParts = parts.map((p) => {
		if (p.endsWith('.ee')) return `${p.slice(0, -3)}.feature`;
		return p.replace(/\.ee\./g, '.feature.').replace(/\.ee$/, '.feature');
	});
	return path.join(root, ...newParts);
}

/** @type {Array<{from: string, to: string}>} */
const renames = [];

function renamePath(fromPath) {
	if (!fs.existsSync(fromPath)) return;
	let toPath = destWithoutEe(fromPath);
	if (toPath === fromPath) return;
	if (fs.existsSync(toPath)) {
		toPath = destFeatureFallback(fromPath);
		if (fs.existsSync(toPath) || toPath === fromPath) {
			console.warn('unresolvable clash, deleting ee source', path.relative(root, fromPath));
			rmrf(fromPath);
			return;
		}
	}
	fs.mkdirSync(path.dirname(toPath), { recursive: true });
	fs.renameSync(fromPath, toPath);
	renames.push({ from: fromPath, to: toPath });
	console.log('renamed', path.relative(root, fromPath), '->', path.relative(root, toPath));
}

// 1) Delete cloud / deferred EE trees
for (const rel of DELETE_DIR_GLOBS) {
	rmrf(path.join(root, rel));
}

// 2) Rename EE directories (deepest first)
const allDirs = [];
function collectDirs(dir) {
	if (!fs.existsSync(dir)) return;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name === 'dist') continue;
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			collectDirs(full);
			if (entry.name.includes('.ee')) allDirs.push(full);
		}
	}
}
collectDirs(packagesDir);
allDirs.sort((a, b) => b.length - a.length);
for (const d of allDirs) renamePath(d);

// 3) Rename remaining *.ee.* files
const eeFiles = walk(packagesDir).filter((f) => {
	const base = path.basename(f);
	return base.includes('.ee.');
});
eeFiles.sort((a, b) => b.length - a.length);
for (const f of eeFiles) renamePath(f);

// 4) Build import rewrite map from actual renames + standard patterns
const textExt = new Set([
	'.ts',
	'.tsx',
	'.vue',
	'.js',
	'.mjs',
	'.cjs',
	'.json',
	'.md',
	'.yml',
	'.yaml',
]);

/** @type {Array<[RegExp, string]>} */
const importFixes = [
	[/environments\.ee/g, 'environments'],
	[/evaluation\.ee/g, 'evaluation'],
	[/permissions\.ee/g, 'permissions'],
	[/sso\.ee/g, 'sso'],
	[/dynamic-credentials\.ee/g, 'dynamic-credentials'],
	[/external-secrets\.ee/g, 'external-secrets'],
	[/instance-reporting\.ee/g, 'instance-reporting'],
	[/ldap\.ee/g, 'ldap'],
	[/log-streaming\.ee/g, 'log-streaming'],
	[/promotions\.ee/g, 'promotions'],
	[/provisioning\.ee/g, 'provisioning'],
	[/source-control\.ee/g, 'source-control'],
	[/workflow-reviews\.ee/g, 'workflow-reviews'],
	[/secretsProviders\.ee/g, 'secretsProviders'],
	[/externalSecrets\.ee/g, 'externalSecrets'],
	[/logStreaming\.ee/g, 'logStreaming'],
	[/sourceControl\.ee/g, 'sourceControl'],
	[/orchestration\.ee/g, 'orchestration'],
	[/ai-workflow-builder\.ee/g, 'ai-workflow-builder'],
	[/@n8n\/ai-workflow-builder\.ee/g, '@n8n/ai-workflow-builder'],
	[/project\.service\.ee/g, 'project.service'],
	[/credentials\.service\.ee/g, 'credentials.feature.service'],
	[/workflow\.service\.ee/g, 'workflow.feature.service'],
	[/execution\.service\.ee/g, 'execution.feature.service'],
	[/variables\.service\.ee/g, 'variables.service'],
	[/variables\.controller\.ee/g, 'variables.controller'],
	[/workflows\.ee\.store/g, 'workflows.feature.store'],
	[/workflows\.ee(['"])/g, 'workflows.feature$1'],
	[/credentials\.ee\.api/g, 'credentials.feature.api'],
	[/users\.handler\.ee/g, 'users.handler'],
	[/eventbus\.ee/g, 'eventbus.feature'],
];

// Add precise renames from filesystem moves
for (const { from, to } of renames) {
	const fromRel = path.relative(root, from).replace(/\\/g, '/');
	const toRel = path.relative(root, to).replace(/\\/g, '/');
	const fromMod = fromRel
		.replace(/^packages\/cli\/src\//, '@/')
		.replace(/\.(ts|js|vue)$/, '')
		.replace(/\\/g, '/');
	const toMod = toRel
		.replace(/^packages\/cli\/src\//, '@/')
		.replace(/\.(ts|js|vue)$/, '')
		.replace(/\\/g, '/');
	if (fromMod !== toMod && fromMod.includes('@/')) {
		importFixes.push([
			new RegExp(fromMod.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
			toMod,
		]);
	}
	// Relative basename swaps
	const fromBase = path.basename(from).replace(/\.(ts|js|vue)$/, '');
	const toBase = path.basename(to).replace(/\.(ts|js|vue)$/, '');
	if (fromBase !== toBase && fromBase.includes('.ee')) {
		importFixes.push([
			new RegExp(fromBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
			toBase,
		]);
	}
}

let changedFiles = 0;
const scanRoots = [packagesDir, path.join(root, 'scripts')];
for (const scanRoot of scanRoots) {
	for (const file of walk(scanRoot)) {
		const ext = path.extname(file);
		if (!textExt.has(ext)) continue;
		let content = fs.readFileSync(file, 'utf8');
		const original = content;
		for (const [re, rep] of importFixes) {
			content = content.replace(re, rep);
		}
		if (content !== original) {
			fs.writeFileSync(file, content);
			changedFiles++;
		}
	}
}

console.log('renames:', renames.length);
console.log('updated files for imports:', changedFiles);
console.log('done');
