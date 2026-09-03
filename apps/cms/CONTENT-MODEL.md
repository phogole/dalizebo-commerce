# Strapi 5 Editorial Content Model

Strapi owns editorial content only. Prices, variants, stock, carts, orders,
promotion rules and payment state remain in Medusa or their owning services.
The schemas in `src/api` are deliberately small enough to be managed by a
marketing team without creating a second commerce catalogue.

## Single types

| Type         | Purpose                                                      | Commerce boundary                                                                               |
| ------------ | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `homepage`   | title, intro, ordered section configuration and SEO metadata | section JSON may reference a Medusa product ID or handle; it never stores price or availability |
| `navigation` | primary links, utility links and footer groups               | links are editorial paths only                                                                  |

## Collection types

| Type          | Purpose                                         | Required fields                  |
| ------------- | ----------------------------------------------- | -------------------------------- |
| `banner`      | promotional/editorial banner with media and CTA | `title`                          |
| `campaign`    | editorial campaign landing content              | `title`, `slug`                  |
| `page`        | long-form editorial page                        | `title`, `slug`, `body`          |
| `faq`         | support and buying guidance                     | `question`, `answer`             |
| `brand-story` | story keyed to a commerce-owned brand           | `medusaBrandId`, `title`, `body` |

`campaign` is content, not a promotion rule. Discount codes, eligibility,
prices and inventory remain outside Strapi. A `brand-story` stores the stable
Medusa Brand ID as a reference; it does not duplicate the Brand model.

## Shared SEO component

`components/editorial/seo.json` provides title, description, canonical URL and
`noIndex`. It is reusable on `homepage`, `campaign`, `page` and `brand-story`.

## Publication and API rules

- All storefront reads use published content only; draft content is admin-only.
- The BFF is the public API boundary and should request only the fields needed by
  the storefront.
- Media belongs to Strapi/R2, with private files served through signed access.
- Product and brand references are validated against Medusa at integration
  boundaries; Strapi remains the source of truth only for editorial fields.
- Schema changes must be reviewed as content migrations before production.

## Channel delivery

Channels consume normalized Dalizebo contracts rather than Strapi envelopes:

```text
GET /api/v1/content/homepage
GET /api/v1/content/navigation
GET /api/v1/content/pages/:slug
GET /api/v1/content/faqs
```

The BFF validates links and publication windows, converts relative media paths
to absolute Strapi asset URLs, and exposes whether content came from the live
CMS, cache or fallback. Storefront code must not call `/api/*` on Strapi
directly.
