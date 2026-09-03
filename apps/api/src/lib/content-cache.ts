import type { ContentMeta } from "@dalizebo/types";

type CacheEntry<T> = {
  value: T;
  storedAt: number;
};

export type ResilientContent<T> = ContentMeta & {
  value: T;
};

export class ResilientContentCache {
  private readonly entries = new Map<string, CacheEntry<unknown>>();

  constructor(
    private readonly freshForMs: number,
    private readonly staleForMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async get<T>(
    key: string,
    load: () => Promise<T>,
    fallback: T,
  ): Promise<ResilientContent<T>> {
    const cached = this.entries.get(key) as CacheEntry<T> | undefined;
    const age = cached
      ? this.now() - cached.storedAt
      : Number.POSITIVE_INFINITY;

    if (cached && age <= this.freshForMs) {
      return { value: cached.value, source: "cache", stale: false };
    }

    try {
      const value = await load();
      this.entries.set(key, { value, storedAt: this.now() });
      return { value, source: "cms", stale: false };
    } catch {
      const staleAge = cached
        ? this.now() - cached.storedAt
        : Number.POSITIVE_INFINITY;
      if (cached && staleAge <= this.staleForMs) {
        return { value: cached.value, source: "cache", stale: true };
      }
      return { value: fallback, source: "fallback", stale: true };
    }
  }

  clear() {
    this.entries.clear();
  }
}
