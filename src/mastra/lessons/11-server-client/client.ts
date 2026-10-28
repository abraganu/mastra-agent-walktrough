import { MastraClient } from '@mastra/client-js';

// Constructing a client makes no request. Supply the actual server URL and
// authenticated headers; resource/thread IDs alone do not authorize access.
export function createLessonClient(baseUrl = 'http://localhost:4111', abortSignal?: AbortSignal) {
  return new MastraClient({ baseUrl, abortSignal, retries: 0 });
}
