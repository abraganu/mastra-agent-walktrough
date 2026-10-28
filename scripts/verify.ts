// Meaningful regression checks with Node assertions, no test framework, API key or model.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { importsOfSource, isAllowedLessonImport, lessonDeclarations, primitivePrefixErrors } from './lesson-structure';
import { activeLessons, mergeLessons } from '../src/mastra/lessons/registry';
import { lessons } from '../src/mastra/lessons';
import { getWeather } from '../src/mastra/shared/weather';
import { reportSchema } from '../src/mastra/lessons/03-structured-output/report-schema';
import { scoreRecordedAnswer } from '../src/mastra/lessons/09-evals/recorded-check';
import { dispatchClient } from '../src/mastra/lessons/08-mcp/mcp-client';
import { noopObserve } from '@mastra/core/tools';
import { MCPClient } from '@mastra/mcp';
import { rootPath } from '../src/mastra/shared/local-paths';
import { verifyLocalPaths } from './verify-local-paths';

const previousFilter = process.env.MASTRA_LESSONS;
const previousMode = process.env.WEATHER_MODE;
try {
  verifyLocalPaths();
  // Validate the actual default startup registry, not only synthetic collision
  // examples or individually filtered lessons. Loading does not invoke demos.
  const loadedLessons = await Promise.all(lessons.map((lesson) => lesson.load()));
  const fullRegistry = mergeLessons(loadedLessons);
  for (const kind of ['agents', 'tools', 'workflows', 'scorers', 'processors', 'mcpServers'] as const) {
    const contributions = loadedLessons.flatMap((lesson) => Object.entries(lesson.register[kind] ?? {}));
    assert.equal(Object.keys(fullRegistry[kind] ?? {}).length, contributions.length, `${kind}: a lesson contribution was lost`);
    for (const [key, primitive] of contributions) {
      assert.equal((fullRegistry[kind] as Record<string, unknown>)[key], primitive);
    }
  }
  assert.ok(fullRegistry.agents?.weatherAgent);
  assert.ok(fullRegistry.agents?.l06WeatherAgent);
  const base = resolve('src/mastra/lessons');
  assert.deepEqual(importsOfSource(`// import '../ignored';\nimport '../02-tools'; export { tool } from '../02-tools/weather-tool'; import('../03-structured-output');`), ['../02-tools', '../02-tools/weather-tool', '../03-structured-output']);
  assert.equal(isAllowedLessonImport(resolve(base, '01-agent-loop'), resolve(base, '../shared'), base, resolve(base, '02-tools')), false);
  assert.equal(isAllowedLessonImport(resolve(base, '01-agent-loop'), resolve(base, '../shared'), base, resolve(base, 'registry')), true);
  assert.equal(primitivePrefixErrors(`new Agent({id:'wrong', name:'Wrong'})`, 'l01-').length, 2);
  assert.equal(lessonDeclarations(`export const lesson = { id:'01-agent-loop', number:1, subject:'agent-loop' };`)[0]?.number, 1);
  process.env.MASTRA_LESSONS = '01,08';
  assert.deepEqual(activeLessons(lessons).map((lesson) => lesson.number), [1, 8]);
  process.env.MASTRA_LESSONS = 'missing';
  assert.throws(() => activeLessons(lessons), /no lesson matches/);
  const empty = { id: '01-agent-loop', number: 1, subject: 'agent-loop', docs: [], register: { tools: {} } };
  const { dispatchStatusTool } = await import('../src/mastra/lessons/08-mcp/dispatch-tool');
  const descriptor = { ...empty, id: '08-mcp', number: 8, subject: 'mcp', register: { tools: { dispatchStatusTool } } };
  assert.throws(() => mergeLessons([descriptor, descriptor]), /Duplicate/);

  process.env.WEATHER_MODE = 'fixture';
  assert.match(await getWeather('Mérida'), /\[FIXTURE\].*Mérida.*21°C/);
  await assert.rejects(getWeather('Madrid', AbortSignal.abort()), /abort/i);
  process.env.WEATHER_MODE = 'timeout';
  await assert.rejects(getWeather('Madrid'), /timed out/);
  process.env.WEATHER_MODE = 'malformed';
  await assert.rejects(getWeather('Madrid'));
  assert.equal(reportSchema.safeParse({ location: 'Madrid', conditions: 'Clear' }).success, false);
  assert.equal(reportSchema.safeParse({ location: 'Madrid', temperatureC: 999, conditions: 'Clear' }).success, true);
  assert.equal(await scoreRecordedAnswer('Refund requests are accepted within 14 days.'), 1);
  assert.equal(await scoreRecordedAnswer('Refund requests are always accepted.'), 0);

  // Exercise actual stdio transport from outside the repository, without any LLM.
  const cwd = process.cwd();
  process.chdir(tmpdir());
  try {
    const { toolsets, errors } = await dispatchClient.listToolsetsWithErrors({ perServerTimeoutMs: 5_000 });
    assert.deepEqual(errors, {});
    assert.equal(Object.keys(toolsets.dispatch ?? {}).length, 2);
    const tool = toolsets.dispatch?.['l08-dispatch-status'];
    assert.ok(tool?.execute);
    const result = await tool.execute({ orderId: 'KF-1042' }, { observe: noopObserve });
    assert.ok(typeof result.servedBy === 'number' && result.servedBy !== process.pid);
  } finally {
    process.chdir(cwd);
    await dispatchClient.disconnect();
  }
  const broken = new MCPClient({ id: 'verify-broken', servers: { missing: { command: rootPath('does-not-exist') } } });
  try {
    const { toolsets, errors } = await broken.listToolsetsWithErrors({ perServerTimeoutMs: 1_000 });
    assert.equal(Object.keys(toolsets).length, 0);
    assert.ok(errors.missing);
  } finally { await broken.disconnect(); }
  console.log('Verification passed: import boundaries, selection/collisions, fixtures/cancellation, schema limits, recorded scoring, and stdio discovery/failure/remote PID. No model or external API calls.');
} finally {
  if (previousMode === undefined) delete process.env.WEATHER_MODE; else process.env.WEATHER_MODE = previousMode;
  if (previousFilter === undefined) delete process.env.MASTRA_LESSONS; else process.env.MASTRA_LESSONS = previousFilter;
}
