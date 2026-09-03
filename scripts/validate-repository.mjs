import { readFile, access } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const required = [
  "ARCHITECTURE.md",
  ".env.example",
  "eslint.config.mjs",
  "docker-compose.yml",
  "docker-compose.production.yml",
  "infrastructure/postgres/init/01-databases.sql",
  "apps/api/src/server.ts",
  "apps/api/src/lib/cms-client.ts",
  "apps/api/src/lib/content-cache.ts",
  "apps/api/src/lib/content-dto.ts",
  "apps/api/src/lib/content-service.ts",
  "apps/api/src/routes/content.ts",
  "apps/api/Dockerfile",
  "apps/storefront/Dockerfile",
  "apps/storefront/lib/bff.ts",
  "apps/storefront/next.config.mjs",
  "apps/storefront/components/site-header.tsx",
  "apps/storefront/components/site-footer.tsx",
  "apps/storefront/components/product-card.tsx",
  "apps/storefront/app/globals.css",
  "apps/storefront/app/faqs/page.tsx",
  "apps/storefront/app/pages/[slug]/page.tsx",
  "apps/commerce/Dockerfile",
  "apps/cms/Dockerfile",
  "apps/commerce/SEED-CONTRACT.md",
  "apps/cms/CONTENT-MODEL.md",
  "apps/commerce/src/modules/brand/index.ts",
  "apps/commerce/src/modules/brand/service.ts",
  "apps/commerce/src/modules/brand/models/brand.ts",
  "apps/commerce/src/modules/brand/migrations/Migration20260903000000.ts",
  "apps/commerce/src/links/product-brand.ts",
  "apps/commerce/src/lib/product-search-event.ts",
  "apps/commerce/src/lib/product-search-projection.ts",
  "apps/commerce/src/subscribers/product-search-created.ts",
  "apps/commerce/src/subscribers/product-search-updated.ts",
  "apps/commerce/src/subscribers/product-search-deleted.ts",
  "apps/cms/src/components/editorial/seo.json",
  "apps/cms/src/api/homepage/content-types/homepage/schema.json",
  "apps/cms/src/api/navigation/content-types/navigation/schema.json",
  "apps/cms/src/api/banner/content-types/banner/schema.json",
  "apps/cms/src/api/campaign/content-types/campaign/schema.json",
  "apps/cms/src/api/page/content-types/page/schema.json",
  "apps/cms/src/api/faq/content-types/faq/schema.json",
  "apps/cms/src/api/brand-story/content-types/brand-story/schema.json",
  "apps/api/src/lib/search-event.ts",
  "apps/api/src/scripts/search-events-consumer.ts",
  "packages/types/src/index.ts",
  "packages/types/src/content.ts",
  "packages/types/src/commerce.ts",
  "scripts/acceptance-content.mjs",
  "scripts/validate-content-model.mjs",
  "docs/implementation/SPRINT-10.md",
  "docs/implementation/SPRINT-09.md",
  "docs/implementation/SPRINT-07.md",
  "docs/implementation/SPRINT-08.md",
  "docs/implementation/BUILD-VERIFICATION-2026-09-03.md",
  "docs/implementation/BUILD-VERIFICATION-2026-09-03-SPRINT-08.md",
  "docs/implementation/BUILD-VERIFICATION-2026-09-03-SPRINT-09.md",
  "docs/implementation/BUILD-VERIFICATION-2026-09-03-SPRINT-10.md",
];
for (const relative of required) await access(new URL(relative, root));
const envExample = await readFile(new URL(".env.example", root), "utf8");
for (const variable of [
  "DATABASE_URL",
  "REDIS_URL",
  "MEILISEARCH_HOST",
  "OTP_SECRET",
  "MEDUSA_ZA_REGION_ID",
  "STRAPI_REQUEST_TIMEOUT_MS",
  "CONTENT_CACHE_TTL_SECONDS",
  "CONTENT_STALE_TTL_SECONDS",
  "STOREFRONT_API_TIMEOUT_MS",
]) {
  if (!new RegExp(`^${variable}=`, "m").test(envExample))
    throw new Error(`Missing ${variable} in .env.example`);
}
if (
  /-----BEGIN (RSA|OPENSSH|PRIVATE) KEY-----|sk_live_|rk_live_/.test(envExample)
)
  throw new Error("Secret material detected in .env.example");
console.log(
  `Repository validation passed (${required.length} required paths, environment contract present).`,
);
