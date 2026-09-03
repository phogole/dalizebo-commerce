import { z } from "zod";
import { toMinorUnits } from "./product-dto.js";

export const PRODUCT_INDEX = "products_v1";

export const productIndexSettings = {
  searchableAttributes: ["title", "brand", "description", "sku", "handle"],
  filterableAttributes: ["brand", "category_ids", "currency_code", "available"],
  sortableAttributes: ["price_amount", "created_at"],
  displayedAttributes: [
    "id",
    "handle",
    "title",
    "subtitle",
    "brand",
    "description",
    "thumbnail",
    "sku",
    "price_amount",
    "currency_code",
    "available",
    "category_ids",
    "created_at",
  ],
};

const productSchema = z.object({
  id: z.string(),
  handle: z.string().optional(),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  created_at: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  categories: z.array(z.object({ id: z.string() })).optional(),
  variants: z
    .array(
      z.object({
        sku: z.string().nullable().optional(),
        inventory_quantity: z.number().optional(),
        calculated_price: z
          .object({
            calculated_amount: z.number().finite(),
            currency_code: z.string().min(3),
          })
          .nullable()
          .optional(),
      }),
    )
    .default([]),
});

export type ProductSearchDocument = ReturnType<typeof toProductSearchDocument>;

export function toProductSearchDocument(input: unknown) {
  const product = productSchema.parse(input);
  const pricedVariants = product.variants
    .filter((variant) => variant.calculated_price)
    .map((variant) => ({
      amount: toMinorUnits(
        variant.calculated_price!.calculated_amount,
        variant.calculated_price!.currency_code,
      ),
      currency: variant.calculated_price!.currency_code.toUpperCase(),
    }));
  const lowestPrice = [...pricedVariants].sort(
    (left, right) => left.amount - right.amount,
  )[0];

  return {
    id: product.id,
    handle: product.handle ?? null,
    title: product.title,
    subtitle: product.subtitle ?? null,
    brand:
      typeof product.metadata?.brand === "string"
        ? product.metadata.brand
        : null,
    description: product.description ?? null,
    thumbnail: product.thumbnail ?? null,
    sku: product.variants.find((variant) => variant.sku)?.sku ?? null,
    price_amount: lowestPrice?.amount ?? null,
    currency_code: lowestPrice?.currency ?? null,
    available: product.variants.some(
      (variant) => (variant.inventory_quantity ?? 0) > 0,
    ),
    category_ids: product.categories?.map((category) => category.id) ?? [],
    created_at: product.created_at ?? null,
  };
}
