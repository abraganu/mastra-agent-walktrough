export function environmentProblems(): string[] {
  const problems: string[] = [];
  if (Number(process.versions.node.split('.')[0]) !== 24) problems.push('Use Node 24 (see .node-version).');
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || /^(your-|<|placeholder)/i.test(key)) problems.push('Set OPENAI_API_KEY in .env or the shell to your NaN gateway key.');
  try {
    const url = new URL(process.env.OPENAI_BASE_URL ?? 'https://api.nan.builders/v1');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch { problems.push('OPENAI_BASE_URL must be an HTTP(S) URL.'); }
  return problems;
}

export function requireModelEnvironment(): void {
  const problems = environmentProblems();
  if (problems.length) throw new Error(problems.join('\n'));
}
