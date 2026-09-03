import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { enqueueProductProjection } from "../lib/product-search-projection.js";

export default async function productCreatedHandler(
  args: SubscriberArgs<{ id?: string; product_id?: string }>,
) {
  await enqueueProductProjection(args, "product.created");
}

export const config: SubscriberConfig = {
  event: "product.created",
};
