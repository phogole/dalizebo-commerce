import { describe, expect, it } from "vitest";
import { SandboxPaymentProvider } from "./index.js";

describe("SandboxPaymentProvider", () => {
  it("returns one payment for repeated idempotent initialization", async () => {
    const provider = new SandboxPaymentProvider();
    const input = { amount: { amount: 129999, currency: "ZAR" }, idempotencyKey: "checkout-order-1" };
    const first = await provider.initialize(input);
    const repeated = await provider.initialize(input);
    expect(repeated.reference).toBe(first.reference);
  });
});
