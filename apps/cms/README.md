# CMS — Strapi 5.52

This application was generated from the official Strapi 5 CLI and imported after review. It owns editorial pages, navigation, campaigns, banners, FAQs and brand stories.

## Local commands

```bash
pnpm --filter @dalizebo/cms dev
pnpm --filter @dalizebo/cms build
```

Initial content types:

- Homepage (single type)
- Navigation (single type)
- Banner
- Campaign
- Page
- FAQ
- Brand story (keyed to a Medusa Brand ID)

The reusable `editorial.seo` component is available on Homepage, Campaign,
Page and Brand story. All types use Strapi draft/publish; storefront reads
must request published content through the BFF. See `CONTENT-MODEL.md` for the
field and ownership contract.

Sprint 10 exposes Homepage, Navigation, Page and FAQ delivery through the BFF
with a timeout, schema normalization and stale/fallback behavior. Strapi remains
private infrastructure in production.

The PostgreSQL configuration reads `DATABASE_URL` or the documented `DATABASE_*` variables. Do not store authoritative prices, inventory, carts, orders or payment state in Strapi.
