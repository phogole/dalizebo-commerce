# Dalizebo Commerce

Modular headless commerce platform for Dalizebo.

## Read First

- `ARCHITECTURE.md`
- `docs/implementation/SPRINT-10.md`
- `docs/implementation/SPRINT-09.md`
- `docs/implementation/SPRINT-08.md`
- `docs/implementation/BUILD-VERIFICATION.md`
- `docs/implementation/BUILD-VERIFICATION-2026-09-03-SPRINT-10.md`
- `AGENT_PROMPT.md`
- `docs/adr/`

## Quick Start

```bash
corepack enable
pnpm install
cp .env.example .env.local
docker compose up -d postgres redis meilisearch
pnpm db:migrate
pnpm db:sync-links
pnpm db:seed
pnpm dev
```

In a second terminal, run the product-search projection worker while the API
and Medusa services are running:

```bash
pnpm search:consume
```

## Current State — Sprint 10

Sprint 10 delivers Strapi editorial content through a typed BFF boundary and
turns the storefront placeholders into server-rendered homepage, navigation,
catalogue, search, product, editorial page and FAQ experiences. CMS reads are
timeout-bounded, validated and protected by a fresh/stale/fallback policy so a
Strapi outage does not automatically remove the browse experience. See
`docs/implementation/SPRINT-10.md`.

The production Compose skeleton now includes the storefront process and Caddy
routes for `dalizebo.co.za` and `www.dalizebo.co.za`. Live Docker acceptance is
still required before this slice is treated as production-ready.

Sprint 10 also activates real ESLint gates for the core TypeScript packages and
fixes pnpm production deploy packaging for workspace dependencies.

## Previous State — Sprint 09

Sprint 09 adds the first concrete editorial content types to Strapi: Homepage,
Navigation, Banner, Campaign, Page, FAQ and Brand Story, plus the reusable SEO
component. It also adds a repeat-safe Medusa product-event projection boundary:
product create/update/delete subscribers append versioned events to a Redis
stream, and the API search worker claims each event idempotently before updating
or deleting the `products_v1` Meilisearch document. See
`docs/implementation/SPRINT-09.md`.

The worker is intentionally a separate process so Medusa remains the owner of
commerce data and Meilisearch remains derived data. Run the worker alongside the
API when accepting live product changes.

## Previous State — Sprint 08

Sprint 08 makes the Medusa bootstrap repeat-safe at the source level: stable
sales-channel, API-key, store, region, tax, location, fulfilment, shipping,
category, option, product, Brand and inventory keys are looked up before create.
Sprint 07's commerce-owned Brand module and Product → Brand link remain the
ownership boundary. See `docs/implementation/SPRINT-08.md`.

Build verification is recorded in `docs/implementation/BUILD-VERIFICATION.md`.

## Previous State — Sprint 07

Sprint 07 added the commerce-owned Brand module, Product → Brand link and
migration on top of the Sprint 06 Medusa/Strapi import. See
`docs/implementation/SPRINT-07.md`.

## Previous State — Sprint 05

Sprint 05 adds repository-contract validation, secret-pattern checks, Docker Compose CI validation, and fixes the readiness assertion in the commerce acceptance runner. See `docs/implementation/SPRINT-05.md`.

## Previous State — Sprint 04

Sprint 04 adds Redis OTP challenges, idempotent sandbox payment APIs, a guarded official framework generator, and an executable product → search → cart → payment runner. See `docs/implementation/SPRINT-04.md`.

## Previous State — Sprint 03

Sprint 03 adds a typed Medusa Store API client, normalized product DTOs, BFF cart endpoints, Meilisearch index configuration, and explicit Medusa/Strapi seed and content contracts. See `docs/implementation/SPRINT-03.md`.

## Previous State — Sprint 02

The repository now includes:

- pnpm/Turborepo workspace
- Next.js storefront
- Fastify BFF/API
- PostgreSQL/Redis/Meilisearch connections
- readiness/liveness health endpoints
- search API
- product BFF boundary
- CORS/rate limiting/request IDs
- South African mobile normalization + OTP primitives
- sandbox payment provider
- sandbox fulfilment provider
- Dockerfiles
- GitHub Actions baseline
- ADRs and runbooks

Medusa and Strapi should be generated from their current official CLIs instead of manually approximating framework internals:

```bash
./scripts/bootstrap-frameworks.sh
```

## Architecture Rule

Keep domain boundaries strong, infrastructure simple, APIs stable, providers replaceable, and data ownership explicit.
