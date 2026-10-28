import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

// Local state (SQLite, DuckDB) lives at the playground root, addressed
// absolutely.
//
// Relative paths are resolved against `process.cwd()`, and `process.cwd()` is
// not the same for every entry point: `mastra dev` runs its bundle from
// `.mastra/output/index.mjs` *with* `src/mastra/public` as the working
// directory. So `file:./mastra-playground.db` meant one file for
// `pnpm lesson 07` and a different one for Studio — an index that was ingested
// and then invisible to the agent reading it. Mastra's own preflight flags the
// hazard: `.mastra/output/preflight-local-paths.json` records
// "LibSQL/SQLite file path relative to the build host".
//
// The anchor below is the entry file, not the cwd. Both `.mastra/output/*.mjs`
// and `scripts/*.ts` live inside the repo, so walking up to the directory that
// contains `src/mastra` finds the root from either one.

const ROOT_MARKER = join('src', 'mastra');

function findRoot(start: string): string {
  let current = start;
  for (;;) {
    if (existsSync(join(current, ROOT_MARKER))) return current;
    const parent = dirname(current);
    if (parent === current) return process.cwd(); // no marker found: fall back
    current = parent;
  }
}

const root = findRoot(dirname(process.argv[1] ?? join(process.cwd(), 'index.js')));

/** Absolute path to a file at the playground root, e.g. `rootPath('mastra-playground.db')`. */
export function rootPath(file: string): string {
  return join(root, file);
}
