/**
 * Shared API types aligned with ASP.NET Core ProblemDetails (RFC 7807).
 */

/** Standard RFC 7807 Problem Details response from the backend */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

/** Generic paginated response wrapper */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  succeeded: boolean;
  message?: string;
}

/** Pagination query parameters */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}
