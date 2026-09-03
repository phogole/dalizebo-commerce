import { ProductCard } from "../../components/product-card";
import { getProducts, productsToCards, searchProducts } from "../../lib/bff";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function SearchPage({ searchParams }: Props) {
  const rawQuery = (await searchParams).q;
  const query =
    (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? "";
  const products = query
    ? await searchProducts(query)
    : productsToCards(await getProducts());

  return (
    <main className="shell">
      <header className="page-hero">
        <p className="eyebrow">Catalogue</p>
        <h1>{query ? `Results for “${query}”` : "Find your next essential"}</h1>
        <p>Search products, brands and everyday collections.</p>
        <form className="search-form" action="/search">
          <input
            aria-label="Search products"
            defaultValue={query}
            name="q"
            placeholder="Search Dalizebo Commerce"
            type="search"
          />
          <button className="button button-primary" type="submit">
            Search
          </button>
        </form>
      </header>
      <p className="results-copy">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>
      {products.length > 0 ? (
        <div className="product-grid section-block" style={{ paddingTop: 0 }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state" style={{ marginBottom: 86 }}>
          <h3>No matches yet</h3>
          <p>Try another product name or browse the full catalogue.</p>
        </div>
      )}
    </main>
  );
}
