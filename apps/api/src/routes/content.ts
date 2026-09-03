import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { fail, ok } from "../lib/api-response.js";
import {
  getEditorialPage,
  getFaqContent,
  getHomepageContent,
  getNavigationContent,
} from "../lib/content-service.js";

const slugSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
const faqQuerySchema = z.object({
  category: z.string().trim().min(1).max(80).optional(),
});

export async function contentRoutes(app: FastifyInstance) {
  app.get("/api/v1/content/homepage", async (request) => {
    const result = await getHomepageContent();
    return ok(result.value, request.id, {
      source: result.source,
      stale: result.stale,
    });
  });

  app.get("/api/v1/content/navigation", async (request) => {
    const result = await getNavigationContent();
    return ok(result.value, request.id, {
      source: result.source,
      stale: result.stale,
    });
  });

  app.get("/api/v1/content/pages/:slug", async (request, reply) => {
    const { slug } = slugSchema.parse(request.params);
    const result = await getEditorialPage(slug);
    if (!result.value) {
      if (result.source === "fallback") {
        reply.code(503);
        return fail(
          "CMS_UNAVAILABLE",
          "Editorial content is temporarily unavailable",
          request.id,
        );
      }
      reply.code(404);
      return fail("PAGE_NOT_FOUND", "Editorial page was not found", request.id);
    }
    return ok(result.value, request.id, {
      source: result.source,
      stale: result.stale,
    });
  });

  app.get("/api/v1/content/faqs", async (request) => {
    const { category } = faqQuerySchema.parse(request.query);
    const result = await getFaqContent(category);
    return ok(result.value, request.id, {
      source: result.source,
      stale: result.stale,
    });
  });
}
