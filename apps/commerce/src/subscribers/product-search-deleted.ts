import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { enqueueProductProjection } from "../lib/product-search-projection.js";

export default async function productDeletedHandler(
  args: SubscriberArgs<{ id?: string; product_id?: string }>,
) {
  await enqueueProductProjection(args, "product.deleted");
}

export const config: SubscriberConfig = {
  event: "product.deleted",
};
