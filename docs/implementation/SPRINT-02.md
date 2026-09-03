# Sprint 02 — Platform Wiring

## Goal

Move the repository from structural scaffold to a verified infrastructure-aware platform baseline.

## Implemented in this artifact

- validated API environment configuration
- PostgreSQL connection pool
- Redis connection
- Meilisearch client
- live/readiness endpoints
- request correlation IDs
- CORS
- API rate limiting
- normalized API envelopes
- product BFF proxy skeleton
- Meilisearch-backed search endpoint
- reindex script skeleton
- South African mobile normalization
- OTP hashing primitives
- sandbox payment provider with idempotent initialization
- sandbox fulfilment provider
- API Dockerfile
- storefront Dockerfile
- official-framework bootstrap script

## Next tasks

1. Run official Medusa v2 generator into `apps/commerce`.
2. Configure Medusa PostgreSQL and Redis.
3. Create ZA region, ZAR currency, web sales channel, Johannesburg stock location.
4. Create `brand` module and product-brand link.
5. Seed a real product and inventory.
6. Run official Strapi 5 generator into `apps/cms`.
7. Create Homepage, Banner, Navigation, Page, BrandContent and FAQ types.
8. Wire Medusa product events to Meilisearch.
9. Replace BFF product response wrappers with normalized DTOs.
10. Add cart endpoints.
11. Add OTP challenge storage in Redis.
12. Add payment API endpoints using sandbox provider.
13. Add integration tests using Docker infrastructure.

## Definition of Done

- `GET /health/ready` returns HTTP 200 with DB, Redis and search healthy.
- Product request reaches Medusa.
- A seeded product can be indexed and found through `/api/v1/search`.
- South African phone tests pass.
- Sandbox payment initialization is idempotent.
- All packages typecheck.
- CI passes.
