# Skill: RAG Ingest

## Purpose

Add durable data to the Aliasist RAG system so chat can answer with grounded
context.

## Inputs

- Source documents, APIs, URLs, files, or data feed definitions.
- Desired topic or Sist target: `waterfall`, `data`, `eco`, `pulse`, or `space`.

## Preconditions

- Retrieval and ingestion work belongs in `/home/blake/aliasist-platform`.
- Homepage chat in `/home/blake/aliasist-web` is a consumer only.
- Data records need source metadata and freshness rules.

## Tool Steps

1. Normalize records with source URL, observed date, timestamp, description,
   tags, and raw payload reference if useful.
2. Chunk for retrieval.
3. Generate embeddings.
4. Upsert to the configured vector store or index.
5. Add date/topic filters where useful.
6. Add tests for retrieval and grounded answer context.

## Failure Modes

- Claiming KV text cache is semantic vector search.
- Losing source URLs or dates.
- Ingesting stale API data without a freshness policy.
- Answering from the model without retrieved context.

## Done Criteria

- Data is ingested or an ingestion path is implemented.
- Retrieval can find the data by topic/date.
- Chat responses include grounded context or citations where supported.
