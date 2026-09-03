import { createHash } from "node:crypto";

export const SEARCH_PROJECTION_STREAM = "dalizebo:search:products_v1" as const;

export type ProductProjectionOperation = "upsert" | "delete";

export type ProductProjectionEvent = {
  schemaVersion: 1;
  eventId: string;
  eventName: string;
  operation: ProductProjectionOperation;
  productId: string;
  occurredAt: string;
  idempotencyKey: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

function digest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)) ?? "null")
    .digest("hex");
}

function readProductId(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;
  const candidate = data.id ?? data.product_id;
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim()
    : undefined;
}

export function createProductProjectionEvent(input: {
  eventName: string;
  sourceEventId?: string;
  data: unknown;
  occurredAt?: string;
}): ProductProjectionEvent | null {
  const productId = readProductId(input.data);
  if (!productId) return null;

  const eventName = input.eventName.trim() || "product.updated";
  const operation: ProductProjectionOperation = eventName.endsWith(".deleted")
    ? "delete"
    : "upsert";
  const sourceEventId = input.sourceEventId?.trim();
  const eventId = sourceEventId
    ? `medusa:${sourceEventId}`
    : `medusa:${digest({ eventName, productId, data: input.data })}`;

  return {
    schemaVersion: 1,
    eventId,
    eventName,
    operation,
    productId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    idempotencyKey: `products_v1:${eventId}`,
  };
}

export function toRedisFields(event: ProductProjectionEvent): string[] {
  return [
    "schema_version",
    String(event.schemaVersion),
    "event_id",
    event.eventId,
    "event_name",
    event.eventName,
    "operation",
    event.operation,
    "product_id",
    event.productId,
    "occurred_at",
    event.occurredAt,
    "idempotency_key",
    event.idempotencyKey,
  ];
}
