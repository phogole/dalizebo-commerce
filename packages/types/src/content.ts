export type SeoContent = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
};

export type NavigationLink = {
  label: string;
  href: string;
};

export type FooterGroup = {
  title: string;
  links: NavigationLink[];
};

export type NavigationContent = {
  primaryLinks: NavigationLink[];
  utilityLinks: NavigationLink[];
  footerGroups: FooterGroup[];
};

export type HomepageSection = {
  type: string;
  title: string | null;
  copy: string | null;
  productHandles: string[];
};

export type HomepageContent = {
  title: string;
  intro: string | null;
  sections: HomepageSection[];
  seo: SeoContent | null;
};

export type BannerContent = {
  id: string;
  title: string;
  copy: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  campaignKey: string | null;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
};

export type HomepageBundle = {
  homepage: HomepageContent;
  banners: BannerContent[];
};

export type EditorialPage = {
  title: string;
  slug: string;
  body: string;
  seo: SeoContent | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export type ContentSource = "cms" | "cache" | "fallback";

export type ContentMeta = {
  source: ContentSource;
  stale: boolean;
};
