/**
 * `pnpm lessons:check` — enforces the structure described in AGENTS.md.
 *
 * Checks, in order:
 *   1. every guide matches the slug pattern and has valid front-matter
 *   2. `lesson` / `subject` agree with the folder name
 *   3. every guide has a matching code folder with an `index.ts`
 *   4. every code folder appears in `src/mastra/lessons/index.ts`
 *   5. no lesson imports another lesson
 *
 * Run from the project root (the npm script does).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { asList, asString, parseFrontMatter } from './front-matter';

const ROOT = process.cwd();
const GUIDES_DIR = join(ROOT, 'docs/learn');
const LESSONS_DIR = join(ROOT, 'src/mastra/lessons');
const LESSONS_INDEX = join(LESSONS_DIR, 'index.ts');
const SHARED_DIR = join(LESSONS_DIR, '..', 'shared');

const SLUG_PATTERN = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;
const STATUSES = new Set(['todo', 'in-progress', 'done']);
const REQUIRED_KEYS = ['lesson', 'subject', 'status', 'prereqs', 'primitives', 'docs', 'updated'];

const errors: string[] = [];

function fail(message: string): void {
  errors.push(message);
}

function directories(path: string): string[] {
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((entry) => statSync(join(path, entry)).isDirectory())
    .sort();
}

function tsFiles(path: string): string[] {
  if (!existsSync(path)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    if (statSync(full).isDirectory()) {
      found.push(...tsFiles(full));
    } else if (entry.endsWith('.ts')) {
      found.push(full);
    }
  }
  return found;
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const specifiers: string[] = [];
  const patterns = [/from\s+['"]([^'"]+)['"]/g, /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]) specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function isInside(parent: string, child: string): boolean {
  const rel = relative(parent, child);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

const guideSlugs = directories(GUIDES_DIR);
const codeSlugs = directories(LESSONS_DIR).filter((entry) => entry !== 'node_modules');

if (guideSlugs.length === 0) fail(`no guides found under ${relative(ROOT, GUIDES_DIR)}`);

const lessonsIndex = existsSync(LESSONS_INDEX) ? readFileSync(LESSONS_INDEX, 'utf8') : '';
const lessonNumbers = new Set<number>();

// 1-3. guides -> front-matter + matching code folder
for (const slug of guideSlugs) {
  const guidePath = join(GUIDES_DIR, slug, 'README.md');
  const match = slug.match(SLUG_PATTERN);

  if (!match) {
    fail(`docs/learn/${slug}: folder name must look like 04-memory`);
    continue;
  }

  const number = Number.parseInt(match[1] as string, 10);
  const subject = match[2] as string;
  lessonNumbers.add(number);

  if (!existsSync(guidePath)) {
    fail(`docs/learn/${slug}: missing README.md`);
    continue;
  }

  const frontMatter = parseFrontMatter(readFileSync(guidePath, 'utf8'));
  if (!frontMatter) {
    fail(`docs/learn/${slug}/README.md: missing front-matter block`);
    continue;
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in frontMatter)) fail(`docs/learn/${slug}/README.md: front-matter is missing "${key}"`);
  }

  const declaredNumber = Number.parseInt(asString(frontMatter.lesson), 10);
  if (declaredNumber !== number) {
    fail(`docs/learn/${slug}/README.md: lesson is ${asString(frontMatter.lesson)}, folder says ${number}`);
  }

  const declaredSubject = asString(frontMatter.subject);
  if (declaredSubject !== subject) {
    fail(`docs/learn/${slug}/README.md: subject is "${declaredSubject}", folder says "${subject}"`);
  }

  const status = asString(frontMatter.status);
  if (!STATUSES.has(status)) {
    fail(`docs/learn/${slug}/README.md: status "${status}" must be one of ${[...STATUSES].join(', ')}`);
  }

  if (asList(frontMatter.docs).length === 0) {
    fail(`docs/learn/${slug}/README.md: list at least one mastra.ai doc URL under "docs"`);
  }

  const codePath = join(LESSONS_DIR, slug);
  if (!existsSync(codePath)) {
    fail(`docs/learn/${slug}: no matching src/mastra/lessons/${slug} folder`);
  } else if (!existsSync(join(codePath, 'index.ts'))) {
    fail(`src/mastra/lessons/${slug}: missing index.ts (the lesson registry fragment)`);
  }

  const declaredCode = asString(frontMatter.code);
  if (declaredCode && declaredCode !== `src/mastra/lessons/${slug}`) {
    fail(`docs/learn/${slug}/README.md: code is "${declaredCode}", expected "src/mastra/lessons/${slug}"`);
  }

  if (!lessonsIndex.includes(`'./${slug}'`)) {
    fail(`src/mastra/lessons/index.ts: "${slug}" is not imported`);
  }
}

// 3b. prereqs must point at existing, earlier lessons
for (const slug of guideSlugs) {
  const guidePath = join(GUIDES_DIR, slug, 'README.md');
  if (!existsSync(guidePath)) continue;
  const frontMatter = parseFrontMatter(readFileSync(guidePath, 'utf8'));
  if (!frontMatter) continue;

  const own = Number.parseInt(slug.slice(0, 2), 10);
  for (const prereq of asList(frontMatter.prereqs)) {
    const value = Number.parseInt(prereq, 10);
    if (Number.isNaN(value)) {
      fail(`docs/learn/${slug}/README.md: prereq "${prereq}" is not a lesson number`);
      continue;
    }
    if (!lessonNumbers.has(value)) fail(`docs/learn/${slug}/README.md: prereq ${value} has no guide`);
    if (value >= own) fail(`docs/learn/${slug}/README.md: prereq ${value} must come before ${own}`);
  }
}

// 3c. code -> guide (reverse direction)
for (const slug of codeSlugs) {
  if (!SLUG_PATTERN.test(slug)) {
    fail(`src/mastra/lessons/${slug}: folder name must look like 04-memory`);
    continue;
  }
  if (!existsSync(join(GUIDES_DIR, slug, 'README.md'))) {
    fail(`src/mastra/lessons/${slug}: no matching docs/learn/${slug}/README.md`);
  }
}

// 5. no cross-lesson imports
for (const slug of codeSlugs) {
  const lessonDir = join(LESSONS_DIR, slug);
  if (!existsSync(lessonDir)) continue;

  for (const file of tsFiles(lessonDir)) {
    for (const specifier of importsOf(file)) {
      if (!specifier.startsWith('.')) continue;

      const target = resolve(dirname(file), specifier);
      // Allowed: the lesson's own files, src/mastra/shared/, and the shared
      // contract files that sit directly in src/mastra/lessons/ (registry.ts).
      if (
        isInside(lessonDir, target) ||
        isInside(SHARED_DIR, target) ||
        dirname(target) === LESSONS_DIR
      ) {
        continue;
      }

      fail(
        `${relative(ROOT, file)}: imports "${specifier}", which lands outside this lesson. ` +
          `Lessons may only import from their own folder or src/mastra/shared/.`,
      );
    }
  }
}

// Report

if (errors.length > 0) {
  console.error(`lessons: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  ✗ ${error}`);
  process.exit(1);
}

console.log(
  `lessons: OK — ${guideSlugs.length} guides, ${codeSlugs.length} code folders, ` +
    `${lessonNumbers.size} unique lesson numbers.`,
);
