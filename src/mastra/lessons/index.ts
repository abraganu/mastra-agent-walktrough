import type { Lesson } from './registry';

// Explicit lazy loaders keep unrelated lesson implementations out of a selected run.
export const lessons = [
  { id: '01-agent-loop', number: 1, subject: 'agent-loop', load: async (): Promise<Lesson> => (await import('./01-agent-loop')).lesson },
  { id: '02-tools', number: 2, subject: 'tools', load: async (): Promise<Lesson> => (await import('./02-tools')).lesson },
  { id: '03-structured-output', number: 3, subject: 'structured-output', load: async (): Promise<Lesson> => (await import('./03-structured-output')).lesson },
  { id: '04-memory', number: 4, subject: 'memory', load: async (): Promise<Lesson> => (await import('./04-memory')).lesson },
  { id: '05-processors', number: 5, subject: 'processors', load: async (): Promise<Lesson> => (await import('./05-processors')).lesson },
  { id: '06-workflows', number: 6, subject: 'workflows', load: async (): Promise<Lesson> => (await import('./06-workflows')).lesson },
  { id: '07-rag', number: 7, subject: 'rag', load: async (): Promise<Lesson> => (await import('./07-rag')).lesson },
  { id: '08-mcp', number: 8, subject: 'mcp', load: async (): Promise<Lesson> => (await import('./08-mcp')).lesson },
  { id: '09-evals', number: 9, subject: 'evals', load: async (): Promise<Lesson> => (await import('./09-evals')).lesson },
  { id: '10-multi-agent', number: 10, subject: 'multi-agent', load: async (): Promise<Lesson> => (await import('./10-multi-agent')).lesson },
  { id: '11-server-client', number: 11, subject: 'server-client', load: async (): Promise<Lesson> => (await import('./11-server-client')).lesson },
  { id: '12-ops', number: 12, subject: 'ops', load: async (): Promise<Lesson> => (await import('./12-ops')).lesson },
];
