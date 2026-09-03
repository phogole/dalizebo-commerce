export function ok<T>(
  data: T,
  requestId: string,
  meta: Record<string, unknown> = {},
) {
  return { data, meta, requestId };
}

export function fail(
  code: string,
  message: string,
  requestId: string,
  details: Record<string, unknown> = {},
) {
  return {
    error: { code, message, details },
    requestId,
  };
}
