import Redis from "ioredis";
import { MeiliSearch } from "meilisearch";
import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export const database = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
});

export const search = new MeiliSearch({
  host: env.MEILISEARCH_HOST,
  apiKey: env.MEILISEARCH_MASTER_KEY,
});

export async function closeDependencies() {
  await Promise.allSettled([database.end(), redis.quit()]);
}
