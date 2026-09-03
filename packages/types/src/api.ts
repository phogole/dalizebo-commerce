export type ApiSuccess<T, M = Record<string, unknown>> = {
  data: T;
  meta: M;
  requestId?: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
};
