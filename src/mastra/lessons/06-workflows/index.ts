import type { Lesson } from '../registry';
import { weatherAgent } from './weather-agent';
import { weatherTool } from './weather-tool';
import { weatherBriefWorkflow } from './workflow';

// Lesson 06 subject: workflows — typed steps you compose, the trace they leave,
// and the two ways a run stops being linear (state, suspension).
// Guide: docs/learn/06-workflows/README.md
export const lesson: Lesson = {
  id: '06-workflows',
  number: 6,
  subject: 'workflows',
  docs: [
    'https://mastra.ai/docs/workflows/overview',
    'https://mastra.ai/docs/workflows/control-flow',
    'https://mastra.ai/docs/workflows/workflow-state',
    'https://mastra.ai/docs/workflows/suspend-and-resume',
    'https://mastra.ai/docs/workflows/time-travel',
  ],
  register: {
    agents: { weatherAgent },
    tools: { [weatherTool.id]: weatherTool },
    workflows: { weatherBriefWorkflow },
  },

  // `pnpm lesson 06` — one run, read as a trace. The input is deliberately
  // messy ("  madrid  "): the first step is a plain function, so the cleanup is
  // free, repeatable, and visible as its own step in the run.
  async demo(mastra) {
    // The registration key is the variable name above; the workflow's own
    // `id` (`l06-weather-brief`) is what Studio and storage use. Print both
    // once so the difference is concrete.
    const workflow = mastra.getWorkflow('weatherBriefWorkflow');
    console.log(`workflow ${workflow.id} (registered as "weatherBriefWorkflow")`);

    // One run = one runId = one snapshot row. Keep it: time travel and resume
    // are lookups by runId.
    const run = await workflow.createRun();
    console.log(`run      ${run.runId}`);

    const result = await run.start({ inputData: { location: '  madrid  ' } });

    // Every result has `status`, `input`, and `steps`; only some statuses add
    // their own field (`result`, `error`, `suspendPayload`, `tripwire`).
    console.log(`\n--- status: ${result.status} ---`);

    // `steps` is the trace shape Studio's graph draws: one entry per step, with
    // the payload it received and the output it produced.
    console.log('\n--- steps ---');
    for (const [id, step] of Object.entries(result.steps)) {
      if (id === 'input') continue; // the map also carries the run's input
      const detail =
        'output' in step ? JSON.stringify(step.output) : `(${step.status})`;
      console.log(`- ${id}: ${step.status} -> ${detail}`);
    }

    if (result.status === 'success') {
      console.log('\n--- result ---');
      console.log(result.result.report);
      if (result.stepExecutionPath) {
        console.log(`\npath: ${result.stepExecutionPath.join(' -> ')}`);
      }
    } else if (result.status === 'failed') {
      console.log(`\n--- error ---\n${result.error.message}`);
    }

    console.log('\n--- what to conclude ---');
    console.log(
      'Three steps, one LLM call:\n' +
        '  · normalize-location and format-brief are plain functions — same\n' +
        '    answer every run, and free\n' +
        '  · ask-weather-agent is the only step that spends tokens; it hands\n' +
        '    forward `city` as well as `brief`, because the last step needs both\n' +
        '  · each hand-off is a schema: tsc checks the chain when you write it,\n' +
        '    and the run validates the data again at every step boundary\n' +
        '  · the steps map above is the trace — status, payload, output per\n' +
        '    step. Nothing about the order was left to the model.',
    );
    console.log(
      '\nThe guide picks up from here: `.branch` for a location that cannot be\n' +
        'resolved, workflow state for values every step needs, `suspend` to stop\n' +
        'and wait for a human, and time travel to replay one step of a finished\n' +
        'run. Those are exercise steps, not baseline — this code is the straight\n' +
        'line they bend.',
    );
    console.log(
      '\nOpen `pnpm dev` -> Workflows -> L06 · Weather Brief: the graph is this\n' +
        'file. Run it there to watch step statuses update live, then Observability\n' +
        'for the same run with the agent span nested inside its step.',
    );
  },
};
