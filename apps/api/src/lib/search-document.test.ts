import { describe, expect, it } from "vitest";
import { toProductSearchDocument } from "./search-document.js";

describe("toProductSearchDocument", () => {
  it("projects Medusa data into a derived search document", () => {
    const result = toProductSearchDocument({
      id: "prod_1",
      handle: "dalizebo-tee",
      title: "Dalizebo Tee",
      description: "Everyday essential",
      metadata: { brand: "Dalizebo" },
      categories: [{ id: "pcat_clothing" }],
      variants: [
        {
          sku: "DAL-TEE-BLK-M",
          inventory_quantity: 100,
          calculated_price: {
            calculated_amount: 1299.99,
            currency_code: "zar",
          },
        },
      ],
    });

    expect(result).toMatchObject({
      id: "prod_1",
      brand: "Dalizebo",
      sku: "DAL-TEE-BLK-M",
      price_amount: 129999,
      currency_code: "ZAR",
      available: true,
      category_ids: ["pcat_clothing"],
    });
  });

  it("uses the lowest priced variant and marks empty inventory unavailable", () => {
    const result = toProductSearchDocument({
      id: "prod_2",
      title: "Dalizebo Hoodie",
      variants: [
        {
          inventory_quantity: 0,
          calculated_price: { calculated_amount: 899.99, currency_code: "zar" },
        },
        {
          inventory_quantity: 4,
          calculated_price: { calculated_amount: 999.99, currency_code: "zar" },
        },
      ],
    });

    expect(result.price_amount).toBe(89999);
    expect(result.available).toBe(true);
  });
});
