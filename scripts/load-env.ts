/**
 * `mastra dev` / `mastra start` load `.env` themselves. Plain scripts do not,
 * so import this before touching a model to get the same environment.
 */
import { existsSync, readFileSync } from 'node:fs';
import { rootPath } from '../src/mastra/shared/local-paths';

export function loadEnv(): void {
  const path = rootPath('.env');
  if (!existsSync(path)) return;

  // Node >= 20.12 / 21.7.
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(path);
    return;
  }

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
}
