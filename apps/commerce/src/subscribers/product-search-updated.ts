import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { enqueueProductProjection } from "../lib/product-search-projection.js";

export default async function productUpdatedHandler(
  args: SubscriberArgs<{ id?: string; product_id?: string }>,
) {
  await enqueueProductProjection(args, "product.updated");
}

export const config: SubscriberConfig = {
  event: "product.updated",
};
