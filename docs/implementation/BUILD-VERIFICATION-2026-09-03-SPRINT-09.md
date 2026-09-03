# Build Verification — Sprint 09

**Verified:** 2026-09-03 (UTC)

## Passed

- `corepack pnpm install --offline --frozen-lockfile`
- `corepack pnpm validate:repository`
- `corepack pnpm validate:content-model`
- `corepack pnpm -r --if-present typecheck`
- `corepack pnpm -r --if-present lint` (exit 0; see limitations)
- `corepack pnpm -r --if-present test`
- `corepack pnpm --filter @dalizebo/api typecheck`
- `corepack pnpm --filter @dalizebo/api test` — 6 tests
- `corepack pnpm --filter @dalizebo/api build`
- `corepack pnpm --filter @dalizebo/cms typecheck`
- `corepack pnpm --filter @dalizebo/cms build`
- `corepack pnpm --filter @dalizebo/commerce typecheck`
- `corepack pnpm --filter @dalizebo/commerce lint`
- `corepack pnpm --filter @dalizebo/commerce test` — 2 tests
- `corepack pnpm --filter @dalizebo/commerce build`
- targeted Prettier check for Sprint 09 files
- JavaScript and shell syntax checks
- Python YAML parse for both Compose files

## Sprint 09 coverage

The verified source includes:

- Strapi Homepage, Navigation, Banner, Campaign, Page, FAQ and Brand Story
  schemas plus the shared editorial SEO component.
- Standard Strapi core controllers, routers and services for each type.
- Medusa product-created, product-updated and product-deleted subscribers.
- Deterministic versioned projection-event creation and Redis stream fields.
- Redis consumer-group search worker with an idempotency lease, replay of the
  stable consumer's pending entries, Medusa-authoritative product reads and
  Meilisearch upsert/delete operations.
- Production Compose `search-worker` process and documented stream environment
  variables.

## Limitations

- Docker is not installed in this runner. Live PostgreSQL, Redis, Meilisearch,
  Medusa and Strapi startup; database migrations; duplicate seed execution;
  Redis stream delivery; consumer-group recovery; and the full product → search
  → cart → payment acceptance flow remain pending.
- Several placeholder workspace lint scripts intentionally use `|| true` while
  their package-specific ESLint configurations are introduced. The real
  Medusa lint command passes, and recursive typecheck/test commands pass.
- The search worker is source/build verified but was not started against a live
  Redis/Medusa/Meilisearch stack in this environment.

## Interpretation

This certificate verifies the Sprint 09 source, package builds, framework
compilation, content-model boundary checks and projection contract tests. It
does not claim live-service acceptance until Docker-backed infrastructure is
available.
