# Sprint 05 — Release Validation Boundary

## Implemented

- Fixed the acceptance runner to consume the API readiness response shape correctly.
- Added repository validation for required architecture, framework contracts, infrastructure files and environment variables.
- Added secret-pattern protection for `.env.example`.
- Added Docker Compose syntax validation to CI before dependency-heavy checks.
- Pinned pnpm's store to the repository so workspace scripts do not depend on a user-specific home directory.

## Required commands

```bash
pnpm validate:repository
docker compose config --quiet
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

The official Medusa and Strapi generators were a controlled import gate and are now reviewed in Sprint 06. Run `pnpm acceptance:commerce` twice against real services after Docker-backed framework startup is available.
