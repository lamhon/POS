/**
 * API Error types for consistent error handling across the application.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, "FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

/**
 * Maps HTTP status codes to typed error instances.
 */
export function createApiError(
  status: number,
  body: { title?: string; detail?: string; code?: string; errors?: Record<string, string[]> }
): ApiError {
  const message = body.detail ?? body.title ?? "An error occurred";
  const code = body.code ?? "UNKNOWN_ERROR";

  switch (status) {
    case 400:
      return new ValidationError(message, body.errors);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    default:
      return new ApiError(status, code, message);
  }
}
