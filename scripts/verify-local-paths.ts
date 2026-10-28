import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Reproduce the generated module in a disposable checkout. No server, storage
// connection, .env, or model is loaded. Each child gets a fresh module cache.
export function verifyLocalPaths(): void {
  // macOS exposes its temporary directory through /var -> /private/var.
  const checkout = realpathSync(mkdtempSync(join(tmpdir(), 'mastra-local-paths-')));
  try {
    const publicDir = join(checkout, 'src/mastra/public');
    const outputDir = join(checkout, '.mastra/output');
    mkdirSync(publicDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });
    const source = readFileSync(new URL('../src/mastra/shared/local-paths.ts', import.meta.url), 'utf8');
    const modulePath = join(outputDir, 'local-paths.mjs');
    writeFileSync(modulePath, ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
    }).outputText);
    const program = `import { rootPath } from ${JSON.stringify(pathToFileURL(modulePath).href)}; console.log(rootPath('mastra-playground.db'));`;
    for (const anchor of [join(checkout, '.mastra'), checkout, undefined]) {
      const env = { ...process.env };
      if (anchor === undefined) delete env.MASTRA_PROJECT_ROOT;
      else env.MASTRA_PROJECT_ROOT = anchor;
      const child = spawnSync(process.execPath, ['--input-type=module', '--eval', program], {
        cwd: publicDir, env, encoding: 'utf8', timeout: 5_000,
      });
      assert.equal(child.status, 0, child.stderr || child.error?.message);
      assert.equal(child.stdout.trim(), join(checkout, 'mastra-playground.db'));
    }
    const invalid = spawnSync(process.execPath, ['--input-type=module', '--eval', program], {
      cwd: publicDir, env: { ...process.env, MASTRA_PROJECT_ROOT: tmpdir() },
      encoding: 'utf8', timeout: 5_000,
    });
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Cannot locate project root/);
  } finally { rmSync(checkout, { recursive: true, force: true }); }
}
