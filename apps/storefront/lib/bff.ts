import type {
  EditorialPage,
  FaqItem,
  HomepageBundle,
  NavigationContent,
  Product,
} from "@dalizebo/types";
import { z } from "zod";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const requestTimeoutMs = Number.parseInt(
  process.env.STOREFRONT_API_TIMEOUT_MS ?? "2500",
  10,
);

const seoSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  canonicalUrl: z.string().nullable(),
  noIndex: z.boolean(),
});
const linkSchema = z.object({ label: z.string(), href: z.string() });
const navigationSchema = z.object({
  primaryLinks: z.array(linkSchema),
  utilityLinks: z.array(linkSchema),
  footerGroups: z.array(
    z.object({ title: z.string(), links: z.array(linkSchema) }),
  ),
});
const homepageBundleSchema = z.object({
  homepage: z.object({
    title: z.string(),
    intro: z.string().nullable(),
    sections: z.array(
      z.object({
        type: z.string(),
        title: z.string().nullable(),
        copy: z.string().nullable(),
        productHandles: z.array(z.string()),
      }),
    ),
    seo: seoSchema.nullable(),
  }),
  banners: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      copy: z.string().nullable(),
      imageUrl: z.string().nullable(),
      ctaLabel: z.string().nullable(),
      ctaUrl: z.string().nullable(),
      campaignKey: z.string().nullable(),
      startsAt: z.string().nullable(),
      endsAt: z.string().nullable(),
      sortOrder: z.number().int(),
    }),
  ),
});
const moneySchema = z.object({
  amount: z.number().int(),
  currency: z.string(),
});
const productSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  brand: z.string().nullable(),
  variants: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      sku: z.string().nullable(),
      price: moneySchema.nullable(),
    }),
  ),
});
const pageSchema = z.object({
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  seo: seoSchema.nullable(),
});
const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string().nullable(),
  sortOrder: z.number().int(),
});
const searchHitSchema = z.object({
  id: z.string(),
  handle: z.string().nullable().optional(),
  title: z.string(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  price_amount: z.number().int().nullable().optional(),
  currency_code: z.string().nullable().optional(),
  available: z.boolean().optional(),
});

export type ProductCardView = {
  id: string;
  handle: string;
  title: string;
  brand: string | null;
  description: string | null;
  thumbnail: string | null;
  price: { amount: number; currency: string } | null;
  available: boolean | null;
};

export const fallbackHomepage: HomepageBundle = {
  homepage: {
    title: "Modern essentials, delivered across South Africa",
    intro: "Explore Dalizebo Commerce while live editorial content reconnects.",
    sections: [],
    seo: null,
  },
  banners: [],
};

export const fallbackNavigation: NavigationContent = {
  primaryLinks: [
    { label: "Shop", href: "/search" },
    { label: "FAQs", href: "/faqs" },
  ],
  utilityLinks: [{ label: "Cart", href: "/cart" }],
  footerGroups: [],
};

async function bffFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  fallback: T,
  revalidate = 60,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(new URL(path, apiUrl), {
      headers: { accept: "application/json" },
      next: { revalidate },
      signal: controller.signal,
    });
    if (!response.ok) return fallback;
    const parsed = z.object({ data: schema }).safeParse(await response.json());
    return parsed.success ? parsed.data.data : fallback;
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

function productCard(product: Product): ProductCardView {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    brand: product.brand,
    description: product.description,
    thumbnail: product.thumbnail,
    price: product.variants.find((variant) => variant.price)?.price ?? null,
    available: null,
  };
}

export function getHomepage(): Promise<HomepageBundle> {
  return bffFetch(
    "/api/v1/content/homepage",
    homepageBundleSchema,
    fallbackHomepage,
  );
}

export function getNavigation(): Promise<NavigationContent> {
  return bffFetch(
    "/api/v1/content/navigation",
    navigationSchema,
    fallbackNavigation,
  );
}

export async function getProducts(): Promise<Product[]> {
  return bffFetch("/api/v1/products", z.array(productSchema), [], 30);
}

export function getProduct(handle: string): Promise<Product | null> {
  return bffFetch(
    `/api/v1/products/${encodeURIComponent(handle)}`,
    productSchema.nullable(),
    null,
    30,
  );
}

export async function searchProducts(
  query: string,
): Promise<ProductCardView[]> {
  const hits = await bffFetch(
    `/api/v1/search?q=${encodeURIComponent(query)}`,
    z.array(searchHitSchema),
    [],
    15,
  );
  return hits.flatMap((hit) => {
    if (!hit.handle) return [];
    return [
      {
        id: hit.id,
        handle: hit.handle,
        title: hit.title,
        brand: hit.brand ?? null,
        description: hit.description ?? null,
        thumbnail: hit.thumbnail ?? null,
        price:
          hit.price_amount !== null &&
          hit.price_amount !== undefined &&
          hit.currency_code
            ? { amount: hit.price_amount, currency: hit.currency_code }
            : null,
        available: hit.available ?? false,
      },
    ];
  });
}

export function productsToCards(products: Product[]): ProductCardView[] {
  return products.map(productCard);
}

export function getEditorialPage(slug: string): Promise<EditorialPage | null> {
  return bffFetch(
    `/api/v1/content/pages/${encodeURIComponent(slug)}`,
    pageSchema.nullable(),
    null,
  );
}

export function getFaqs(category?: string): Promise<FaqItem[]> {
  const suffix = category ? `?category=${encodeURIComponent(category)}` : "";
  return bffFetch(`/api/v1/content/faqs${suffix}`, z.array(faqSchema), []);
}
