import type { FastifyInstance } from "fastify";
import { database, redis, search } from "../lib/dependencies.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health/live", async () => ({
    status: "ok",
    service: "dalizebo-api",
  }));

  app.get("/health/ready", async (_request, reply) => {
    const checks: Record<string, string> = {};

    try {
      await database.query("select 1");
      checks.database = "ok";
    } catch {
      checks.database = "failed";
    }

    try {
      if (redis.status === "wait") await redis.connect();
      await redis.ping();
      checks.redis = "ok";
    } catch {
      checks.redis = "failed";
    }

    try {
      await search.health();
      checks.search = "ok";
    } catch {
      checks.search = "failed";
    }

    const ready = Object.values(checks).every((value) => value === "ok");
    reply.code(ready ? 200 : 503);

    return {
      status: ready ? "ready" : "degraded",
      dependencies: checks,
    };
  });
}
