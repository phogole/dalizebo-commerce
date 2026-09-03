import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    HOST: z.string().default("0.0.0.0"),
    PORT: z.coerce.number().int().positive().default(4000),

    STOREFRONT_URL: z.string().url().default("http://localhost:3000"),
    ADMIN_URL: z.string().url().default("http://localhost:3001"),
    COMMERCE_URL: z.string().url().default("http://localhost:9000"),
    MEDUSA_PUBLISHABLE_KEY: z.string().default(""),
    STRAPI_URL: z.string().url().default("http://localhost:1337"),
    STRAPI_API_TOKEN: z.string().default(""),
    STRAPI_REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(100)
      .max(15_000)
      .default(2_500),
    CONTENT_CACHE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(3_600)
      .default(60),
    CONTENT_STALE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(86_400)
      .default(900),

    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),

    MEILISEARCH_HOST: z.string().url(),
    MEILISEARCH_MASTER_KEY: z.string().min(1),

    PAYMENT_PROVIDER: z.string().default("sandbox"),
    SMS_PROVIDER: z.string().default("sandbox"),
    OTP_SECRET: z.string().min(16).default("local-only-change-me"),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === "production" &&
      value.OTP_SECRET === "local-only-change-me"
    ) {
      context.addIssue({
        code: "custom",
        path: ["OTP_SECRET"],
        message: "OTP_SECRET must be replaced in production",
      });
    }
    if (value.CONTENT_STALE_TTL_SECONDS < value.CONTENT_CACHE_TTL_SECONDS) {
      context.addIssue({
        code: "custom",
        path: ["CONTENT_STALE_TTL_SECONDS"],
        message:
          "CONTENT_STALE_TTL_SECONDS must be greater than or equal to CONTENT_CACHE_TTL_SECONDS",
      });
    }
  });

export const env = schema.parse(process.env);
