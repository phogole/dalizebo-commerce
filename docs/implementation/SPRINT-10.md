# Sprint 10 — Editorial Delivery and Storefront Vertical Slice

## Goal

Turn Sprint 09's Strapi schemas into a channel-ready experience without moving
content ownership into the storefront. Published editorial data must flow
through the Dalizebo BFF, remain validated, and degrade predictably when Strapi
is unavailable.

## Implemented

### Shared channel contracts

- Activated `@dalizebo/types` as a real TypeScript contract package.
- Added shared types for money, products, SEO, navigation, homepage sections,
  banners, editorial pages, FAQs and content-source metadata.
- Kept the package free of persistence and business rules.

### Strapi → BFF boundary

- Added an authenticated, timeout-bounded Strapi client.
- Added mappers that accept current flattened Strapi 5 responses while
  tolerating legacy nested `attributes` envelopes during migration.
- Added strict normalization for navigation URLs, media URLs, publication
  windows, sort order, rich text and SEO fields.
- Added public BFF routes:

  ```text
  GET /api/v1/content/homepage
  GET /api/v1/content/navigation
  GET /api/v1/content/pages/:slug
  GET /api/v1/content/faqs
  ```

- The BFF never exposes a Strapi response object directly.

### Resilient editorial delivery

- Added a small stale-on-error content cache at the BFF boundary.
- Fresh values are cached for `CONTENT_CACHE_TTL_SECONDS`.
- When Strapi fails, the last successful value may be served for
  `CONTENT_STALE_TTL_SECONDS` with `meta.stale: true`.
- Homepage and navigation have safe code fallbacks so catalogue browsing can
  continue during a cold-start CMS outage.
- Editorial page lookups return `503` on an unresolvable CMS outage instead of
  incorrectly claiming that a page does not exist.

### Storefront experience

- Replaced bootstrap placeholders with server-rendered homepage, navigation,
  footer, product grid, search results and product detail views.
- Added editorial page and FAQ routes backed only by the BFF.
- Added South African ZAR display formatting while retaining integer minor-unit
  values in the API contract.
- Added responsive Dalizebo visual styling and a controlled empty-state path
  when commerce or editorial dependencies are unavailable.
- Rich text is rendered as text; no untrusted CMS HTML is injected.

### Production path

- Added the storefront container to production Compose.
- Added `dalizebo.co.za` and `www.dalizebo.co.za` Caddy routing.
- Corrected API/storefront Docker build contexts to include their workspace
  dependencies and frozen lockfile.
- Enabled pnpm workspace package injection for production `deploy --prod`
  outputs and removed the temporary legacy deploy flag.
- Added real ESLint coverage for the API, storefront, auth, payments,
  fulfilment and shared types packages.
- Added the `pnpm acceptance:content` live contract check.

## Content flow

```text
Strapi published entry
        ↓
timeout-bounded CMS client
        ↓
schema normalization
        ↓
fresh/stale/fallback policy
        ↓
Dalizebo BFF response
        ↓
Next.js server-rendered channel
```

## New environment variables

```text
STRAPI_REQUEST_TIMEOUT_MS=2500
CONTENT_CACHE_TTL_SECONDS=60
CONTENT_STALE_TTL_SECONDS=900
STOREFRONT_API_TIMEOUT_MS=2500
```

`STRAPI_API_TOKEN` remains optional for local public content and should be set
when production Strapi permissions require authenticated reads.

## Acceptance sequence

With the Docker-backed platform running:

```bash
pnpm db:migrate
pnpm db:sync-links
pnpm db:seed
pnpm db:seed
pnpm search:configure
pnpm search:reindex
pnpm search:consume
pnpm dev
pnpm acceptance:content
pnpm acceptance:commerce
```

Publish a Homepage, Navigation, Banner, Page and FAQ entry in Strapi. Confirm
the BFF responses report `meta.source: "cms"`, then stop Strapi and confirm
cached/fallback homepage navigation still renders with `meta.stale: true`.

## Remaining gate

Docker is unavailable in this build runner. Live service startup, migration,
duplicate seed execution, Redis stream delivery/recovery, Strapi publication
acceptance and the product → search → cart → payment flow remain pending for a
Docker-capable target.

API and storefront production package deploy outputs were verified with
`pnpm deploy --prod`. Medusa and Strapi production builds pass; their full
deploy-output copy remains a Docker/network-capable environment gate because
the managed runner required broader package-cache access during the heavyweight
framework smoke.
