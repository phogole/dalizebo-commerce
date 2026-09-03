# ADR 0001 — Use Medusa for Commerce Core

## Status
Accepted

## Context
Dalizebo requires a modular, headless, extensible commerce engine without an enterprise VTEX-style licensing model.

## Decision
Use Medusa v2 as the initial commerce core.

## Consequences
Commerce truth remains in Medusa/PostgreSQL. Custom domains should be implemented as Medusa modules before creating standalone microservices.
