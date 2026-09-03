# ADR 0002 — Use PostgreSQL

## Status
Accepted

## Decision
Use PostgreSQL as the primary durable transactional database.

## Consequences
Redis and Meilisearch remain derived/ephemeral infrastructure and cannot be the sole source of critical business truth.
