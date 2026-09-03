# Commerce Core — Medusa v2.19

This application was generated from the official Medusa v2 generator and imported after review. It owns products, variants, pricing, inventory, carts, orders and checkout primitives.

## Local commands

```bash
pnpm --filter @dalizebo/commerce dev
pnpm --filter @dalizebo/commerce db:migrate
pnpm --filter @dalizebo/commerce db:sync-links
pnpm --filter @dalizebo/commerce db:seed
```

Initial custom module boundary:

- `brand` (implemented in `src/modules/brand`, linked to products through `src/links/product-brand.ts`)

Product create/update/delete subscribers in `src/subscribers` append a
versioned event to the Redis `SEARCH_EVENTS_STREAM`. They do not write to
Meilisearch; the API search worker owns the derived projection.

Next custom modules to implement:

- audit
- south-africa-address

The Dalizebo integration configuration must include:

- PostgreSQL
- Redis
- South Africa region
- ZAR
- `web` sales channel
- Johannesburg stock location
- sample product + inventory seed

Do not put editorial content, search truth, payment credentials or customer-facing BFF logic in this application. See `SEED-CONTRACT.md` and `ARCHITECTURE.md`.
