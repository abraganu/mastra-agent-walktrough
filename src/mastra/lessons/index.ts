import { lesson as lesson01 } from './01-agent-loop';
import { lesson as lesson02 } from './02-tools';
import { lesson as lesson03 } from './03-structured-output';
import { lesson as lesson04 } from './04-memory';
import { lesson as lesson05 } from './05-processors';
import { lesson as lesson06 } from './06-workflows';
import { lesson as lesson07 } from './07-rag';
import { lesson as lesson08 } from './08-mcp';
import { lesson as lesson09 } from './09-evals';
import { lesson as lesson10 } from './10-multi-agent';
import { lesson as lesson11 } from './11-server-client';
import { lesson as lesson12 } from './12-ops';
import type { Lesson } from './registry';

// Curriculum order = numeric prefix order. A lesson appears here once, and its
// own folder declares every primitive it registers.
// `pnpm lessons:check` fails if a folder is missing from this list.
export const lessons: Lesson[] = [
  lesson01,
  lesson02,
  lesson03,
  lesson04,
  lesson05,
  lesson06,
  lesson07,
  lesson08,
  lesson09,
  lesson10,
  lesson11,
  lesson12,
];
