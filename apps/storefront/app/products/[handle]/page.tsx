import { notFound } from "next/navigation";
import { getProduct } from "../../../lib/bff";
import { formatMoney } from "../../../lib/money";

type Props = { params: Promise<{ handle: string }> };

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  return (
    <main className="shell product-detail">
      <div className="product-detail-media">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt="" />
        ) : (
          <span>D</span>
        )}
      </div>
      <div>
        {product.brand ? <p className="eyebrow">{product.brand}</p> : null}
        <h1>{product.title}</h1>
        {product.description ? (
          <p className="product-description">{product.description}</p>
        ) : null}
        <div className="variant-list">
          {product.variants.map((variant) => (
            <div className="variant-row" key={variant.id}>
              <span>{variant.title}</span>
              <strong>
                {variant.price
                  ? formatMoney(variant.price.amount, variant.price.currency)
                  : "Price unavailable"}
              </strong>
            </div>
          ))}
        </div>
        <div className="button-row">
          <a className="button button-primary" href="/cart">
            Continue to cart
          </a>
        </div>
      </div>
    </main>
  );
}
