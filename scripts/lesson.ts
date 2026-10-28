/**
 * `pnpm lessons`        — list the curriculum with each guide's status
 * `pnpm lesson 01`      — run one lesson's headless demo, nothing else mounted
 * `pnpm lesson memory`  — same, matched by subject
 *
 * The UI walkthroughs live in docs/learn/<slug>/README.md. A lesson without a
 * `demo()` is guide-only until it is written.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { asList, asString, parseFrontMatter } from './front-matter';
import { requireModelEnvironment } from '../src/mastra/shared/environment';
import { loadEnv } from './load-env';
import { lessons } from '../src/mastra/lessons';

const GUIDES_DIR = 'docs/learn';

type LessonSummary = {
  id: string;
  number: number;
  subject: string;
};

async function list(): Promise<void> {

  console.log('Lesson                Availability  Status        Primitives');
  console.log('--------------------  ------------  ------------------------------------------');
  for (const lesson of lessons) {
    const guidePath = join(GUIDES_DIR, lesson.id, 'README.md');
    const frontMatter = existsSync(guidePath) ? parseFrontMatter(readFileSync(guidePath, 'utf8')) : null;
    const status = frontMatter ? asString(frontMatter.status) || 'unknown' : 'no guide';
    const primitives = asList(frontMatter?.primitives).join(', ') || '—';
    console.log(`${lesson.id.padEnd(20)}  ${asString(frontMatter?.availability).padEnd(12)}  ${status.padEnd(12)}  ${primitives}`);
  }
  console.log('\nRead a guide: docs/learn/<slug>/README.md');
}

async function run(argument: string): Promise<void> {

  const wanted = /^\d{1,2}$/.test(argument) ? argument.padStart(2, '0') : argument;
  const lesson = lessons.find(
    (candidate) =>
      candidate.id === wanted || candidate.id.startsWith(`${wanted}-`) || candidate.subject === wanted,
  );

  if (!lesson) {
    const available = lessons.map((candidate) => candidate.id).join(', ');
    console.error(`No lesson matches "${argument}". Available: ${available}`);
    process.exitCode = 1;
    return;
  }

  // Mount only this lesson, so its primitives are the only ones in the registry.
  process.env.MASTRA_LESSONS = lesson.id;

  const { demo } = await lesson.load();
  if (!demo) {
    console.log(`${lesson.id} has no headless demo yet. Follow docs/learn/${lesson.id}/README.md`);
    return;
  }
  requireModelEnvironment();
  const { mastra } = await import('../src/mastra/index');
  try { await demo(mastra); } finally { await mastra.shutdown(); }
}

async function main(): Promise<void> {
  // `mastra dev` loads .env itself; a plain script has to ask.
  loadEnv();

  const argument = process.argv[2];

  if (!argument || argument === '--list') {
    await list();
    return;
  }

  await run(argument);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
