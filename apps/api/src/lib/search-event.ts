import { z } from "zod";

export const SEARCH_EVENTS_STREAM = "dalizebo:search:products_v1";
export const SEARCH_EVENTS_GROUP = "search-projection";

export const productProjectionEventSchema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string().min(1),
  eventName: z.string().min(1),
  operation: z.enum(["upsert", "delete"]),
  productId: z.string().min(1),
  occurredAt: z.string().datetime({ offset: true }),
  idempotencyKey: z.string().min(1),
});

export type ProductProjectionEvent = z.infer<
  typeof productProjectionEventSchema
>;

export function projectionLockKey(event: ProductProjectionEvent): string {
  return `dalizebo:search:processed:${event.idempotencyKey}`;
}

export function parseProductProjectionEvent(
  fields: Record<string, string>,
): ProductProjectionEvent {
  return productProjectionEventSchema.parse({
    schemaVersion: Number(fields.schema_version),
    eventId: fields.event_id,
    eventName: fields.event_name,
    operation: fields.operation,
    productId: fields.product_id,
    occurredAt: fields.occurred_at,
    idempotencyKey: fields.idempotency_key,
  });
}

export function streamFieldsToRecord(
  fields: unknown[],
): Record<string, string> {
  const record: Record<string, string> = {};
  for (let index = 0; index < fields.length; index += 2) {
    const key = fields[index];
    const value = fields[index + 1];
    if (typeof key === "string" && typeof value === "string") {
      record[key] = value;
    }
  }
  return record;
}
