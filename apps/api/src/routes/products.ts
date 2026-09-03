import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ok, fail } from "../lib/api-response.js";
import { commerceFetch } from "../lib/commerce-client.js";
import { toProductDto } from "../lib/product-dto.js";

const handleSchema = z.object({
  handle: z.string().min(1).max(200),
});

export async function productRoutes(app: FastifyInstance) {
  app.get("/api/v1/products", async (request, reply) => {
    try {
      const data = await commerceFetch<{ products: unknown[]; count?: number }>(
        "/store/products?fields=%2Bmetadata,%2Bvariants.calculated_price",
      );
      return ok(data.products.map(toProductDto), request.id, {
        source: "commerce",
        count: data.count ?? data.products.length,
      });
    } catch {
      reply.code(503);
      return fail(
        "COMMERCE_UNAVAILABLE",
        "Product service is temporarily unavailable",
        request.id,
      );
    }
  });

  app.get("/api/v1/products/:handle", async (request, reply) => {
    const { handle } = handleSchema.parse(request.params);

    try {
      const query = new URLSearchParams({ handle });
      query.set("fields", "+metadata,+variants.calculated_price");
      const data = await commerceFetch<{ products: unknown[] }>(
        `/store/products?${query}`,
      );
      const product = data.products[0];
      if (!product) {
        reply.code(404);
        return fail("PRODUCT_NOT_FOUND", "Product was not found", request.id);
      }
      return ok(toProductDto(product), request.id, { source: "commerce" });
    } catch {
      reply.code(503);
      return fail(
        "COMMERCE_UNAVAILABLE",
        "Product service is temporarily unavailable",
        request.id,
      );
    }
  });
}
