import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ok, fail } from "../lib/api-response.js";
import { commerceFetch } from "../lib/commerce-client.js";

const cartIdSchema = z.object({ cartId: z.string().min(1) });
const lineSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export async function cartRoutes(app: FastifyInstance) {
  app.post("/api/v1/carts", async (request, reply) => {
    try {
      const data = await commerceFetch<{ cart: unknown }>("/store/carts", {
        method: "POST",
        body: JSON.stringify({ region_id: envRegion() }),
      });
      reply.code(201);
      return ok(data.cart, request.id, { source: "commerce" });
    } catch {
      reply.code(503);
      return fail(
        "COMMERCE_UNAVAILABLE",
        "Cart service is temporarily unavailable",
        request.id,
      );
    }
  });

  app.post("/api/v1/carts/:cartId/lines", async (request, reply) => {
    const { cartId } = cartIdSchema.parse(request.params);
    const input = lineSchema.parse(request.body);
    try {
      const data = await commerceFetch<{ cart: unknown }>(
        `/store/carts/${cartId}/line-items`,
        {
          method: "POST",
          body: JSON.stringify({
            variant_id: input.variantId,
            quantity: input.quantity,
          }),
        },
      );
      return ok(data.cart, request.id, { source: "commerce" });
    } catch {
      reply.code(503);
      return fail(
        "COMMERCE_UNAVAILABLE",
        "Cart service is temporarily unavailable",
        request.id,
      );
    }
  });
}

function envRegion() {
  const region = process.env.MEDUSA_ZA_REGION_ID;
  if (!region)
    throw new Error("MEDUSA_ZA_REGION_ID is required to create carts");
  return region;
}
