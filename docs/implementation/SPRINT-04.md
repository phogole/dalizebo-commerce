# Sprint 04 — Transaction and Acceptance Boundary

## Implemented

- Redis-backed five-minute OTP challenges with hashed codes, single use and a five-attempt limit.
- South African phone normalization before challenge creation.
- Sandbox OTP visibility only outside production.
- Idempotent ZAR sandbox payment initialization, authorization and status endpoints.
- Payment provider idempotency test.
- End-to-end runner covering readiness, product, search, cart and payment.
- Guarded official framework generation in isolated temporary directories.

## Framework gate

Run `pnpm frameworks:generate` only with package-registry access. It uses Medusa's supported `--skip-db`/`--no-browser` path and Strapi's `--non-interactive` PostgreSQL path. It does not overwrite `apps/commerce` or `apps/cms`; generated output must be reviewed against `ARCHITECTURE.md` before import. This preserves the rule that Medusa and Strapi internals come from official generators.

Current official requirements verified for this sprint:

- Medusa v2.19 requires Node 20.19+ or 22.12+ and production PostgreSQL/Redis modules.
- Strapi supports active or maintenance LTS Node versions, recommends PostgreSQL 17, and accepts TypeScript/PostgreSQL flags through `create-strapi@latest`.

## Definition of done

1. Official framework generation and reviewed import completed.
2. Medusa migrations and idempotent ZA/ZAR seed pass.
3. Strapi content types exist without commerce truth duplication.
4. Install, lint, typecheck, tests and build pass.
5. Containers report ready.
6. Search configuration and reindex pass.
7. `pnpm acceptance:commerce` passes twice without duplicated business records.

Until all seven checks pass, Sprint 04 is integration-ready rather than production-complete.
