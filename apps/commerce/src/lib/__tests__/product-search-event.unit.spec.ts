import {
  createProductProjectionEvent,
  toRedisFields,
} from "../product-search-event";

describe("product search projection events", () => {
  it("creates a deterministic upsert event when the source omits an event ID", () => {
    const first = createProductProjectionEvent({
      eventName: "product.updated",
      data: { product_id: "prod_1", title: "Tee" },
      occurredAt: "2026-09-03T00:00:00.000Z",
    });
    const second = createProductProjectionEvent({
      eventName: "product.updated",
      data: { title: "Tee", product_id: "prod_1" },
      occurredAt: "2026-09-03T00:00:00.000Z",
    });

    expect(first).toEqual(second);
    expect(first?.operation).toBe("upsert");
    expect(toRedisFields(first!)).toContain("products_v1:" + first?.eventId);
  });

  it("maps deleted events and rejects missing product IDs", () => {
    expect(
      createProductProjectionEvent({
        eventName: "product.deleted",
        sourceEventId: "evt_1",
        data: { id: "prod_1" },
        occurredAt: "2026-09-03T00:00:00.000Z",
      }),
    ).toMatchObject({
      eventId: "medusa:evt_1",
      operation: "delete",
      productId: "prod_1",
    });
    expect(
      createProductProjectionEvent({ eventName: "product.updated", data: {} }),
    ).toBeNull();
  });
});
