import type { Lesson } from '../registry';
import { reportAgent } from './report-agent';
import { reportSchema } from './report-schema';
import { weatherTool } from './weather-tool';

// Lesson 03 subject: structured output — typed, validated answers, loop
// termination (maxSteps / defaultOptions), and streaming the same result.
// Guide: docs/learn/03-structured-output/README.md
export const lesson: Lesson = {
  id: '03-structured-output',
  number: 3,
  subject: 'structured-output',
  docs: [
    'https://mastra.ai/docs/agents/structured-output',
    'https://mastra.ai/reference/agents/generate',
    'https://mastra.ai/reference/streaming/agents/stream',
  ],
  register: {
    agents: { reportAgent },
    tools: { [weatherTool.id]: weatherTool },
  },

  // `pnpm lesson 03` — same loop, typed answer: response.object is validated
  // against reportSchema before you ever see it.
  async demo(mastra) {
    const agent = mastra.getAgentById('l03-report-agent');
    const response = await agent.generate(
      "What's the weather in Madrid? Reply as a structured report.",
      {
        memory: { resource: 'l03-demo', thread: 'l03-demo' },
        structuredOutput: {
          schema: reportSchema,
          // The NaN gateway serves native json_schema response_format on
          // deepseek-v4-flash only for tool-less, non-streamed requests —
          // this call has tools, so native mode 400s. 'system' injects the
          // schema instructions into the system message instead: no
          // response_format is sent, tools keep working, and the result is
          // still validated against the schema. ('auto' resolves to native
          // here — try it and read the gateway's error.)
          jsonPromptInjection: 'system',
        },
      },
    );

    console.log('--- object ---');
    console.log(JSON.stringify(response.object, null, 2));
    console.log('\n--- text ---');
    console.log(response.text || '(empty)');
    console.log('\n--- token usage ---');
    console.log(response.usage);
    console.log(
      '\nOpen `pnpm dev` -> Agents -> L03 · Report Agent -> Observability to see the schema reach the model and the JSON come back.',
    );
  },
};
