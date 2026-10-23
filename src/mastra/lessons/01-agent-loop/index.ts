import type { Lesson } from '../registry';
import { weatherAgent } from './weather-agent';
import { weatherTool } from './weather-tool';

export const lesson: Lesson = {
  id: '01-agent-loop',
  number: 1,
  subject: 'agent-loop',
  docs: [
    'https://mastra.ai/docs/agents/overview',
    'https://mastra.ai/docs/studio/overview',
    'https://mastra.ai/docs/studio/editor',
    'https://mastra.ai/docs/observability/tracing/overview',
  ],
  register: {
    agents: { weatherAgent },
    tools: { weatherTool },
  },

  // `pnpm lesson 01` — the same loop Studio shows you, without the UI.
  async demo(mastra) {
    const agent = mastra.getAgentById('l01-weather-agent');
    const response = await agent.generate("What's the weather in Madrid?", {
      memory: { resource: 'l01-demo', thread: 'l01-demo' },
    });

    console.log('--- answer ---');
    console.log(response.text);
    console.log('\n--- token usage ---');
    console.log(response.usage);
    console.log('\nOpen `pnpm dev` -> Agents -> L01 · Weather Agent -> Observability to see this run as a trace.');
  },
};
