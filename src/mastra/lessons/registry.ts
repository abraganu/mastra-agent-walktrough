import type { Config, Mastra } from '@mastra/core';

/**
 * One lesson = one subject = one slug (`NN-kebab-subject`).
 *
 * The slug is the join key between the two mirrored trees:
 *   docs/learn/<slug>/README.md        ← the guide (front-matter carries status)
 *   src/mastra/lessons/<slug>/         ← the code (this registry fragment)
 *
 * Rules enforced by `pnpm lessons:check`:
 *   - a lesson only imports from `src/mastra/shared/` and from its own folder
 *   - primitives are namespaced with the lesson number (`l04-...`)
 *   - no lesson uses Mastra's file-based `agents/<name>/config.ts` discovery
 */

/** The slice of the Mastra config a lesson is allowed to contribute. */
export type LessonRegister = Partial<
  Pick<Config, 'agents' | 'tools' | 'workflows' | 'scorers' | 'processors' | 'mcpServers'>
>;

export type Lesson = {
  /** Folder name in both trees, e.g. `04-memory`. */
  id: string;
  /** Numeric prefix of `id`; also the curriculum order. */
  number: number;
  /** `id` without the numeric prefix, e.g. `memory`. */
  subject: string;
  /** Canonical Mastra doc pages for this subject. */
  docs: string[];
  register: LessonRegister;
  /** Optional headless walkthrough used by `pnpm lesson <slug>`. */
  demo?: (mastra: Mastra) => Promise<void>;
};

export const LESSON_SLUG_PATTERN = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export function isLessonSlug(value: string): boolean {
  return LESSON_SLUG_PATTERN.test(value);
}

/**
 * Select the lessons to register. `MASTRA_LESSONS=01,04 pnpm dev` narrows the
 * instance to those lessons; with the variable unset every lesson registers.
 */
export function activeLessons<T extends Pick<Lesson, 'id' | 'number' | 'subject'>>(lessons: T[]): T[] {
  const raw = process.env.MASTRA_LESSONS?.trim();
  if (!raw) return lessons;

  const requested = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const asNumber = /^\d{1,2}$/.test(entry) ? entry.padStart(2, '0') : entry;
      const match = lessons.find(
        (lesson) => lesson.id === asNumber || lesson.id.startsWith(`${asNumber}-`) || lesson.subject === asNumber,
      );
      if (!match) {
        const available = lessons.map((lesson) => lesson.id).join(', ');
        throw new Error(`MASTRA_LESSONS: no lesson matches "${entry}". Available: ${available}`);
      }
      return match.id;
    });

  return lessons.filter((lesson) => requested.includes(lesson.id));
}

/** Flatten lesson fragments into a single Mastra config fragment. */
export function mergeLessons(lessons: Lesson[]): LessonRegister {
  const merged: LessonRegister = {
    agents: {},
    tools: {},
    workflows: {},
    scorers: {},
    processors: {},
    // Registered MCP servers are mounted by Mastra at `/api/mcp/<serverId>/mcp`
    // and listed in Studio. A lesson contributes one the same way it
    // contributes an agent — there is no second registration path.
    mcpServers: {},
  };

  for (const lesson of lessons) {
    for (const kind of Object.keys(merged) as (keyof LessonRegister)[]) {
      const existing = merged[kind] as Record<string, unknown>;
      for (const [key, primitive] of Object.entries(lesson.register[kind] ?? {})) {
        if (Object.hasOwn(existing, key)) throw new Error(`Duplicate ${kind} registration: ${key}`);
        const id = (primitive as { id?: string }).id;
        if (!id?.startsWith(`l${String(lesson.number).padStart(2, '0')}-`)) {
          throw new Error(`${lesson.id}: ${kind}.${key} must have a lesson-prefixed id`);
        }
      }
    }
    Object.assign(merged.agents!, lesson.register.agents ?? {});
    Object.assign(merged.tools!, lesson.register.tools ?? {});
    Object.assign(merged.workflows!, lesson.register.workflows ?? {});
    Object.assign(merged.scorers!, lesson.register.scorers ?? {});
    Object.assign(merged.processors!, lesson.register.processors ?? {});
    Object.assign(merged.mcpServers!, lesson.register.mcpServers ?? {});
  }

  return merged;
}
