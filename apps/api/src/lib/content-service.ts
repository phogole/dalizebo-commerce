import type {
  EditorialPage,
  FaqItem,
  HomepageBundle,
  NavigationContent,
} from "@dalizebo/types";
import { env } from "../config/env.js";
import { cmsFetch } from "./cms-client.js";
import { ResilientContentCache } from "./content-cache.js";
import {
  toBannerDtos,
  toEditorialPageDto,
  toFaqDtos,
  toHomepageDto,
  toNavigationDto,
} from "./content-dto.js";

const cache = new ResilientContentCache(
  env.CONTENT_CACHE_TTL_SECONDS * 1_000,
  env.CONTENT_STALE_TTL_SECONDS * 1_000,
);

export const fallbackHomepage: HomepageBundle = {
  homepage: {
    title: "Modern essentials, delivered across South Africa",
    intro:
      "Discover the latest Dalizebo products while our editorial service reconnects.",
    sections: [],
    seo: {
      title: "Dalizebo Commerce",
      description: "Modern commerce by Dalizebo Holdings",
      canonicalUrl: null,
      noIndex: false,
    },
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

function pathWithQuery(path: string, query: Record<string, string>): string {
  const search = new URLSearchParams(query);
  return `${path}?${search.toString()}`;
}

export function getHomepageContent() {
  return cache.get(
    "homepage",
    async () => {
      const [homepage, banners] = await Promise.all([
        cmsFetch<unknown>(
          pathWithQuery("/api/homepage", { "populate[seo]": "*" }),
        ),
        cmsFetch<unknown>(
          pathWithQuery("/api/banners", {
            "populate[media]": "*",
            "filters[enabled][$eq]": "true",
            "sort[0]": "sortOrder:asc",
          }),
        ),
      ]);
      return {
        homepage: toHomepageDto(homepage),
        banners: toBannerDtos(banners, env.STRAPI_URL),
      };
    },
    fallbackHomepage,
  );
}

export function getNavigationContent() {
  return cache.get(
    "navigation",
    async () =>
      toNavigationDto(
        await cmsFetch<unknown>(pathWithQuery("/api/navigation", {})),
      ),
    fallbackNavigation,
  );
}

export function getEditorialPage(slug: string) {
  return cache.get<EditorialPage | null>(
    `page:${slug}`,
    async () =>
      toEditorialPageDto(
        await cmsFetch<unknown>(
          pathWithQuery("/api/pages", {
            "filters[slug][$eq]": slug,
            "populate[seo]": "*",
            "pagination[pageSize]": "1",
          }),
        ),
      ),
    null,
  );
}

export function getFaqContent(category?: string) {
  const query: Record<string, string> = {
    "sort[0]": "sortOrder:asc",
    "pagination[pageSize]": "100",
  };
  if (category) query["filters[category][$eq]"] = category;
  return cache.get<FaqItem[]>(
    `faqs:${category ?? "all"}`,
    async () =>
      toFaqDtos(await cmsFetch<unknown>(pathWithQuery("/api/faqs", query))),
    [],
  );
}
