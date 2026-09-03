const apiUrl = process.env.API_URL ?? "http://localhost:4000";
const handle = process.env.ACCEPTANCE_PRODUCT_HANDLE ?? "dalizebo-essential-tee";

async function request(path, init) {
  const response = await fetch(`${apiUrl}${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed (${response.status}): ${JSON.stringify(body)}`);
  return body;
}

const health = await request("/health/ready");
if (health.status !== "ready") throw new Error("API dependencies are not ready");
const product = (await request(`/api/v1/products/${handle}`)).data;
const variant = product?.variants?.[0];
if (!variant?.id) throw new Error("Seeded product has no variant");
if (variant.price?.currency !== "ZAR" || !Number.isInteger(variant.price?.amount)) throw new Error("Product violates the ZAR minor-unit contract");
const search = await request(`/api/v1/search?q=${encodeURIComponent(product.title)}`);
if (!search.data?.some((hit) => hit.id === product.id)) throw new Error("Seeded product was not found in products_v1");
const cart = (await request("/api/v1/carts", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).data;
if (!cart?.id) throw new Error("Cart creation returned no ID");
await request(`/api/v1/carts/${cart.id}/lines`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ variantId: variant.id, quantity: 1 }) });
const payment = await request("/api/v1/payments", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": `acceptance-${cart.id}` }, body: JSON.stringify(variant.price) });
if (!payment.data?.reference) throw new Error("Sandbox payment returned no reference");
console.log(JSON.stringify({ passed: true, productId: product.id, cartId: cart.id, paymentReference: payment.data.reference }, null, 2));
