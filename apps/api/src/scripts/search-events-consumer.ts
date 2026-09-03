import { env } from "../config/env.js";
import { closeDependencies, redis, search } from "../lib/dependencies.js";
import {
  parseProductProjectionEvent,
  projectionLockKey,
  SEARCH_EVENTS_GROUP,
  SEARCH_EVENTS_STREAM,
  streamFieldsToRecord,
  type ProductProjectionEvent,
} from "../lib/search-event.js";
import {
  PRODUCT_INDEX,
  toProductSearchDocument,
} from "../lib/search-document.js";
import { configureProductIndex } from "./search-schema.js";

const stream = process.env.SEARCH_EVENTS_STREAM ?? SEARCH_EVENTS_STREAM;
const group = process.env.SEARCH_EVENTS_GROUP ?? SEARCH_EVENTS_GROUP;
// Keep the default consumer stable so pending entries can be replayed after a
// worker restart. Scale-out deployments should provide a distinct consumer ID
// per replica and use an XAUTOCLAIM policy when sharing a group.
const consumer = process.env.SEARCH_EVENTS_CONSUMER ?? "api-search-worker";
const processedTtlSeconds = 30 * 24 * 60 * 60;
const processingTtlSeconds = 5 * 60;

type StreamEntry = [string, string[]];
type StreamBatch = [string, StreamEntry[]];

async function connectRedis() {
  if (redis.status === "wait") await redis.connect();
}

async function ensureConsumerGroup() {
  try {
    // Start at the retained stream head so events emitted while the worker was
    // down are replayed rather than silently skipped.
    await redis.xgroup("CREATE", stream, group, "0", "MKSTREAM");
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) {
      throw error;
    }
  }
}

async function fetchProduct(productId: string): Promise<unknown | null> {
  const fields =
    "+metadata,+variants.calculated_price,+variants.inventory_quantity,+categories";
  const response = await fetch(
    `${env.COMMERCE_URL}/store/products/${encodeURIComponent(productId)}?fields=${encodeURIComponent(fields)}`,
    {
      headers: env.MEDUSA_PUBLISHABLE_KEY
        ? { "x-publishable-api-key": env.MEDUSA_PUBLISHABLE_KEY }
        : undefined,
    },
  );
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Unable to fetch product ${productId}: ${response.status}`);
  }
  const payload = (await response.json()) as { product?: unknown };
  return payload.product ?? payload;
}

async function applyProjection(event: ProductProjectionEvent) {
  await configureProductIndex();
  const index = search.index(PRODUCT_INDEX);
  if (event.operation === "delete") {
    await index.deleteDocument(event.productId);
    return;
  }

  const product = await fetchProduct(event.productId);
  if (!product) {
    await index.deleteDocument(event.productId);
    return;
  }
  await index.addDocuments([toProductSearchDocument(product)], {
    primaryKey: "id",
  });
}

async function processEntry(entryId: string, fields: string[]) {
  const event = parseProductProjectionEvent(streamFieldsToRecord(fields));
  const lockKey = projectionLockKey(event);
  const claimed = await redis.set(
    lockKey,
    "processing",
    "EX",
    processingTtlSeconds,
    "NX",
  );

  if (claimed !== "OK") {
    await redis.xack(stream, group, entryId);
    return "duplicate" as const;
  }

  try {
    await applyProjection(event);
    await redis.set(lockKey, "done", "EX", processedTtlSeconds);
    await redis.xack(stream, group, entryId);
    return "processed" as const;
  } catch (error) {
    await redis.del(lockKey);
    throw error;
  }
}

async function readBatch(cursor: ">" | "0"): Promise<StreamBatch[] | null> {
  const response = await redis.xreadgroup(
    "GROUP",
    group,
    consumer,
    "COUNT",
    20,
    "BLOCK",
    5000,
    "STREAMS",
    stream,
    cursor,
  );
  return (response as StreamBatch[] | null) ?? null;
}

async function main() {
  await connectRedis();
  await ensureConsumerGroup();
  console.log(`Listening for ${stream} events as ${consumer}`);

  while (true) {
    // Replay this consumer's pending entries before waiting for new work.
    for (const batches of [await readBatch("0"), await readBatch(">")]) {
      for (const [, entries] of batches ?? []) {
        for (const [entryId, fields] of entries) {
          try {
            await processEntry(entryId, fields);
          } catch (error) {
            console.error(`Search projection failed for ${entryId}`, error);
          }
        }
      }
    }
  }
}

const stop = async (signal: string) => {
  console.log(`Stopping search consumer (${signal})`);
  await closeDependencies();
  process.exit(0);
};

process.on("SIGTERM", () => void stop("SIGTERM"));
process.on("SIGINT", () => void stop("SIGINT"));

void main().catch(async (error) => {
  console.error(error);
  await closeDependencies();
  process.exit(1);
});
