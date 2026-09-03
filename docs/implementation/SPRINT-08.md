# Sprint 08 — Repeat-safe Commerce Bootstrap

## Implemented

- Added root and commerce `db:sync-links` commands and documented the required
  migrate → link-sync → seed order.
- Changed the Medusa bootstrap to look up stable keys before creating sales
  channels, publishable API keys, stores, regions, tax regions, stock locations,
  fulfilment sets/service zones, shipping options, categories, product options,
  the sample product and its Brand.
- Kept module links idempotent through Medusa link upserts.
- Changed inventory setup to create levels only for missing product
  variant/item and stock-location pairs.
- Kept the BFF and search projection boundaries unchanged: Medusa remains the
  source of commerce truth and `products_v1` remains derived data.

## Verification

The source-level implementation passes the repository validator, recursive
workspace typecheck/lint/test checks, direct Medusa typecheck/lint/build, and
the existing API/storefront/CMS checks. A Docker-backed run of the seed twice
is still required to validate database behavior and provider wiring in a live
environment.

## Ownership guardrails

| Concern                                                         | Owner                            |
| --------------------------------------------------------------- | -------------------------------- |
| Product, variant, price, inventory, shipping and Brand identity | Medusa                           |
| Brand story, campaigns, page content and SEO copy               | Strapi                           |
| Searchable product projection                                   | Meilisearch, rebuilt from Medusa |
| Public API contract and minor-unit money conversion             | Dalizebo BFF                     |

## Next build gate

Add Strapi editorial schemas and an idempotent Medusa product-event subscriber
that queues updates to `products_v1`. Then run the Compose acceptance path twice
against PostgreSQL, Redis, Meilisearch, Medusa and the BFF.
