/** Path-only return target (modal flows). */
export function clerkReturnUrl(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

/** Full URL for redirect-based sign-in / OAuth return (required on ephemeral tunnel hosts). */
export function clerkReturnHref(): string {
  if (typeof window === "undefined") return "/";
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`;
}
