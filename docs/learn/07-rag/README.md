---
lesson: 7
subject: rag
status: todo
prereqs: [2]
primitives: [MDocument, embedMany, LibSQLVector, retrieval, rerank]
code: src/mastra/lessons/07-rag
docs:
  - https://mastra.ai/reference/rag/overview
  - https://mastra.ai/reference/rag/chunking-and-embedding
  - https://mastra.ai/reference/rag/retrieval
  - https://mastra.ai/reference/rag/rerank
updated: 2026-10-22
---

# 07 · RAG

**Subject:** answering from your own documents instead of the model's memory.

## What you'll be able to do

- Chunk a document deliberately, and explain what the chunk size costs you on both ends.
- Choose local embeddings (`@mastra/fastembed`) versus an API embedding model, with dimension consequences.
- Store and query vectors, filter by metadata, and rerank a candidate set.
- Wire retrieval into an agent as a tool, so the model decides when to look things up.

## Why here

The pipeline is already sitting in `scripts/rag-example.ts` as a standalone script: chunk → embed → store → query. This lesson takes it apart, then promotes it into the agent you know, which is exactly the move you will repeat for every future capability: script first, tool second.

## Exercise sketch

1. Run `pnpm rag:example` and read each stage's output. Note the chunk count and the vector dimension.
2. Change the chunk strategy and `maxSize`; re-query and judge whether the top matches improved or just changed.
3. Swap fastembed for NaN's embedding model (`models.embedding`, `qwen3-embedding`) and note the dimension change. The index has to be recreated, not reused — understand why before doing it.
4. Wrap retrieval in a `createTool` that takes a question and returns the top-k chunks with metadata, and attach it to an agent. Ask something only your documents answer.
5. Add reranking and find a query where the top result changes rank.

## Studio checklist (draft)

- [ ] An agent answered from your documents and cited the chunk it used.
- [ ] You can explain what happens if you query an index built with a different embedding model.
- [ ] Metadata filtering narrowed results in a way you predicted.
- [ ] Reranking changed the ordering for at least one query.

## Docs

- RAG overview — https://mastra.ai/reference/rag/overview
- Chunking and embedding — https://mastra.ai/reference/rag/chunking-and-embedding
- Retrieval — https://mastra.ai/reference/rag/retrieval
- Rerank — https://mastra.ai/reference/rag/rerank
