/**
 * Minimal front-matter reader for the lesson guides.
 *
 * The guides only use flat keys plus block lists and inline arrays, so a full
 * YAML parser would be overkill here.
 */
export type FrontMatter = Record<string, string | string[]>;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function stripComment(value: string): string {
  // Only a ` #` starts a comment, so `https://...#anchor` survives.
  const match = value.match(/\s+#/);
  return match ? value.slice(0, match.index) : value;
}

export function parseFrontMatter(markdown: string): FrontMatter | null {
  const normalized = markdown.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return null;

  const end = normalized.indexOf('\n---', 4);
  if (end === -1) return null;

  const result: FrontMatter = {};
  let currentKey: string | null = null;

  for (const rawLine of normalized.slice(4, end).split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) continue;

    if (line.trimStart().startsWith('- ')) {
      if (!currentKey) continue;
      const value = unquote(stripComment(line.trimStart().slice(2)));
      const existing = result[currentKey];
      const list = Array.isArray(existing) ? existing : [];
      result[currentKey] = [...list, value];
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    const rawValue = stripComment(line.slice(colon + 1)).trim();
    currentKey = key;

    if (!rawValue) {
      result[key] = [];
      continue;
    }

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      result[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((entry) => unquote(entry))
        .filter(Boolean);
      continue;
    }

    result[key] = unquote(rawValue);
  }

  return result;
}

export function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function asString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}
