# Build Verification — Sprint 10

**Verified:** 2026-09-03 (UTC)

## Passed

- frozen lockfile-only validation
- repository and editorial content-model validation
- recursive workspace typecheck and lint commands
- targeted package test commands for API, auth, payments and commerce
- `@dalizebo/types` typecheck and build
- API typecheck, 12 unit tests and production TypeScript build
- storefront typecheck and Next.js production build
- CMS typecheck and production build
- commerce typecheck, lint, unit tests and production build
- API and storefront `pnpm deploy --prod` package output verification
- targeted Prettier validation for Sprint 10 source and documentation
- JavaScript and shell syntax checks
- YAML parsing for local and production Compose
- ZIP integrity verification for the Sprint 10 handoff

## Sprint 10 coverage

The verified source includes:

- shared channel-facing content and commerce contracts;
- a timeout-bounded authenticated Strapi client;
- Strapi 5 response normalization and URL/date validation;
- BFF fresh/stale/fallback content caching;
- homepage, navigation, page and FAQ endpoints;
- server-rendered storefront homepage, search, PDP, editorial and FAQ routes;
- responsive Dalizebo storefront styling and security headers;
- production storefront/Caddy topology; and
- an executable live content acceptance contract.
- pnpm workspace package injection configured for production deploy output.

## Limitations

- Docker and Podman are not installed in this runner. Live PostgreSQL, Redis,
  Meilisearch, Medusa, Strapi, BFF and storefront startup could not be executed.
- Medusa and Strapi `pnpm deploy --prod` packaging began successfully after the
  workspace-package fix, but the heavyweight package-copy smoke required broader
  network/cache access in this runner and was stopped. Their production source
  builds passed; full image/runtime packaging remains a deployment-environment
  gate.
- Database migrations, duplicate seed execution, Redis stream delivery and
  recovery, Strapi publication/outage behavior and the full product → search →
  cart → payment flow remain Docker-capable environment gates.
- The content cache is intentionally process-local for the first vertical
  slice. A later multi-node deployment can move shared cache state to Redis
  without changing the public content API.

## Interpretation

This certificate verifies Sprint 10 source, contracts, tests and production
build output. It does not claim live-service acceptance.
