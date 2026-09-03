import type {
  BannerContent,
  EditorialPage,
  FaqItem,
  FooterGroup,
  HomepageContent,
  HomepageSection,
  NavigationContent,
  NavigationLink,
  SeoContent,
} from "@dalizebo/types";
import { z } from "zod";

const recordSchema = z.record(z.string(), z.unknown());

function asRecord(value: unknown): Record<string, unknown> | null {
  const parsed = recordSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function entity(value: unknown): Record<string, unknown> | null {
  const outer = asRecord(value);
  if (!outer) return null;
  const attributes = asRecord(outer.attributes);
  return attributes ? { ...outer, ...attributes } : outer;
}

function responseData(value: unknown): unknown {
  return asRecord(value)?.data;
}

function singleEntity(value: unknown): Record<string, unknown> | null {
  const data = responseData(value);
  if (Array.isArray(data)) return entity(data[0]);
  return entity(data);
}

function collectionEntities(value: unknown): Record<string, unknown>[] {
  const data = responseData(value);
  if (!Array.isArray(data)) return [];
  return data
    .map(entity)
    .filter((item): item is Record<string, unknown> => item !== null);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function integerValue(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isInteger(value)
    ? value
    : fallback;
}

function entityId(value: Record<string, unknown>, fallback: string): string {
  const id = value.documentId ?? value.id;
  return typeof id === "string" || typeof id === "number"
    ? String(id)
    : fallback;
}

function safeHref(value: unknown): string | null {
  const href = stringValue(value);
  if (!href) return null;
  if ((href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#"))
    return href;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function navigationLink(value: unknown): NavigationLink | null {
  const item = asRecord(value);
  if (!item) return null;
  const label = stringValue(item.label ?? item.title);
  const href = safeHref(item.href ?? item.path ?? item.url);
  return label && href ? { label, href } : null;
}

function navigationLinks(value: unknown): NavigationLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(navigationLink)
    .filter((item): item is NavigationLink => item !== null);
}

function footerGroups(value: unknown): FooterGroup[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const group = asRecord(raw);
    const title = stringValue(group?.title ?? group?.label);
    if (!group || !title) return [];
    return [{ title, links: navigationLinks(group.links) }];
  });
}

function seo(value: unknown): SeoContent | null {
  const content = entity(value);
  if (!content) return null;
  return {
    title: stringValue(content.title),
    description: stringValue(content.description),
    canonicalUrl: safeHref(content.canonicalUrl),
    noIndex: content.noIndex === true,
  };
}

function homepageSections(value: unknown): HomepageSection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    const section = asRecord(raw);
    const type = stringValue(section?.type ?? section?.kind);
    if (!section || !type) return [];
    const handles = Array.isArray(section.productHandles)
      ? section.productHandles
          .map(stringValue)
          .filter((handle): handle is string => handle !== null)
      : [];
    return [
      {
        type,
        title: stringValue(section.title ?? section.heading),
        copy: stringValue(section.copy ?? section.body),
        productHandles: handles,
      },
    ];
  });
}

function isoDate(value: unknown): string | null {
  const candidate = stringValue(value);
  if (!candidate || Number.isNaN(Date.parse(candidate))) return null;
  return new Date(candidate).toISOString();
}

function mediaUrl(value: unknown, assetBaseUrl: string): string | null {
  const wrapper = entity(value);
  const media = entity(wrapper?.data ?? wrapper);
  const path = stringValue(media?.url);
  if (!path) return null;
  try {
    return new URL(path, assetBaseUrl).toString();
  } catch {
    return null;
  }
}

export function toHomepageDto(value: unknown): HomepageContent {
  const homepage = singleEntity(value);
  const title = stringValue(homepage?.title);
  if (!homepage || !title) throw new Error("CMS_HOMEPAGE_INVALID");
  return {
    title,
    intro: stringValue(homepage.intro),
    sections: homepageSections(homepage.sections),
    seo: seo(homepage.seo),
  };
}

export function toNavigationDto(value: unknown): NavigationContent {
  const navigation = singleEntity(value);
  if (!navigation) throw new Error("CMS_NAVIGATION_INVALID");
  return {
    primaryLinks: navigationLinks(navigation.primaryLinks),
    utilityLinks: navigationLinks(navigation.utilityLinks),
    footerGroups: footerGroups(navigation.footerGroups),
  };
}

export function toBannerDtos(
  value: unknown,
  assetBaseUrl: string,
  now = new Date(),
): BannerContent[] {
  const timestamp = now.getTime();
  return collectionEntities(value)
    .flatMap((banner, index) => {
      const title = stringValue(banner.title);
      if (!title || banner.enabled === false) return [];
      const startsAt = isoDate(banner.startsAt);
      const endsAt = isoDate(banner.endsAt);
      if (startsAt && Date.parse(startsAt) > timestamp) return [];
      if (endsAt && Date.parse(endsAt) < timestamp) return [];
      return [
        {
          id: entityId(banner, `banner-${index}`),
          title,
          copy: stringValue(banner.copy),
          imageUrl: mediaUrl(banner.media, assetBaseUrl),
          ctaLabel: stringValue(banner.ctaLabel),
          ctaUrl: safeHref(banner.ctaUrl),
          campaignKey: stringValue(banner.campaignKey),
          startsAt,
          endsAt,
          sortOrder: integerValue(banner.sortOrder),
        },
      ];
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function toEditorialPageDto(value: unknown): EditorialPage | null {
  const page = singleEntity(value);
  if (!page) return null;
  const title = stringValue(page.title);
  const slug = stringValue(page.slug);
  const body = stringValue(page.body);
  if (!title || !slug || !body) throw new Error("CMS_PAGE_INVALID");
  return { title, slug, body, seo: seo(page.seo) };
}

export function toFaqDtos(value: unknown): FaqItem[] {
  return collectionEntities(value)
    .flatMap((faq, index) => {
      const question = stringValue(faq.question);
      const answer = stringValue(faq.answer);
      if (!question || !answer) return [];
      return [
        {
          id: entityId(faq, `faq-${index}`),
          question,
          answer,
          category: stringValue(faq.category),
          sortOrder: integerValue(faq.sortOrder),
        },
      ];
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
