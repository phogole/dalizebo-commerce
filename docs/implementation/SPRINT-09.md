# Sprint 09 — Editorial Content and Search Projection Events

## Goal

Make Strapi useful for the first editorial release and establish a durable,
idempotent product-event path from Medusa to the `products_v1` search index.

## Implemented

### Strapi editorial model

- Added the reusable `editorial.seo` component.
- Added published/draft-aware `homepage` and `navigation` single types.
- Added `banner`, `campaign`, `page`, `faq` and `brand-story` collection types.
- Added the standard Strapi core controller, router and service for every type.
- Kept `brand-story.medusaBrandId` as a reference to commerce-owned identity;
  Strapi does not store brand products, prices, inventory or promotion rules.
- Documented publication and ownership rules in `apps/cms/CONTENT-MODEL.md`.

### Medusa → Redis stream

- Added `product.created`, `product.updated` and `product.deleted` subscribers.
- Subscribers normalize Medusa event data into a versioned projection event:

  ```json
  {
    "schemaVersion": 1,
    "eventId": "medusa:...",
    "eventName": "product.updated",
    "operation": "upsert",
    "productId": "prod_...",
    "occurredAt": "2026-09-03T00:00:00.000Z",
    "idempotencyKey": "products_v1:medusa:..."
  }
  ```

- Events are appended to the Redis stream configured by
  `SEARCH_EVENTS_STREAM` (default `dalizebo:search:products_v1`).
- Source events without an envelope ID receive a deterministic SHA-256 event
  ID, so duplicate deliveries produce the same idempotency key.

### Search projection worker

- Added `apps/api/src/scripts/search-events-consumer.ts`.
- The worker uses a Redis consumer group, claims each idempotency key with a
  short processing lease, fetches the authoritative product from Medusa, and
  updates or deletes the matching Meilisearch document.
- A successful event is retained as `done` for 30 days and acknowledged in the
  stream. Failed work releases the lease and remains available for retry.
- Added the root/API `search:consume` scripts and a production Compose
  `search-worker` process using the API image.
- Added parser/contract tests and a commerce unit test for deterministic event
  creation.

## Data ownership

| Concern                                                               | Owner                                              |
| --------------------------------------------------------------------- | -------------------------------------------------- |
| Product, variant, price, inventory and Brand identity                 | Medusa                                             |
| Editorial pages, banners, campaigns, FAQs, brand stories and SEO copy | Strapi                                             |
| Product search projection                                             | Meilisearch, written by the API worker from Medusa |
| Public API and minor-unit money conversion                            | Dalizebo BFF                                       |

## Verification target

Source-level checks should include repository validation, recursive typecheck,
lint and tests, CMS build, commerce build, API build/tests and a Redis stream
contract test. Docker-backed acceptance still needs to run with PostgreSQL,
Redis, Meilisearch, Medusa, Strapi and the BFF available.

## Live acceptance sequence

```bash
docker compose up -d postgres redis meilisearch
pnpm db:migrate
pnpm db:sync-links
pnpm db:seed
pnpm db:seed                 # repeat-safe bootstrap check
pnpm search:configure
pnpm search:reindex
pnpm search:consume          # keep running in a worker terminal
pnpm dev
```

After changing a product in Medusa, verify that the stream receives one
projection event and `/api/v1/search` reflects the updated document. Delete the
product and verify the worker removes it from `products_v1`.

## Remaining gate

The runner used for this artifact does not have Docker, so live stream delivery,
consumer-group recovery, database migrations, duplicate seed execution and the
full product → search → cart → payment flow remain environment-gated.
