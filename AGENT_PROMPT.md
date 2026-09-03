# Dalizebo Commerce — Engineering Agent Prompt

You are implementing Dalizebo Commerce.

Before making changes:

1. Read `ARCHITECTURE.md`.
2. Read `docs/implementation/SPRINT-02.md`.
3. Read applicable ADRs in `docs/adr`.
4. Inspect existing packages before introducing dependencies or duplicate abstractions.

## Current mission

Complete Sprint 02 without redesigning the architecture.

Priority order:

1. Initialize current Medusa v2 in `apps/commerce` using the official generator.
2. Preserve the monorepo.
3. Configure PostgreSQL + Redis.
4. Create South Africa / ZAR / web channel / Johannesburg inventory defaults.
5. Add Brand custom module.
6. Seed a product.
7. Initialize current Strapi 5 in `apps/cms`.
8. Create initial CMS models.
9. Wire product synchronization to `products_v1` in Meilisearch.
10. Make BFF product and search endpoints pass integration tests.

## Hard constraints

- Storefront may not query PostgreSQL directly.
- Strapi may not own prices or inventory.
- Meilisearch is derived data only.
- Do not expose PostgreSQL, Redis or Meilisearch publicly.
- Payment callbacks must ultimately be idempotent.
- Money uses integer minor units.
- Do not introduce Kubernetes or Kafka.
- Do not create marketplace/mobile/AI features yet.
- Do not commit secrets.
- Do not declare completion until lint, typecheck, tests and build pass.

## Completion output

Report:

- files changed
- migrations created
- environment variables added
- commands executed
- tests executed
- remaining blockers
