import Redis from "ioredis";
import type { MedusaContainer, SubscriberArgs } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createProductProjectionEvent,
  SEARCH_PROJECTION_STREAM,
  toRedisFields,
} from "./product-search-event.js";

type ProductEventData = {
  id?: string;
  product_id?: string;
  [key: string]: unknown;
};

type MedusaEvent = {
  data: ProductEventData;
  id?: string;
  name?: string;
};

let redis: Redis | undefined;

function getRedis(): Redis {
  return (redis ??= new Redis(
    process.env.REDIS_URL ?? "redis://localhost:6379",
    {
      maxRetriesPerRequest: 2,
    },
  ));
}

export async function enqueueProductProjection(
  args: SubscriberArgs<ProductEventData>,
  eventName: string,
): Promise<void> {
  const logger = args.container.resolve(ContainerRegistrationKeys.LOGGER);
  const event = args.event as unknown as MedusaEvent;
  const projection = createProductProjectionEvent({
    eventName,
    sourceEventId: event.id,
    data: event.data,
  });

  if (!projection) {
    logger.warn(`Skipping ${eventName}: product event has no product ID`);
    return;
  }

  await getRedis().xadd(
    process.env.SEARCH_EVENTS_STREAM ?? SEARCH_PROJECTION_STREAM,
    "MAXLEN",
    "~",
    100_000,
    "*",
    ...toRedisFields(projection),
  );

  logger.info(
    `Queued ${projection.operation} projection for product ${projection.productId} (${projection.eventId})`,
  );
}

export type { MedusaContainer };
