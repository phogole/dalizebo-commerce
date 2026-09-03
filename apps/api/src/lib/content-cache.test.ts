import { describe, expect, it } from "vitest";
import { ResilientContentCache } from "./content-cache.js";

describe("ResilientContentCache", () => {
  it("serves a fresh cached value without calling the loader twice", async () => {
    let now = 1_000;
    let calls = 0;
    const cache = new ResilientContentCache(1_000, 5_000, () => now);
    const load = async () => ({ title: `CMS ${++calls}` });

    expect(await cache.get("home", load, { title: "Fallback" })).toMatchObject({
      source: "cms",
      stale: false,
      value: { title: "CMS 1" },
    });
    now += 500;
    expect(await cache.get("home", load, { title: "Fallback" })).toMatchObject({
      source: "cache",
      stale: false,
      value: { title: "CMS 1" },
    });
    expect(calls).toBe(1);
  });

  it("uses stale content during an outage and then expires to fallback", async () => {
    let now = 10_000;
    let fail = false;
    const cache = new ResilientContentCache(100, 1_000, () => now);
    const load = async () => {
      if (fail) throw new Error("offline");
      return "published";
    };

    await cache.get("navigation", load, "fallback");
    fail = true;
    now += 200;
    expect(await cache.get("navigation", load, "fallback")).toEqual({
      value: "published",
      source: "cache",
      stale: true,
    });
    now += 1_000;
    expect(await cache.get("navigation", load, "fallback")).toEqual({
      value: "fallback",
      source: "fallback",
      stale: true,
    });
  });
});
