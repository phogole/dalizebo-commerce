import { describe, expect, it } from "vitest";
import {
  parseProductProjectionEvent,
  projectionLockKey,
  streamFieldsToRecord,
} from "./search-event.js";

describe("product search event contract", () => {
  it("maps Redis stream fields to a validated event", () => {
    const event = parseProductProjectionEvent(
      streamFieldsToRecord([
        "schema_version",
        "1",
        "event_id",
        "medusa:evt-1",
        "event_name",
        "product.updated",
        "operation",
        "upsert",
        "product_id",
        "prod_1",
        "occurred_at",
        "2026-09-03T00:00:00.000Z",
        "idempotency_key",
        "products_v1:medusa:evt-1",
      ]),
    );

    expect(event).toMatchObject({
      eventId: "medusa:evt-1",
      operation: "upsert",
      productId: "prod_1",
    });
    expect(projectionLockKey(event)).toBe(
      "dalizebo:search:processed:products_v1:medusa:evt-1",
    );
  });

  it("does not silently accept an incomplete stream payload", () => {
    expect(() =>
      parseProductProjectionEvent({
        schema_version: "1",
        event_id: "medusa:evt-1",
      }),
    ).toThrow();
  });
});
