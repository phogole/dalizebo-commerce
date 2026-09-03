import { describe, expect, it } from "vitest";
import {
  toBannerDtos,
  toEditorialPageDto,
  toFaqDtos,
  toHomepageDto,
  toNavigationDto,
} from "./content-dto.js";

describe("content DTOs", () => {
  it("maps flattened Strapi 5 homepage content", () => {
    expect(
      toHomepageDto({
        data: {
          documentId: "home_1",
          title: "Everything you need",
          intro: "Delivered nationwide",
          sections: [
            {
              type: "featured-products",
              heading: "Staff picks",
              productHandles: ["dalizebo-tee"],
            },
          ],
          seo: { title: "Dalizebo", noIndex: false },
        },
      }),
    ).toMatchObject({
      title: "Everything you need",
      sections: [
        {
          type: "featured-products",
          title: "Staff picks",
          productHandles: ["dalizebo-tee"],
        },
      ],
      seo: { title: "Dalizebo", noIndex: false },
    });
  });

  it("accepts legacy nested entities while rejecting unsafe navigation URLs", () => {
    const result = toNavigationDto({
      data: {
        id: 1,
        attributes: {
          primaryLinks: [
            { label: "Shop", path: "/search" },
            { label: "Unsafe", url: "javascript:alert(1)" },
          ],
          utilityLinks: [{ title: "Cart", href: "/cart" }],
          footerGroups: [
            { title: "Help", links: [{ label: "FAQs", path: "/faqs" }] },
          ],
        },
      },
    });

    expect(result.primaryLinks).toEqual([{ label: "Shop", href: "/search" }]);
    expect(result.utilityLinks).toEqual([{ label: "Cart", href: "/cart" }]);
    expect(result.footerGroups[0]?.links).toEqual([
      { label: "FAQs", href: "/faqs" },
    ]);
  });

  it("filters disabled, future and expired banners", () => {
    const result = toBannerDtos(
      {
        data: [
          {
            documentId: "active",
            title: "Spring edit",
            enabled: true,
            startsAt: "2026-09-01T00:00:00Z",
            endsAt: "2026-09-30T00:00:00Z",
            sortOrder: 2,
            media: { url: "/uploads/spring.jpg" },
          },
          {
            documentId: "future",
            title: "Future",
            startsAt: "2026-10-01T00:00:00Z",
          },
          { documentId: "disabled", title: "Disabled", enabled: false },
        ],
      },
      "http://localhost:1337",
      new Date("2026-09-03T00:00:00Z"),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "active",
      imageUrl: "http://localhost:1337/uploads/spring.jpg",
      sortOrder: 2,
    });
  });

  it("maps pages and sorted FAQs", () => {
    expect(
      toEditorialPageDto({
        data: [
          {
            documentId: "page_1",
            title: "About",
            slug: "about",
            body: "Our story",
          },
        ],
      }),
    ).toMatchObject({ title: "About", slug: "about", body: "Our story" });

    expect(
      toFaqDtos({
        data: [
          {
            documentId: "faq_2",
            question: "Second?",
            answer: "Second",
            sortOrder: 2,
          },
          {
            documentId: "faq_1",
            question: "First?",
            answer: "First",
            sortOrder: 1,
          },
        ],
      }).map((item) => item.id),
    ).toEqual(["faq_1", "faq_2"]);
  });
});
