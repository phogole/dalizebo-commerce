import { z } from "zod";

const moneySchema = z.object({
  amount: z.number().int(),
  currency: z.string(),
});
const variantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().nullable().optional(),
  calculated_price: z
    .object({
      calculated_amount: z.number().finite(),
      currency_code: z.string().min(3),
    })
    .nullable()
    .optional(),
});
const productSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  variants: z.array(variantSchema).default([]),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type ProductDto = ReturnType<typeof toProductDto>;

/**
 * Medusa prices are represented as decimal major units. Dalizebo's public
 * contract uses integer minor units, so convert at the BFF boundary without
 * relying on floating-point multiplication.
 */
export function toMinorUnits(amount: number, currencyCode: string): number {
  if (!Number.isFinite(amount)) throw new Error("MONEY_AMOUNT_INVALID");

  const currency = currencyCode.toUpperCase();
  let fractionDigits: number;
  try {
    fractionDigits =
      new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    throw new Error("MONEY_CURRENCY_INVALID");
  }

  const absolute = Math.abs(amount).toString();
  const [majorPart, rawFraction = ""] = absolute.split(".");
  const fraction = rawFraction.padEnd(fractionDigits + 1, "0");
  const keptFraction = fraction.slice(0, fractionDigits) || "0";
  const roundingDigit = fraction[fractionDigits] ?? "0";
  let minor =
    BigInt(majorPart || "0") * 10n ** BigInt(fractionDigits) +
    BigInt(keptFraction);
  if (roundingDigit >= "5") minor += 1n;
  if (amount < 0) minor *= -1n;

  if (
    minor > BigInt(Number.MAX_SAFE_INTEGER) ||
    minor < BigInt(Number.MIN_SAFE_INTEGER)
  ) {
    throw new Error("MONEY_AMOUNT_OUT_OF_RANGE");
  }
  return Number(minor);
}

export function toProductDto(input: unknown) {
  const product = productSchema.parse(input);
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? null,
    thumbnail: product.thumbnail ?? null,
    brand:
      typeof product.metadata?.brand === "string"
        ? product.metadata.brand
        : null,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku ?? null,
      price: variant.calculated_price
        ? moneySchema.parse({
            amount: toMinorUnits(
              variant.calculated_price.calculated_amount,
              variant.calculated_price.currency_code,
            ),
            currency: variant.calculated_price.currency_code.toUpperCase(),
          })
        : null,
    })),
  };
}
