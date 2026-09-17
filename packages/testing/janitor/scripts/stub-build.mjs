/**
 * No-op dist for Docker/prod monorepo builds. Janitor is CI tooling only.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'index.js'), 'module.exports = {};\n');
writeFileSync(join(dist, 'index.d.ts'), 'export {};\n');
