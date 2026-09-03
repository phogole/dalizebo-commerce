import { search } from "../lib/dependencies.js";
import { env } from "../config/env.js";
import { configureProductIndex } from "./search-schema.js";
import {
  PRODUCT_INDEX,
  toProductSearchDocument,
} from "../lib/search-document.js";

type Product = {
  id: string;
  handle?: string;
  title?: string;
  [key: string]: unknown;
};

async function main() {
  const products: Product[] = [];
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      fields:
        "+metadata,+variants.calculated_price,+variants.inventory_quantity,+categories",
    });
    const response = await fetch(
      `${env.COMMERCE_URL}/store/products?${query}`,
      {
        headers: env.MEDUSA_PUBLISHABLE_KEY
          ? { "x-publishable-api-key": env.MEDUSA_PUBLISHABLE_KEY }
          : undefined,
      },
    );
    if (!response.ok)
      throw new Error(`Unable to fetch products: ${response.status}`);
    const payload = (await response.json()) as { products?: Product[] };
    const page = payload.products ?? [];
    products.push(...page);
    if (page.length < limit) break;
  }

  await configureProductIndex();
  const index = search.index(PRODUCT_INDEX);
  await index.deleteAllDocuments();
  if (products.length > 0) {
    await index.addDocuments(products.map(toProductSearchDocument), {
      primaryKey: "id",
    });
  }

  console.log(`Queued ${products.length} products for indexing.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
