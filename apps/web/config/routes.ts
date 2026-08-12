/**
 * Navigation configuration used by the Sidebar and any breadcrumb components.
 */
export const APP_ROUTES = {
  dashboard: "/dashboard",
  finance: "/finance",
  personnel: "/personnel",
  training: "/training",
  manual: "/manual",
  tasks: "/tasks",
  settings: "/settings",
  auth: {
    login: "/login",
  },
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
