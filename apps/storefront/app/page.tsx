import Link from "next/link";
import { ProductCard } from "../components/product-card";
import { getHomepage, getProducts, productsToCards } from "../lib/bff";

export default async function HomePage() {
  const [content, products] = await Promise.all([getHomepage(), getProducts()]);
  const featured = productsToCards(products).slice(0, 8);
  const leadBanner = content.banners[0];

  return (
    <main>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Curated for everyday South Africa</p>
            <h1>{leadBanner?.title ?? content.homepage.title}</h1>
            <p>{leadBanner?.copy ?? content.homepage.intro}</p>
            <div className="button-row">
              <Link
                className="button button-primary"
                href={leadBanner?.ctaUrl ?? "/search"}
              >
                {leadBanner?.ctaLabel ?? "Shop the collection"}
              </Link>
              <Link className="button button-secondary" href="/faqs">
                Delivery information
              </Link>
            </div>
          </div>
          <div
            className="hero-visual"
            style={
              leadBanner?.imageUrl
                ? {
                    backgroundImage: `linear-gradient(135deg, rgba(3, 15, 35, .12), rgba(3, 15, 35, .55)), url(${leadBanner.imageUrl})`,
                  }
                : undefined
            }
            aria-label={
              leadBanner?.imageUrl ? leadBanner.title : "Dalizebo collection"
            }
          >
            <span>DC</span>
          </div>
        </div>
      </section>

      <section className="shell section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The latest edit</p>
            <h2>Featured products</h2>
          </div>
          <Link href="/search">View all</Link>
        </div>
        {featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>The catalogue is reconnecting</h3>
            <p>
              Editorial pages remain available while live product data returns.
            </p>
          </div>
        )}
      </section>

      {content.homepage.sections.map((section, index) => (
        <section className="editorial-band" key={`${section.type}-${index}`}>
          <div className="shell narrow-copy">
            <p className="eyebrow">{section.type.replaceAll("-", " ")}</p>
            {section.title ? <h2>{section.title}</h2> : null}
            {section.copy ? <p>{section.copy}</p> : null}
          </div>
        </section>
      ))}
    </main>
  );
}
