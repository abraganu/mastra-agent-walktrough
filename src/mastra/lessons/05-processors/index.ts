import type { MastraDBMessage } from '@mastra/core/memory';
import type { ProcessorViolation, RegexRedactionDetail } from '@mastra/core/processors';
import type { Lesson } from '../registry';
import { internalIdFilter, internalTagFilter, processorsAgent } from './processors-agent';
import { weatherTool } from './weather-tool';

// Lesson 05 subject: processors — what the model sees, what the caller gets,
// and what is stored, when all three stop being the same text.
// Guide: docs/learn/05-processors/README.md
export const lesson: Lesson = {
  id: '05-processors',
  number: 5,
  subject: 'processors',
  docs: [
    'https://mastra.ai/docs/agents/processors',
    'https://mastra.ai/docs/agents/guardrails',
  ],
  register: {
    agents: { processorsAgent },
    tools: { [weatherTool.id]: weatherTool },
  },

  // `pnpm lesson 05` — two calls on one thread, one per direction. The first
  // asks the model to repeat an id it was never shown. The second strips a tag
  // the model was told to write. Then the stored thread, for comparison.
  async demo(mastra) {
    const agent = mastra.getAgentById('l05-processors-agent');

    // Fresh thread per run so the transcript below is only what this run did.
    const run = Date.now().toString(36).slice(-4);
    const resource = `l05-user-${run}`;
    const thread = `l05-thread-${run}`;

    const say = (label: string, text: string) => {
      console.log(`\n--- ${label} ---`);
      console.log(text);
    };

    const textOf = (message: MastraDBMessage) =>
      (message.content.parts ?? [])
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join(' ');

    // `onViolation` exists on every processor. For a redaction it fires once
    // per rewritten piece of text, and the phase tells you which hook did it.
    // The offsets refer to that message part, never to the removed value.
    // Reports are buffered so they print before the call they belong to.
    const buffered: string[] = [];
    const report = (label: string) => (violation: ProcessorViolation) => {
      const { phase, redactions } = violation.detail as RegexRedactionDetail;
      buffered.push(
        `[${label}] ${redactions.length} span(s) rewritten during ${phase}: ` +
          redactions
            .map(
              r => `${r.rule} at ${r.index} (${r.length} chars → ${JSON.stringify(r.replacement)})`,
            )
            .join(', '),
      );
    };
    const flush = () => {
      if (buffered.length > 0) console.log(`\n${buffered.splice(0).join('\n')}`);
    };
    internalIdFilter.onViolation = report('id-filter');
    internalTagFilter.onViolation = report('tag-filter');

    const first = await agent.generate(
      'Our internal reference is INTERNAL-482913. Repeat that exact reference back to me in one short sentence.',
      { memory: { resource, thread } },
    );
    flush();
    say('call 1 — input processor: the model repeats what it was given', first.text);

    const second = await agent.generate(
      'In two short sentences: what should a weather team watch for when putting an agent like this in front of customers?',
      { memory: { resource, thread } },
    );
    flush();
    say('call 2 — output processor: the reply the caller received', second.text);
    console.log(
      `\nfinishReason: ${second.finishReason} · usage: ${second.usage.inputTokens} in / ${second.usage.outputTokens} out`,
    );

    const memory = await agent.getMemory();
    const { messages } = await memory!.recall({ threadId: thread, perPage: 20 });
    say(
      'the stored thread — what memory saved',
      messages.map(m => `- ${m.role}: ${textOf(m)}`).join('\n'),
    );

    console.log('\n--- what to conclude ---');
    console.log(
      'Two processors, two rewrites, and the transcript follows both:\n' +
        '  · the input filter rewrote the turn itself, so the stored user message\n' +
        '    holds [INTERNAL_ID] too — what the model saw is what memory saved\n' +
        '  · the output filter stripped the tag, so neither the reply nor the\n' +
        '    stored assistant message contains it\n\n' +
        'Message-based hooks (processInput, processInputStep, processOutputResult)\n' +
        'work on the live message list, and memory saves that list. If you need\n' +
        'the original kept, edit the provider prompt instead: processLLMRequest\n' +
        'is transient by design. That is exercise step 1 in the guide, and it is\n' +
        'also why the built-in TokenLimiter trims at the prompt stage.',
    );
    console.log(
      '\nOpen `pnpm dev` -> Agents -> L05 · Processors Agent, then Observability:\n' +
        'each processor is its own span, and the LLM span shows the prompt it\n' +
        `actually sent. Thread used: ${thread} (resource ${resource}).`,
    );
  },
};
