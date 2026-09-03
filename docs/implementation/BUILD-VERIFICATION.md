# Build Verification — Sprint 10 — 2026-09-03

The dated Sprint 10 certificate is the authoritative handoff for this build:
[`BUILD-VERIFICATION-2026-09-03-SPRINT-10.md`](./BUILD-VERIFICATION-2026-09-03-SPRINT-10.md).

## Passed

- `corepack pnpm install --offline --frozen-lockfile --lockfile-only`
- `corepack pnpm validate:repository`
- `corepack pnpm -r --if-present typecheck`
- `corepack pnpm -r --if-present lint`
- targeted package tests for API, auth, payments and commerce
- `corepack pnpm --filter @dalizebo/api typecheck`
- `corepack pnpm --filter @dalizebo/api test` (12 tests)
- `corepack pnpm --filter @dalizebo/api build`
- `corepack pnpm --filter @dalizebo/auth typecheck`
- `corepack pnpm --filter @dalizebo/auth build`
- `corepack pnpm --filter @dalizebo/payments typecheck`
- `corepack pnpm --filter @dalizebo/payments test` (1 test)
- `corepack pnpm --filter @dalizebo/payments build`
- `corepack pnpm --filter @dalizebo/fulfilment typecheck`
- `corepack pnpm --filter @dalizebo/storefront typecheck`
- `corepack pnpm --filter @dalizebo/storefront build`
- `corepack pnpm --filter @dalizebo/types typecheck`
- `corepack pnpm --filter @dalizebo/types build`
- `corepack pnpm --filter @dalizebo/commerce typecheck`
- `corepack pnpm --filter @dalizebo/commerce lint`
- `corepack pnpm --filter @dalizebo/commerce build`
- `corepack pnpm --filter @dalizebo/commerce test` (including product projection contract tests)
- `corepack pnpm --filter @dalizebo/api test` (including Redis stream contract tests)
- `corepack pnpm --filter @dalizebo/api build` (including search-events-consumer)
- source-level repeat-safe seed lookup review (`apps/commerce/src/migration-scripts/initial-data-seed.ts`)
- `corepack pnpm --filter @dalizebo/cms typecheck`
- `corepack pnpm --filter @dalizebo/cms build`
- JavaScript and shell syntax checks
- API and storefront `pnpm deploy --prod` output checks

The Medusa build also compiles the commerce-owned Brand module, its Product →
Brand link, and `Migration20260903000000`.

Sprint 10 adds the Strapi-to-BFF content delivery boundary, resilient
fresh/stale/fallback behavior, shared channel contracts and server-rendered
storefront routes. These paths remain subject to the same live Docker acceptance
gate.

## Framework versions verified

- Medusa v2.19.0 official generated project, imported into `apps/commerce`
- Strapi v5.52.3 official generated project, imported into `apps/cms`
- Next.js v16.3.4 storefront build

## Environment limitations

- A recursive package test command attempted to use a blocked network path in
  this managed runner, so concrete package test commands were run instead.
- Medusa and Strapi `pnpm deploy --prod` package-copy smoke started
  successfully after the workspace-package fix, but the full copy required
  broader package-cache access in this runner. Their source production builds
  pass; full image/runtime deploy output remains a deployment-environment gate.
- Docker is not installed here. Compose startup, database migrations, live Meilisearch indexing and the real `pnpm acceptance:commerce` flow are therefore pending.

## Interpretation

This verifies source, package, framework and production-build integrity. It does not claim a live commerce acceptance run until PostgreSQL, Redis, Meilisearch, Medusa and the BFF are running together.
