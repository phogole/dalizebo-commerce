# Sprint 07 — Commerce-owned Brand Boundary

## Implemented

- Added the official Medusa custom-module shape under `apps/commerce/src/modules/brand`.
- Added `brand` records with stable `handle` keys and generated timestamps.
- Added `Migration20260903000000` for the Brand table and a live-row handle index.
- Added the Product → Brand module link under `apps/commerce/src/links/product-brand.ts`.
- Registered the module in `medusa-config.ts` and confirmed Medusa type generation includes the link.
- Updated the first-run seed to create or reuse the `dalizebo` Brand and link the seeded product.
- Added an explicit `db:sync-links` command to the root and commerce runbooks so
  the Medusa module link is initialized before seeding.
- Kept product metadata as a temporary search/migration fallback; the commerce link is the ownership boundary.

## Verification

The following checks pass after this change:

```text
corepack pnpm validate:repository
corepack pnpm -r --if-present typecheck
corepack pnpm -r --if-present lint
corepack pnpm -r --if-present test
corepack pnpm --filter @dalizebo/commerce build
```

The Medusa build compiles the Brand module, its link, and the migration. Live
database migration and duplicate-run acceptance still require Docker-backed
PostgreSQL, Redis, Meilisearch and Medusa services.

## Ownership rules

| Concern | Owner |
| --- | --- |
| Brand identity, handle and product association | Medusa Brand module |
| Product price, variant and inventory | Medusa Product/Inventory modules |
| Brand story, campaign copy and SEO presentation | Strapi |
| Searchable brand projection | Meilisearch, rebuilt from commerce data |

## Follow-on build gate

Sprint 08 completes the source-level stable-key seed pattern. The next gates
are Strapi editorial schemas and a Medusa product-event subscriber that queues
idempotent updates to `products_v1`.
