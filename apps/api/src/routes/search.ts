import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { search } from "../lib/dependencies.js";
import { ok } from "../lib/api-response.js";
import { PRODUCT_INDEX } from "../lib/search-document.js";

const querySchema = z.object({
  q: z.string().trim().max(200).default(""),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function searchRoutes(app: FastifyInstance) {
  app.get("/api/v1/search", async (request) => {
    const requestId = request.id;
    const input = querySchema.parse(request.query);

    const index = search.index(PRODUCT_INDEX);
    const result = await index.search(input.q, {
      limit: input.limit,
      offset: input.offset,
    });

    return ok(result.hits, requestId, {
      query: input.q,
      estimatedTotalHits: result.estimatedTotalHits,
    });
  });
}
