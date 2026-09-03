import { env } from "../config/env.js";

export class CmsUpstreamError extends Error {
  constructor(
    public readonly code:
      | "CMS_HTTP_ERROR"
      | "CMS_NETWORK_ERROR"
      | "CMS_TIMEOUT"
      | "CMS_RESPONSE_INVALID",
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "CmsUpstreamError";
  }
}

export async function cmsFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    env.STRAPI_REQUEST_TIMEOUT_MS,
  );

  try {
    let response: Response;
    try {
      response = await fetch(new URL(path, env.STRAPI_URL), {
        headers: {
          accept: "application/json",
          ...(env.STRAPI_API_TOKEN
            ? { authorization: `Bearer ${env.STRAPI_API_TOKEN}` }
            : {}),
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new CmsUpstreamError(
          "CMS_TIMEOUT",
          `CMS request exceeded ${env.STRAPI_REQUEST_TIMEOUT_MS}ms`,
        );
      }
      throw new CmsUpstreamError(
        "CMS_NETWORK_ERROR",
        error instanceof Error ? error.message : "CMS request failed",
      );
    }

    if (!response.ok) {
      throw new CmsUpstreamError(
        "CMS_HTTP_ERROR",
        `CMS upstream returned ${response.status}`,
        response.status,
      );
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new CmsUpstreamError(
        "CMS_RESPONSE_INVALID",
        "CMS returned an invalid JSON response",
        response.status,
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
