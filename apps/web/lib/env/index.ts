/**
 * Centralized environment configuration.
 * Only NEXT_PUBLIC_* variables are accessible on the client side.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  /** Base URL for the ASP.NET Core API. Available on both server and client. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",

  /** Current app environment */
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",

  /** Whether the app is running in production */
  isProduction: process.env.NODE_ENV === "production",

  /** Whether the app is running in development */
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

export { requireEnv };
