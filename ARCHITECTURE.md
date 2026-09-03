# Dalizebo Commerce Platform

## Full Implementation Specification

**Document:** `ARCHITECTURE.md`  
**Platform:** Dalizebo Commerce  
**Owner:** Dalizebo Holdings  
**Architecture:** Modular headless commerce platform  
**Primary market:** South Africa  
**Initial deployment:** VPS + Cloudflare  
**Long-term model:** Multi-brand, omnichannel, marketplace-capable commerce platform  
**Status:** Implementation specification  
**Specification version:** 1.1

---

# 1. Executive Objective

Dalizebo Commerce SHALL be implemented as a modular commerce platform rather than as a single ecommerce website.

The platform SHALL support:

- B2C ecommerce
- multiple Dalizebo-owned brands
- multiple sales channels
- multiple warehouses and stores
- online and physical inventory
- mobile applications
- customer accounts
- mobile-number authentication
- online payments
- delivery and collection
- promotions
- content management
- search
- analytics
- customer support
- loyalty
- store credit
- third-party sellers in a later phase
- API integrations
- future AI services

The initial system MUST remain inexpensive enough to run on one production VPS while maintaining architectural boundaries that allow individual components to move to dedicated infrastructure later.

---

# 2. Engineering Principles

## 2.1 Modular monolith first

Do not begin with dozens of independent microservices.

Use:

```text
Medusa
+
modular Node/TypeScript services
+
shared PostgreSQL infrastructure
+
Redis
```

Separate services only when operational requirements justify separation.

## 2.2 API-first

Every business capability SHALL be accessible programmatically.

The web storefront, admin portal and mobile application MUST consume APIs rather than directly accessing databases.

## 2.3 Headless commerce

```text
Frontend != Commerce Engine
CMS != Commerce Engine
Search != Primary Database
```

## 2.4 No frontend business logic

Critical operations including pricing, payment validation, inventory allocation, promotions, refunds, permissions and fulfilment decisions MUST execute server-side.

## 2.5 Replaceable providers

External providers MUST sit behind Dalizebo-owned interfaces.

## 2.6 Event-driven secondary processing

Non-blocking work SHALL execute asynchronously where possible.

## 2.7 Security by default

Every service SHALL use least privilege, encrypted transport, secret management, access logging, rate limiting, audit trails, input validation and server-side authorization.

---

# 3. Platform Architecture

```text
                          INTERNET
                              │
                              ▼
                        CLOUDFLARE
               ┌──────────────┼──────────────┐
               │              │              │
              WAF            CDN         EDGE LOGIC
               │              │              │
               └──────────────┼──────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
              WEB STOREFRONT        MOBILE APP
                Next.js               Expo
                React             React Native
                    │                    │
                    └──────────┬─────────┘
                               │
                         DALIZEBO API
                            / BFF
                               │
       ┌───────────────┬───────┼───────┬───────────────┐
       │               │       │       │               │
       ▼               ▼       ▼       ▼               ▼
    MEDUSA           STRAPI   SEARCH  IDENTITY      DALIZEBO
   Commerce            CMS     Meili               SERVICES
       │               │       │                    │
       │               │       │        ┌───────────┼─────────┐
       │               │       │        │           │         │
       │               │       │     Payments   Delivery   Loyalty
       │               │       │
       └───────────────┬┴───────┘
                       │
               ┌───────┴────────┐
               │                │
          POSTGRESQL          REDIS
```

---

# 4. Technology Baseline

| Area                | Technology                          |
| ------------------- | ----------------------------------- |
| Runtime             | Node.js 22 LTS                      |
| Language            | TypeScript                          |
| Package manager     | pnpm                                |
| Monorepo            | Turborepo                           |
| Web                 | Next.js 16                          |
| UI                  | React                               |
| CSS                 | Tailwind CSS                        |
| Components          | shadcn/ui                           |
| Commerce            | Medusa v2                           |
| CMS                 | Strapi 5                            |
| Primary DB          | PostgreSQL                          |
| Cache               | Redis                               |
| Events              | Medusa Redis Event Module initially |
| Search              | Meilisearch                         |
| Validation          | Zod                                 |
| Mobile              | Expo SDK 57                         |
| Native framework    | React Native                        |
| Edge                | Cloudflare                          |
| Next.js/Workers     | vinext                              |
| Object storage      | Cloudflare R2                       |
| Reverse proxy       | Caddy                               |
| Containers          | Docker                              |
| Local orchestration | Docker Compose                      |
| CI/CD               | GitHub Actions                      |
| Telemetry           | OpenTelemetry                       |
| Error tracking      | Sentry                              |
| Analytics           | PostHog                             |
| API docs            | OpenAPI 3.1                         |
| Testing             | Vitest + Playwright                 |
| Git hooks           | Lefthook                            |
| Code quality        | ESLint + Prettier                   |

---

# 5. Repository Architecture

```text
dalizebo-commerce/
│
├── apps/
│   ├── storefront/
│   ├── admin/
│   ├── api/
│   ├── commerce/
│   ├── cms/
│   └── mobile/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   ├── sdk/
│   ├── auth/
│   ├── payments/
│   ├── fulfilment/
│   ├── analytics/
│   ├── observability/
│   ├── logger/
│   └── testing/
│
├── infrastructure/
│   ├── docker/
│   ├── cloudflare/
│   ├── caddy/
│   ├── postgres/
│   ├── redis/
│   ├── meilisearch/
│   ├── monitoring/
│   └── backups/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── adr/
│   ├── security/
│   ├── runbooks/
│   └── diagrams/
│
├── scripts/
├── .github/workflows/
├── .env.example
├── docker-compose.yml
├── docker-compose.production.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── README.md
└── ARCHITECTURE.md
```

---

# 6. Domain Ownership

| Domain                     | Owner                          |
| -------------------------- | ------------------------------ |
| Products                   | Medusa                         |
| Product variants           | Medusa                         |
| SKU                        | Medusa                         |
| Pricing                    | Medusa                         |
| Inventory                  | Medusa                         |
| Cart                       | Medusa                         |
| Orders                     | Medusa                         |
| Promotions                 | Medusa                         |
| Customers                  | Medusa + Identity              |
| Payment state              | Medusa/payment module          |
| Fulfilment                 | Medusa + fulfilment module     |
| Editorial content          | Strapi                         |
| Homepage content           | Strapi                         |
| Brand stories              | Strapi                         |
| Search indexes             | Meilisearch                    |
| Analytics                  | Analytics platform             |
| Authentication credentials | Identity service               |
| Files                      | R2                             |
| Audit logs                 | Dalizebo Admin/Audit subsystem |

---

# 7. Commerce Core

`apps/commerce` SHALL contain Medusa.

Custom modules:

```text
src/modules/
├── brand/
├── seller/
├── loyalty/
├── delivery-routing/
├── south-africa-address/
├── payment-provider/
├── notification/
└── audit/
```

---

# 8. Brand Model

```text
Brand
├── id
├── name
├── handle
├── description
├── logo_url
├── website_url
├── active
├── metadata
├── created_at
└── updated_at
```

Products SHALL link to a brand.

---

# 9. Product Model

```text
Product
   │
   ├── Brand
   ├── Category
   ├── Collection
   └── Variants
         ├── SKU
         ├── Barcode
         ├── Options
         ├── Pricing
         └── Inventory
```

SKU MUST be globally unique.

---

# 10. Inventory Architecture

Inventory SHALL support:

```text
StockLocation
├── warehouse
├── physical_store
├── supplier
└── virtual
```

Track physical, reserved, available and incoming stock.

---

# 11. Reservation Strategy

Default reservation target: 15 minutes.

Required idempotent job:

```text
release-expired-reservations
```

---

# 12. Sales Channels

Initial:

```text
web
```

Future:

```text
ios
android
physical-store
marketplace
social-commerce
wholesale
```

---

# 13. Multi-Brand Architecture

Brand visibility SHALL be controlled using brand, sales channel, region and publication state.

---

# 14. BFF / API Gateway

Create `apps/api`.

Public hostname:

```text
api.dalizebo.co.za
```

Responsibilities:

- authentication
- request validation
- response normalization
- API aggregation
- rate limiting
- authorization
- feature flags
- correlation IDs
- telemetry
- service orchestration

---

# 15. API Versioning

```text
/api/v1/products
/api/v1/cart
/api/v1/orders
/api/v1/customer
```

Breaking API changes require a new major API path.

---

# 16. Standard API Response

Success:

```json
{
  "data": {},
  "meta": {},
  "requestId": "req_xxx"
}
```

Failure:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": {}
  },
  "requestId": "req_xxx"
}
```

---

# 17. Core API Surface

```text
GET    /api/v1/products
GET    /api/v1/products/:handle
GET    /api/v1/categories
GET    /api/v1/categories/:handle
GET    /api/v1/brands
GET    /api/v1/brands/:handle
GET    /api/v1/search
POST   /api/v1/carts
GET    /api/v1/carts/:id
POST   /api/v1/carts/:id/items
PATCH  /api/v1/carts/:id/items/:lineId
DELETE /api/v1/carts/:id/items/:lineId
POST   /api/v1/checkout/address
POST   /api/v1/checkout/shipping
POST   /api/v1/checkout/payment
POST   /api/v1/checkout/complete
POST   /api/v1/auth/request-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/me
GET    /api/v1/me/orders
GET    /api/v1/me/orders/:id
GET    /api/v1/me/addresses
GET    /api/v1/orders/:id/tracking
```

---

# 18. Authentication

Support South African mobile numbers and OTP.

Canonical format:

```text
+27821234567
```

Do not store raw OTP values.

Suggested OTP rules:

```text
TTL: 5 minutes
max verification attempts: 5
request cooldown: 30–60 seconds
```

---

# 19. Sessions

Web:

```text
Secure HttpOnly cookies
SameSite=Lax
Secure=true in production
```

Mobile:

```text
short-lived access token
+
rotating refresh token
+
secure device storage
```

---

# 20. RBAC

Initial roles:

```text
Super Admin
Platform Admin
Commerce Manager
Inventory Manager
Warehouse Operator
Marketing Manager
Customer Support
Finance
Analyst
Seller Manager
Developer
Read Only
```

Permissions MUST be enforced server-side.

---

# 21. CMS

Strapi SHALL own editorial content only.

Collections:

```text
Homepage
Page
Campaign
Banner
Navigation
Footer
FAQ
Article
Buying Guide
Brand Content
SEO Content
Promotion Landing Page
```

---

# 22. Search

Meilisearch SHALL be a derived index.

Index:

```text
products_v1
```

Filters:

```text
brand
category
price
size
colour
availability
collection
```

Reindex command:

```bash
pnpm search:reindex
```

---

# 23. Storefront

`apps/storefront` SHALL use Next.js App Router.

Core routes:

```text
/
shop/
search/
brands/[handle]/
categories/[...slug]/
products/[handle]/
cart/
checkout/
account/
track-order/
help/
```

Use Server Components by default.

---

# 24. SEO

Every indexable page SHALL include canonical URL, title, description, Open Graph metadata, robots directives and structured data where applicable.

Generate:

```text
/sitemap.xml
/robots.txt
```

---

# 25. Design System

Shared components:

```text
packages/ui
```

Use Tailwind + shadcn/ui + Dalizebo design tokens.

---

# 26. Accessibility

Target WCAG 2.2 AA.

---

# 27. Mobile

Create `apps/mobile` using Expo + React Native + TypeScript.

The app SHALL consume the same Dalizebo BFF.

---

# 28. Payment Architecture

```text
PaymentProvider
├── initialize()
├── authorize()
├── capture()
├── refund()
├── cancel()
└── getStatus()
```

Provider selection SHALL be configuration driven.

---

# 29. Payment State

```text
pending
requires_action
authorized
captured
partially_refunded
refunded
failed
cancelled
```

Webhook status SHALL be authoritative.

---

# 30. Idempotency

Use `Idempotency-Key` for order placement, payment initialization, payment capture, refunds, inventory adjustments and future seller settlements.

---

# 31. Fulfilment

```text
FulfilmentProvider
├── quote()
├── createShipment()
├── cancelShipment()
├── getTracking()
└── handleWebhook()
```

---

# 32. Money

Use integer minor units.

```text
R85.00 = 8500
R1,299.99 = 129999
```

Initial currency: `ZAR`.

---

# 33. Event Model

Initial event layer: Redis-backed Medusa events.

Canonical examples:

```text
dalizebo.customer.created
dalizebo.product.published
dalizebo.order.created
dalizebo.order.paid
dalizebo.order.shipped
dalizebo.order.delivered
dalizebo.payment.authorized
dalizebo.payment.failed
dalizebo.payment.refunded
dalizebo.inventory.updated
dalizebo.return.requested
```

---

# 34. Background Jobs

```text
release-expired-reservations
sync-search-index
abandoned-cart-processing
order-status-reconciliation
payment-reconciliation
shipment-status-reconciliation
cleanup-expired-auth-challenges
daily-sales-summary
database-maintenance
```

---

# 35. PostgreSQL

Production requirements:

- UTF-8
- UTC timestamps
- backups
- restricted network exposure
- connection pooling
- managed DB later when justified

---

# 36. Redis

Redis SHALL provide event infrastructure, cache, rate-limit state, auth challenge state, distributed locks and workflow support.

Redis SHALL NOT contain the only copy of critical durable business information.

---

# 37. Object Storage

Cloudflare R2 buckets:

```text
dalizebo-public
dalizebo-private
```

---

# 38. Cloudflare

Production responsibilities:

```text
DNS
TLS
CDN
WAF
DDoS mitigation
rate limiting
bot filtering
edge caching
Workers
```

Recommended domains:

```text
www.dalizebo.co.za
api.dalizebo.co.za
admin.dalizebo.co.za
media.dalizebo.co.za
status.dalizebo.co.za
```

---

# 39. VPS Topology

```text
Ubuntu
 ├── Caddy
 ├── Dalizebo API
 ├── Medusa
 ├── Strapi
 ├── PostgreSQL
 ├── Redis
 ├── Meilisearch
 └── OpenTelemetry Collector
```

---

# 40. Environment Strategy

Environments:

```text
local
development
staging
production
```

Production credentials MUST be isolated.

---

# 41. Environment Variables

```text
NODE_ENV=
APP_URL=
API_URL=
ADMIN_URL=
STOREFRONT_URL=
DATABASE_URL=
REDIS_URL=
MEDUSA_ADMIN_CORS=
MEDUSA_STORE_CORS=
MEDUSA_AUTH_CORS=
JWT_SECRET=
COOKIE_SECRET=
STRAPI_URL=
STRAPI_API_TOKEN=
MEILISEARCH_HOST=
MEILISEARCH_MASTER_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_BUCKET=
R2_PRIVATE_BUCKET=
PAYMENT_PROVIDER=
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=
SMS_PROVIDER=
SMS_API_KEY=
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
POSTHOG_KEY=
POSTHOG_HOST=
```

---

# 42. Git Strategy

Default branch: `main`.

Branch prefixes:

```text
feat/*
fix/*
refactor/*
chore/*
security/*
```

Use Conventional Commits.

---

# 43. CI/CD

PR pipeline:

```text
install
→ lint
→ typecheck
→ unit tests
→ integration tests
→ build
→ security checks
```

Production pipeline:

```text
push main
→ CI
→ build images
→ push registry
→ staging
→ smoke tests
→ production
→ health checks
```

---

# 44. Observability

Use structured JSON logs, request IDs, OpenTelemetry, Sentry and business/infrastructure metrics.

Health endpoints:

```text
/health/live
/health/ready
```

---

# 45. Security

Apply:

- CSP
- HSTS
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- frame-ancestors
- rate limiting
- server-side RBAC
- validation
- parameterized DB access
- privileged-admin MFA
- append-oriented audit logs

---

# 46. Backups and Recovery

Minimum:

```text
daily database backup
encrypted backups
remote copy
retention rotation
restore testing
```

Suggested retention:

```text
daily   → 14
weekly  → 8
monthly → 12
```

---

# 47. Analytics

Minimum events:

```text
page_view
product_viewed
category_viewed
search_performed
search_result_clicked
add_to_cart
remove_from_cart
cart_viewed
checkout_started
shipping_selected
payment_started
payment_failed
purchase_completed
wishlist_added
promotion_viewed
promotion_applied
```

---

# 48. Future Domains

Design boundaries for:

```text
LoyaltyAccount
LoyaltyTransaction
Wallet
WalletTransaction
Seller
SellerUser
SellerProduct
SellerOffer
CommissionRule
Settlement
SupplierAdapter
PhysicalStore
```

Do not launch these until operationally justified.

---

# 49. Testing

Use:

```text
Unit
Integration
Contract
End-to-end
```

Critical E2E paths:

```text
browse
search
add to cart
checkout
successful payment
failed payment
order creation
inventory reservation
refund
login
OTP
admin product update
```

---

# 50. Performance

Targets:

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
ordinary API p95 < 500ms
```

Measure real-user performance.

---

# 51. Architecture Guardrails

Developers and AI coding agents MUST NOT:

```text
access PostgreSQL from storefront
store business truth in Meilisearch
store prices in Strapi
expose Redis publicly
commit secrets
trust payment redirects
process duplicate webhooks twice
use floating-point currency
add microservices without justification
bypass backend RBAC
place payment logic in React components
duplicate commerce entities unnecessarily
```

---

# 52. AI Coding Agent Directives

Agents MUST:

1. Read `ARCHITECTURE.md`.
2. Read relevant ADRs.
3. Inspect existing packages first.
4. Preserve domain ownership.
5. Reuse shared packages.
6. Validate API input.
7. Add tests for critical logic.
8. Never commit secrets.
9. Never modify production infrastructure without explicit instructions.
10. Run lint, typecheck and tests before completion.
11. Document environment variables.
12. Use migrations.
13. Keep providers behind interfaces.
14. Preserve stable APIs.
15. Avoid unnecessary infrastructure.

---

# 53. Build Phases

## Phase 1 — Foundation

Monorepo, pnpm, Turborepo, TypeScript, linting, Docker, PostgreSQL, Redis, CI.

## Phase 2 — Commerce

Medusa, ZA region, ZAR, products, categories, brands, inventory, stock locations, carts, orders.

## Phase 3 — Storefront

Homepage, navigation, PLP, PDP, search, cart, responsive UI, SEO.

## Phase 4 — Checkout

Addresses, delivery, payments, webhooks, reservations, orders, confirmations.

## Phase 5 — Identity

Mobile normalization, OTP, sessions, account, address book, order history.

## Phase 6 — CMS

Strapi homepage, banners, campaigns, pages, FAQ, brand content, SEO.

## Phase 7 — Search

Meilisearch, synchronization, filters, sorting, autocomplete, reindex.

## Phase 8 — Operations

Cloudflare, Docker production, Caddy, backups, OpenTelemetry, Sentry, analytics, monitoring.

## Phase 9 — Unified Admin

Orders, inventory, customers, operations, RBAC, audit logs.

## Phase 10 — Mobile

Expo app using existing APIs.

## Phase 11 — Omnichannel

Stores, click-and-collect, ship-from-store, return-to-store.

## Phase 12 — Marketplace

Seller onboarding, commissions, settlements, seller portal.

## Phase 13 — Loyalty & Wallet

Ledger-backed loyalty and store credit.

## Phase 14 — Intelligence

Recommendations, forecasting, personalization, semantic search, AI shopping assistant.

---

# 54. Minimum Viable Production Release

MVP MUST contain:

```text
Storefront
Product catalogue
Categories
Brands
Product pages
Search
Cart
Guest checkout
Customer accounts
Mobile OTP
Payments
Orders
Inventory
Shipping
Order confirmation
Basic admin
CMS
Analytics
Logging
Backups
Cloudflare security
CI/CD
```

Do not delay MVP for marketplace, native mobile, wallet, advanced loyalty, Kubernetes, AI, or complex recommendations.

---

# 55. Logical Artifact — Repository Bootstrap Specification

This section defines the next implementation artifact after architecture approval.

The engineering team or coding agent SHALL create a runnable repository matching the architecture above.

## 55.1 Bootstrap Deliverables

Create:

```text
dalizebo-commerce/
├── apps/
│   ├── storefront/
│   ├── api/
│   ├── commerce/
│   └── cms/
├── packages/
│   ├── config/
│   ├── types/
│   ├── ui/
│   ├── logger/
│   └── observability/
├── infrastructure/
│   ├── caddy/
│   ├── docker/
│   └── monitoring/
├── .github/workflows/
├── .env.example
├── docker-compose.yml
├── docker-compose.production.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── README.md
└── ARCHITECTURE.md
```

---

# 56. Root `package.json`

Recommended baseline:

```json
{
  "name": "dalizebo-commerce",
  "private": true,
  "packageManager": "pnpm@10",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write .",
    "clean": "turbo run clean && rimraf node_modules",
    "infra:up": "docker compose up -d postgres redis meilisearch",
    "infra:down": "docker compose down",
    "db:migrate": "pnpm --filter commerce db:migrate",
    "db:sync-links": "pnpm --filter commerce db:sync-links",
    "db:seed": "pnpm --filter commerce db:seed",
    "search:reindex": "pnpm --filter api search:reindex",
    "search:consume": "pnpm --filter api search:consume",
    "validate:content-model": "node scripts/validate-content-model.mjs"
  },
  "devDependencies": {
    "turbo": "^2",
    "typescript": "^5",
    "prettier": "^3",
    "eslint": "^9",
    "rimraf": "^6"
  }
}
```

Versions SHALL be pinned to current compatible releases during actual bootstrap.

---

# 57. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

# 58. `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "cache": false
    }
  }
}
```

---

# 59. Base TypeScript Config

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

# 60. Docker Compose — Local Infrastructure

Initial `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: dalizebo
      POSTGRES_USER: dalizebo
      POSTGRES_PASSWORD: dalizebo_local
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dalizebo -d dalizebo"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  meilisearch:
    image: getmeili/meilisearch:v1.15
    environment:
      MEILI_ENV: development
      MEILI_MASTER_KEY: local-development-key
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
```

Production SHALL use strong secrets and SHALL NOT expose database/cache/search ports publicly.

---

# 61. `.env.example`

```dotenv
NODE_ENV=development

APP_URL=http://localhost:3000
STOREFRONT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
API_URL=http://localhost:4000
COMMERCE_URL=http://localhost:9000
STRAPI_URL=http://localhost:1337

DATABASE_URL=postgresql://dalizebo:dalizebo_local@localhost:5432/dalizebo
REDIS_URL=redis://localhost:6379

MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=local-development-key

JWT_SECRET=change-me
COOKIE_SECRET=change-me

MEDUSA_STORE_CORS=http://localhost:3000
MEDUSA_ADMIN_CORS=http://localhost:3001
MEDUSA_AUTH_CORS=http://localhost:3000,http://localhost:3001

STRAPI_API_TOKEN=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_BUCKET=dalizebo-public
R2_PRIVATE_BUCKET=dalizebo-private

PAYMENT_PROVIDER=sandbox
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=

SMS_PROVIDER=sandbox
SMS_API_KEY=

SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
POSTHOG_KEY=
POSTHOG_HOST=
```

---

# 62. Initial Storefront Scaffold

`apps/storefront` SHALL contain:

```text
app/
├── page.tsx
├── layout.tsx
├── products/[handle]/page.tsx
├── categories/[...slug]/page.tsx
├── brands/[handle]/page.tsx
├── search/page.tsx
├── cart/page.tsx
└── checkout/page.tsx

components/
features/
lib/
styles/
tests/
```

Required first milestone:

```text
homepage renders
product listing renders
product detail renders
cart can be created
```

---

# 63. Initial API Scaffold

`apps/api/src`:

```text
src/
├── index.ts
├── server.ts
├── config/
├── middleware/
│   ├── request-id.ts
│   ├── error-handler.ts
│   ├── rate-limit.ts
│   └── auth.ts
├── routes/
│   └── v1/
│       ├── health.ts
│       ├── products.ts
│       ├── search.ts
│       ├── carts.ts
│       ├── checkout.ts
│       └── auth.ts
├── services/
│   ├── commerce-client.ts
│   ├── cms-client.ts
│   └── search-client.ts
├── telemetry/
└── tests/
```

Required first endpoints:

```text
GET /health/live
GET /health/ready
GET /api/v1/products
GET /api/v1/products/:handle
GET /api/v1/search
```

---

# 64. Initial Medusa Scaffold

`apps/commerce` SHALL initialize Medusa v2.

Initial tasks:

```text
configure PostgreSQL
configure Redis
configure CORS
create ZA region
set ZAR
create web sales channel
create Johannesburg stock location
seed sample product
seed inventory
```

Custom modules SHALL begin with:

```text
brand
audit
south-africa-address
```

---

# 65. Initial CMS Scaffold

`apps/cms` SHALL initialize Strapi 5.

Initial content types:

```text
Homepage
Banner
Navigation
Page
BrandContent
FAQ
```

Strapi SHALL NOT own prices, inventory, carts or orders.

---

# 66. Shared Packages

## `packages/types`

Contains shared API DTOs and domain-safe TypeScript types.

## `packages/config`

Contains shared ESLint, TypeScript and runtime configuration.

## `packages/ui`

Contains reusable design-system components.

## `packages/logger`

Contains structured logging helpers.

## `packages/observability`

Contains OpenTelemetry and tracing bootstrap.

---

# 67. GitHub Actions — Pull Request

Create `.github/workflows/ci.yml`.

Pipeline:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

Security scanning and dependency auditing SHOULD be added after the initial baseline is stable.

---

# 68. Production Docker Compose

`docker-compose.production.yml` SHALL:

- use immutable image tags
- avoid publishing PostgreSQL, Redis and Meilisearch ports
- use health checks
- use restart policies
- use production secrets
- mount persistent data volumes
- place internal services on a private network
- expose only Caddy/API entry points

Logical topology:

```text
Cloudflare
   ↓
Caddy
   ↓
API / Medusa / Strapi
   ↓
PostgreSQL / Redis / Meilisearch
```

---

# 69. Caddy

Suggested `Caddyfile`:

```caddy
api.dalizebo.co.za {
    reverse_proxy api:4000
}

cms.dalizebo.internal {
    reverse_proxy cms:1337
}
```

Internal hostnames SHALL not be publicly routable unless deliberately required.

---

# 70. Local Bootstrap Commands

```bash
git clone <repository>
cd dalizebo-commerce

corepack enable
pnpm install

cp .env.example .env.local

docker compose up -d postgres redis meilisearch

pnpm db:migrate
pnpm db:sync-links
pnpm db:seed
pnpm dev
```

Expected development URLs:

```text
Storefront   http://localhost:3000
Admin        http://localhost:3001
API          http://localhost:4000
Commerce     http://localhost:9000
Strapi       http://localhost:1337
Meilisearch  http://localhost:7700
```

---

# 71. Initial Definition of Done

The repository bootstrap SHALL be considered complete when:

```text
pnpm install succeeds
docker compose starts cleanly
PostgreSQL is healthy
Redis is healthy
Meilisearch is healthy
Medusa starts
Strapi starts
API starts
Next.js starts
health endpoints pass
seed data loads
sample product displays
search returns seeded product
cart can be created
CI passes
no secrets are committed
README documents bootstrap
```

---

# 72. First Engineering Sprint

Recommended sprint sequence:

```text
1. monorepo foundation
2. Docker infrastructure
3. Medusa bootstrap
4. API/BFF bootstrap
5. Next.js storefront
6. Strapi CMS
7. Meilisearch synchronization
8. CI/CD
9. observability
10. first end-to-end product-to-cart flow
```

Do not begin marketplace, wallet, mobile or AI work before this baseline is stable.

---

# 73. Final Directive

Dalizebo Commerce SHALL begin as a simple, observable, secure modular platform that is inexpensive to operate.

The architecture SHALL allow evolution from:

```text
one storefront
+
one VPS
+
one warehouse
```

to:

```text
multiple brands
+
mobile apps
+
physical stores
+
multiple warehouses
+
third-party sellers
+
loyalty
+
payments
+
delivery networks
+
AI
+
enterprise integrations
```

without requiring a full rewrite.

The governing rule is:

> Keep domain boundaries strong, infrastructure simple, APIs stable, providers replaceable and data ownership explicit.

---

# Sprint 2 Implementation Appendix

The repository has progressed beyond static scaffolding.

Implemented baseline components now include:

- Fastify BFF with validated environment loading.
- PostgreSQL, Redis and Meilisearch clients.
- dependency-aware readiness endpoint.
- request correlation IDs.
- CORS and rate limiting.
- product proxy boundary toward Medusa.
- Meilisearch query endpoint and reindex utility skeleton.
- South African mobile normalization.
- OTP generation/hashing/verification primitives.
- sandbox payment provider with idempotent initialization.
- sandbox fulfilment provider.
- API/storefront Dockerfiles.
- agent execution prompt and Sprint 02 definition-of-done.

Framework internals for Medusa and Strapi SHALL be generated from their current official project generators before Dalizebo-specific modules are applied. This reduces version drift and prevents hand-written framework scaffolding from diverging from supported layouts.

See:

```text
docs/implementation/SPRINT-02.md
AGENT_PROMPT.md
scripts/bootstrap-frameworks.sh
```

# Sprint 06 Implementation State

Sprint 06 imports reviewed applications generated by the official Medusa v2.19.0 and Strapi 5.52.3 CLIs. Medusa is configured for PostgreSQL, Redis-backed events/workflows, CORS and secrets; Strapi has a separate database contract. The first South Africa/ZAR/Web/Johannesburg seed shape is present, including a published Dalizebo Essential Tee and inventory. Medusa workflow prices remain major-unit decimals and the BFF converts them to the platform's integer minor-unit money contract. The `products_v1` search projection now derives stable fields from Medusa and removes stale documents during a full reindex. Production Dockerfiles now exist for commerce and CMS, and storefront TypeScript/build checks are clean. See `docs/implementation/SPRINT-06.md` and `docs/implementation/BUILD-VERIFICATION-2026-09-03.md`.

The source/build checks pass, but live PostgreSQL, Redis, Meilisearch, Medusa and Strapi acceptance remains pending because Docker is unavailable in this runner. A commerce-owned Brand module, product link and migration are now present; the seed is still first-run rather than fully repeat-safe, and Strapi content types plus Medusa-to-Meilisearch event sync remain the next implementation gates.

# Sprint 07 Implementation State

The commerce boundary now contains an official Medusa custom Brand module with a stable `handle`, a PostgreSQL migration, and a Product → Brand module link. The seed creates or reuses the `dalizebo` Brand and records the link while retaining product metadata as a temporary migration/search fallback. Medusa type generation and production build include the module and link. See `docs/implementation/SPRINT-07.md`.

The remaining Sprint 07 gates are repeat-safe upserts for all bootstrap resources, Strapi editorial schemas, an idempotent product-event-to-search subscriber, and live Compose acceptance once Docker-backed dependencies are available.

# Sprint 08 Implementation State

The Medusa bootstrap now applies the stable-key pattern across the initial
commerce resources: it looks up records before creating them, reuses the
commerce-owned Brand and Product → Brand link, and creates inventory levels
only for missing variant/item and stock-location pairs. The root and commerce
workspaces expose `db:sync-links` so custom module links are initialized before
seeding. Live duplicate-run acceptance remains pending until Docker-backed
PostgreSQL, Redis, Meilisearch, Medusa and BFF services are available. The next
gates are Strapi editorial schemas and idempotent product-event projection.

# Sprint 09 Implementation State

Strapi now contains the first concrete editorial model: Homepage, Navigation,
Banner, Campaign, Page, FAQ and Brand Story types, plus a reusable SEO
component. These schemas are draft/publish aware and intentionally exclude
prices, variants, inventory, orders and promotion rules. Brand Story stores a
stable Medusa Brand ID rather than duplicating commerce identity. See
`apps/cms/CONTENT-MODEL.md` and `docs/implementation/SPRINT-09.md`.

Medusa product create/update/delete subscribers now append a versioned,
deterministically keyed projection event to the Redis stream
`dalizebo:search:products_v1`. The API search worker consumes that stream with a
Redis consumer group, claims idempotency keys with a short lease, reads the
authoritative product from Medusa and updates or deletes the `products_v1`
Meilisearch document. Meilisearch remains a rebuildable projection and never a
source of commerce truth. The production Compose skeleton includes a dedicated
`search-worker` process using the API image.

Source/build checks remain the available verification level in this runner.
Live Redis stream delivery, consumer-group recovery, duplicate seed execution
and the complete PostgreSQL → Redis → Meilisearch → Medusa → BFF acceptance path
still require Docker-backed infrastructure.

# Sprint 10 Implementation State

Published Strapi content now reaches channels only through the Dalizebo BFF.
The BFF applies a bounded request timeout, optional service authentication,
response normalization and public DTOs for homepage, navigation, pages and
FAQs. Current Strapi 5 flattened responses and migration-era nested envelopes
are both normalized at this boundary; raw CMS response structures do not leak
into channel applications.

Editorial reads use a short process-local fresh cache and a longer stale-on-error
window. Homepage and navigation have code fallbacks for cold-start CMS outages,
while an uncached page request reports service unavailability instead of a
false not-found result. Every response identifies `cms`, `cache` or `fallback`
as its source and exposes whether it is stale. This behavior implements the
existing rule that a CMS outage must not take the core catalogue experience
offline.

The Next.js storefront now consumes only Dalizebo BFF contracts for its
homepage, navigation, catalogue, search, product detail, editorial page and FAQ
views. It does not access Strapi, Medusa, PostgreSQL, Redis or Meilisearch
directly. Product prices remain integer minor units across the BFF contract and
are formatted for display at the channel edge.

The production Compose path now contains a storefront process and Caddy routes
for `dalizebo.co.za` and `www.dalizebo.co.za`. Source, unit, type and production
build checks pass. The core TypeScript packages now use real ESLint gates, and
pnpm workspace package injection is configured for production deploy outputs.
Docker-backed CMS publication/outage acceptance and the full commerce flow
remain explicit deployment gates.

# Sprint 05 Implementation State

Sprint 05 adds repository validation, environment-contract checks, Docker Compose syntax validation in CI, and a corrected readiness assertion for the product-to-payment acceptance runner. The framework import and real-service acceptance gate remain intentionally explicit.

# Sprint 04 Implementation State

Sprint 04 adds Redis-backed OTP challenges, sandbox payment endpoints with mandatory idempotency, official isolated framework generation, and an executable acceptance path covering readiness, product retrieval, Meilisearch discovery, cart mutation and payment initialization. `docs/implementation/SPRINT-04.md` defines the remaining integration gate.

# Sprint 03 Implementation State

The repository now includes a typed Medusa Store API boundary, publishable-key support, normalized Dalizebo product DTOs, product-by-handle behavior, cart creation and add-line-item routes, Meilisearch `products_v1` settings, ZAR minor-unit tests, and explicit seed/content contracts for Medusa v2 and Strapi 5.

The official Medusa and Strapi generator output has now been imported and reviewed. The full acceptance path is documented in `docs/implementation/SPRINT-03.md` and is not considered complete until it passes against real PostgreSQL, Redis, Meilisearch, Medusa, and Strapi services.
