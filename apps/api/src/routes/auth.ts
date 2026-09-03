import type { FastifyInstance } from "fastify";
import { normalizeSouthAfricanMobile } from "@dalizebo/auth";
import { z } from "zod";
import { env } from "../config/env.js";
import { fail, ok } from "../lib/api-response.js";
import { createOtpChallenge, verifyOtpChallenge } from "../lib/otp-store.js";

const requestSchema = z.object({ phone: z.string().min(9).max(30) });
const verifySchema = z.object({
  challengeId: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/),
});

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/api/v1/auth/otp/request",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const { phone } = requestSchema.parse(request.body);
      const normalizedPhone = normalizeSouthAfricanMobile(phone);
      const challenge = await createOtpChallenge(normalizedPhone);
      reply.code(202);
      return ok(
        {
          challengeId: challenge.challengeId,
          expiresInSeconds: challenge.expiresInSeconds,
          ...(env.NODE_ENV !== "production" && env.SMS_PROVIDER === "sandbox"
            ? { sandboxOtp: challenge.otp }
            : {}),
        },
        request.id,
      );
    },
  );

  app.post(
    "/api/v1/auth/otp/verify",
    { config: { rateLimit: { max: 10, timeWindow: "10 minutes" } } },
    async (request, reply) => {
      const input = verifySchema.parse(request.body);
      const result = await verifyOtpChallenge(input.challengeId, input.otp);
      if (!result.valid) {
        reply.code(401);
        return fail("OTP_INVALID", "OTP is invalid or expired", request.id, {
          reason: result.reason,
        });
      }
      return ok({ authenticated: true, phone: result.phone }, request.id);
    },
  );
}
