import { describe, expect, it } from "vitest";
import { normalizeSouthAfricanMobile } from "./phone.js";

describe("normalizeSouthAfricanMobile", () => {
  it("normalizes local mobile format", () => {
    expect(normalizeSouthAfricanMobile("082 123 4567")).toBe("+27821234567");
  });

  it("preserves normalized +27 format", () => {
    expect(normalizeSouthAfricanMobile("+27821234567")).toBe("+27821234567");
  });

  it("rejects invalid values", () => {
    expect(() => normalizeSouthAfricanMobile("123")).toThrow("INVALID_ZA_MOBILE");
  });
});
