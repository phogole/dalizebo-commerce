import { describe, expect, it } from "vitest";
import { toMinorUnits, toProductDto } from "./product-dto.js";

describe("toProductDto", () => {
  it("keeps ZAR money in integer minor units", () => {
    const result = toProductDto({
      id: "prod_1",
      handle: "dalizebo-tee",
      title: "Dalizebo Tee",
      metadata: { brand: "Dalizebo" },
      variants: [
        {
          id: "variant_1",
          title: "Black / M",
          sku: "DAL-TEE-BLK-M",
          calculated_price: {
            calculated_amount: 1299.99,
            currency_code: "zar",
          },
        },
      ],
    });
    expect(result.variants[0]?.price).toEqual({
      amount: 129999,
      currency: "ZAR",
    });
    expect(result.brand).toBe("Dalizebo");
  });

  it("rounds a provider decimal at the BFF boundary", () => {
    expect(toMinorUnits(85, "zar")).toBe(8500);
    expect(toMinorUnits(12.345, "zar")).toBe(1235);
  });
});
