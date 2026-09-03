# Dalizebo Commerce Seed Contract

This is the target contract for the bootstrap migration. Sprint 06 contains the
first-run shape and Sprint 07 adds the commerce-owned Brand module and its
product link. Sprint 08 makes the bootstrap repeat-safe at the source level by
looking up each stable business key before creating a record.

The Medusa bootstrap workflow must be idempotent and create or reuse:

- region: `South Africa` (`ZA`), currency `ZAR`;
- sales channel: `Web`;
- stock location: `Johannesburg Warehouse`;
- publishable API key linked to the Web channel;
- standard shipping option for South Africa;
- brand: `Dalizebo` through the custom Medusa Brand module and product link, with metadata fallback only during migration;
- sample product: `Dalizebo Essential Tee`, handle `dalizebo-essential-tee`;
- variant SKU: `DAL-TEE-BLK-M`, price `129999` minor units, and inventory at Johannesburg.

The workflow looks up stable business keys before creating records so repeated
runs do not duplicate them. Links use Medusa's upsert behavior, and inventory
levels are created only for missing item/location pairs. A Docker-backed run of
the seed twice remains a release acceptance requirement. Product events must
enqueue an idempotent projection into Meilisearch `products_v1`. The search
document ID is the Medusa product ID.
