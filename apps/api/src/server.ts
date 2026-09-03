import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { closeDependencies } from "./lib/dependencies.js";
import { healthRoutes } from "./routes/health.js";
import { productRoutes } from "./routes/products.js";
import { searchRoutes } from "./routes/search.js";
import { cartRoutes } from "./routes/carts.js";
import { authRoutes } from "./routes/auth.js";
import { paymentRoutes } from "./routes/payments.js";
import { contentRoutes } from "./routes/content.js";

const app = Fastify({
  logger: true,
  genReqId: (request) => {
    const supplied = request.headers["x-request-id"];
    return typeof supplied === "string" && supplied.length > 0
      ? supplied
      : crypto.randomUUID();
  },
});

await app.register(cors, {
  origin: [env.STOREFRONT_URL, env.ADMIN_URL],
  credentials: true,
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: "1 minute",
});

app.addHook("onSend", async (request, reply) => {
  reply.header("x-request-id", request.id);
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    reply.code(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: { issues: error.issues },
      },
      requestId: request.id,
    });
    return;
  }

  request.log.error(error);
  reply.code(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      details: {},
    },
    requestId: request.id,
  });
});

await app.register(healthRoutes);
await app.register(productRoutes);
await app.register(searchRoutes);
await app.register(cartRoutes);
await app.register(authRoutes);
await app.register(paymentRoutes);
await app.register(contentRoutes);

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Shutting down");
  await app.close();
  await closeDependencies();
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

await app.listen({ port: env.PORT, host: env.HOST });
