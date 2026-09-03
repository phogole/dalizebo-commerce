import type { FastifyRequest } from "fastify";

export function getRequestId(request: FastifyRequest) {
  const header = request.headers["x-request-id"];
  return typeof header === "string" && header.length > 0
    ? header
    : crypto.randomUUID();
}
