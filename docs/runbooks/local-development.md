# Local Development Runbook

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

Run the migration, link synchronization and seed before starting the services.
The seed establishes the catalogue using stable-key lookups and reuses the
commerce-owned `dalizebo` Brand. Run it twice in a Docker-backed environment
as part of acceptance to prove that no duplicate records are introduced.

For product-event search projection, run the worker in a second terminal (or
use the production Compose `search-worker` service):

```bash
pnpm search:configure
pnpm search:reindex
pnpm search:consume
```

Medusa subscribers append product events to the Redis stream configured by
`SEARCH_EVENTS_STREAM`. The worker consumes the stream as the
`SEARCH_EVENTS_GROUP` consumer group and updates `products_v1` idempotently.

Expected ports:

- Storefront: 3000
- Admin: 3001
- API: 4000
- Commerce: 9000
- CMS: 1337
- PostgreSQL: 5432
- Redis: 6379
- Meilisearch: 7700
