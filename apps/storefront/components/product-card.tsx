import Link from "next/link";
import type { ProductCardView } from "../lib/bff";
import { formatMoney } from "../lib/money";

export function ProductCard({ product }: { product: ProductCardView }) {
  return (
    <article className="product-card">
      <Link className="product-media" href={`/products/${product.handle}`}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">D</span>
        )}
      </Link>
      <div className="product-copy">
        {product.brand ? <p className="eyebrow">{product.brand}</p> : null}
        <h3>
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </h3>
        <div className="product-meta">
          <strong>
            {product.price
              ? formatMoney(product.price.amount, product.price.currency)
              : "Price on request"}
          </strong>
          <span
            className={product.available === true ? "stock in-stock" : "stock"}
          >
            {product.available === true
              ? "Available"
              : product.available === false
                ? "Unavailable"
                : "View options"}
          </span>
        </div>
      </div>
    </article>
  );
}
