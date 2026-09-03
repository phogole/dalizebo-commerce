import { env } from "../config/env.js";

export class CommerceUpstreamError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function commerceFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.COMMERCE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(env.MEDUSA_PUBLISHABLE_KEY
        ? { "x-publishable-api-key": env.MEDUSA_PUBLISHABLE_KEY }
        : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new CommerceUpstreamError(
      response.status,
      `Commerce upstream returned ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}
