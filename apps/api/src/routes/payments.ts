import type { FastifyInstance } from "fastify";
import { SandboxPaymentProvider } from "@dalizebo/payments";
import { z } from "zod";
import { fail, ok } from "../lib/api-response.js";

const provider = new SandboxPaymentProvider();
const moneySchema = z.object({
  amount: z.number().int().positive(),
  currency: z.literal("ZAR"),
});
const referenceSchema = z.object({ reference: z.string().min(1) });

export async function paymentRoutes(app: FastifyInstance) {
  app.post("/api/v1/payments", async (request, reply) => {
    const idempotencyKey = request.headers["idempotency-key"];
    if (typeof idempotencyKey !== "string" || idempotencyKey.length < 8) {
      reply.code(400);
      return fail(
        "IDEMPOTENCY_KEY_REQUIRED",
        "A valid Idempotency-Key header is required",
        request.id,
      );
    }
    const amount = moneySchema.parse(request.body);
    const payment = await provider.initialize({ amount, idempotencyKey });
    reply.code(201);
    return ok(payment, request.id, { provider: "sandbox" });
  });

  app.post("/api/v1/payments/:reference/authorize", async (request) => {
    const { reference } = referenceSchema.parse(request.params);
    return ok(await provider.authorize(reference), request.id, {
      provider: "sandbox",
    });
  });

  app.get("/api/v1/payments/:reference", async (request) => {
    const { reference } = referenceSchema.parse(request.params);
    return ok(await provider.getStatus(reference), request.id, {
      provider: "sandbox",
    });
  });
}
