import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const modelPaths = [
  "apps/cms/src/api/homepage/content-types/homepage/schema.json",
  "apps/cms/src/api/navigation/content-types/navigation/schema.json",
  "apps/cms/src/api/banner/content-types/banner/schema.json",
  "apps/cms/src/api/campaign/content-types/campaign/schema.json",
  "apps/cms/src/api/page/content-types/page/schema.json",
  "apps/cms/src/api/faq/content-types/faq/schema.json",
  "apps/cms/src/api/brand-story/content-types/brand-story/schema.json",
];

const forbiddenAttributeNames = new Set([
  "price",
  "prices",
  "variant",
  "variants",
  "inventory",
  "inventoryQuantity",
  "stock",
  "stockLocation",
  "cart",
  "order",
  "promotion",
]);

for (const relative of modelPaths) {
  const schema = JSON.parse(await readFile(new URL(relative, root), "utf8"));
  if (!schema.info?.singularName || !schema.attributes) {
    throw new Error(`${relative} is missing Strapi schema metadata`);
  }
  for (const attribute of Object.keys(schema.attributes)) {
    if (forbiddenAttributeNames.has(attribute)) {
      throw new Error(`${relative} duplicates commerce field ${attribute}`);
    }
  }
}

const seo = JSON.parse(
  await readFile(
    new URL("apps/cms/src/components/editorial/seo.json", root),
    "utf8",
  ),
);
if (!seo.attributes?.title || !seo.attributes?.description) {
  throw new Error("Editorial SEO component is incomplete");
}

console.log(
  `Editorial content model validation passed (${modelPaths.length} types).`,
);
