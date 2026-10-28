import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadEnv } from './load-env';
import { rootPath } from '../src/mastra/shared/local-paths';
import { environmentProblems } from '../src/mastra/shared/environment';
loadEnv();
const problems = environmentProblems();
try {
  const version = execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--version'], { encoding: 'utf8' }).trim();
  if (version !== '12.14.0') problems.push(`Use pnpm 12.14.0 (found ${version}).`);
} catch { problems.push('Install pnpm 12.14.0 and ensure it is on PATH.'); }
const manifest = JSON.parse(readFileSync(rootPath('package.json'), 'utf8'));
console.log(`Node ${process.versions.node}; expected Node 24. pnpm: ${manifest.packageManager}`);
console.log(`Project: ${rootPath('.')}`);
console.log(`State: ${rootPath('mastra-playground.db')} and ${rootPath('mastra-observability.duckdb')}`);
console.log(`Environment file: ${existsSync(rootPath('.env')) ? 'present' : 'absent (shell variables are also supported)'}`);
for (const problem of problems) console.error(`✗ ${problem}`);
if (problems.length) process.exitCode = 1;
else console.log('Setup OK. No API calls were made; credentials were not printed.');
