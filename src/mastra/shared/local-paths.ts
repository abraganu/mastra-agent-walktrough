import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
// Both the module URL and Mastra's environment value are search anchors, not
// necessarily the checkout root. In particular, the dev CLI sets
// MASTRA_PROJECT_ROOT to `.mastra`, while `mastra start` uses the checkout.
// Walk upward to the same marker from either anchor, independently of cwd.

const ROOT_MARKER = join('src', 'mastra');

function findRoot(start: string): string {
  let current = start;
  for (;;) {
    if (existsSync(join(current, ROOT_MARKER))) return current;
    const parent = dirname(current);
    if (parent === current) throw new Error('Cannot locate project root; set MASTRA_PROJECT_ROOT to the checkout path.');
    current = parent;
  }
}

const root = findRoot(process.env.MASTRA_PROJECT_ROOT?.trim()
  ? resolve(process.env.MASTRA_PROJECT_ROOT.trim())
  : dirname(fileURLToPath(import.meta.url)));

/** Absolute path to a file at the playground root, e.g. `rootPath('mastra-playground.db')`. */
export function rootPath(file: string): string {
  return join(root, file);
}
