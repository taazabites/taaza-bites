/**
 * Same-origin public paths for the unified Taaza Bites host.
 * Live: https://www.taazabites.in/app | /admin | /partner
 */
export const PUBLIC_PATHS = {
  landing: "/",
  customer: "/app",
  admin: "/admin",
  delivery: "/partner",
} as const;

export function isPortalPath(href: string): boolean {
  return (
    href === PUBLIC_PATHS.customer ||
    href.startsWith(`${PUBLIC_PATHS.customer}/`) ||
    href === PUBLIC_PATHS.admin ||
    href.startsWith(`${PUBLIC_PATHS.admin}/`) ||
    href === PUBLIC_PATHS.delivery ||
    href.startsWith(`${PUBLIC_PATHS.delivery}/`)
  );
}
