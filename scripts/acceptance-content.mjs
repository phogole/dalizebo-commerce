const apiUrl = process.env.API_URL ?? "http://localhost:4000";

async function request(path) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(5_000),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(
      `GET ${path} failed (${response.status}): ${JSON.stringify(body)}`,
    );
  }
  return body;
}

function assertContentMeta(response, name) {
  if (
    !response.meta ||
    !["cms", "cache", "fallback"].includes(response.meta.source)
  ) {
    throw new Error(`${name} did not expose a valid content source`);
  }
  if (typeof response.meta.stale !== "boolean") {
    throw new Error(`${name} did not expose a stale flag`);
  }
}

const homepage = await request("/api/v1/content/homepage");
assertContentMeta(homepage, "homepage");
if (!homepage.data?.homepage?.title || !Array.isArray(homepage.data?.banners)) {
  throw new Error("Homepage contract is invalid");
}

const navigation = await request("/api/v1/content/navigation");
assertContentMeta(navigation, "navigation");
if (!Array.isArray(navigation.data?.primaryLinks)) {
  throw new Error("Navigation contract is invalid");
}

const faqs = await request("/api/v1/content/faqs");
assertContentMeta(faqs, "FAQs");
if (!Array.isArray(faqs.data)) throw new Error("FAQ contract is invalid");

console.log(
  JSON.stringify(
    {
      passed: true,
      sources: {
        homepage: homepage.meta.source,
        navigation: navigation.meta.source,
        faqs: faqs.meta.source,
      },
    },
    null,
    2,
  ),
);
