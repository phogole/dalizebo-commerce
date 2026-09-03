# Sprint 03 — Commerce Wiring

## Outcome

Deliver the first real Dalizebo path:

`seeded Medusa product → products_v1 index → BFF search → BFF cart`

## Implemented in this artifact

- Typed Medusa Store API client with publishable-key support.
- Stable Dalizebo product DTO; upstream Medusa responses no longer leak directly to clients.
- Product list and product-by-handle endpoints with ZAR minor-unit prices.
- Cart creation and add-line-item BFF endpoints.
- Explicit `products_v1` Meilisearch settings command.
- DTO test protecting the integer-money rule.
- Environment contracts for the Medusa publishable key and ZA region.

## Framework initialization gate

Generate `apps/commerce` and `apps/cms` from the current official CLIs in temporary directories and review dependency versions before merging. Do not hand-author framework internals.

### Medusa v2

1. Run `pnpm dlx create-medusa-app@latest` in a temporary directory.
2. Select PostgreSQL and do not generate a second storefront.
3. Replace the placeholder `apps/commerce` only after reviewing generated files.
4. Configure Redis modules and Store/Admin/Auth CORS from the root environment.
5. Run the idempotent bootstrap workflow described in `apps/commerce/SEED-CONTRACT.md`.

### Strapi 5

1. Run `pnpm dlx create-strapi@latest` in a temporary directory.
2. Select TypeScript and PostgreSQL.
3. Replace the placeholder `apps/cms` only after reviewing generated files.
4. Implement `apps/cms/CONTENT-MODEL.md`.

## Acceptance test

1. Start PostgreSQL, Redis, and Meilisearch.
2. Start Medusa and create its publishable key.
3. Populate `MEDUSA_PUBLISHABLE_KEY` and `MEDUSA_ZA_REGION_ID`.
4. Run the commerce seed.
5. Run `pnpm search:configure && pnpm search:reindex`.
6. Assert the seeded product appears through `GET /api/v1/products` and `GET /api/v1/search?q=Dalizebo`.
7. Create a cart with `POST /api/v1/carts` and add its seeded variant through `POST /api/v1/carts/:cartId/lines`.

Sprint 03 is complete only when that flow passes against real containers; Meilisearch remains rebuildable derived data.
