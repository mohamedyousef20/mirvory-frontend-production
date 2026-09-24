// Routes that genuinely require an authenticated user. Everything else
// (product details, listings, categories, …) is browsable by guests, so a 401
// there must resolve quietly instead of kicking the visitor to the login page.
export const PROTECTED_ROUTE_PREFIXES = [
  '/account',
  '/profile',
  '/vendor',
  '/admin',
  '/driver',
  '/checkout',
  '/orders',
  '/wishlist',
  '/complaints',
];

export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const redirectToLoginIfProtected = (): void => {
  if (typeof window === 'undefined') return;

  const { pathname } = window.location;
  if (pathname.startsWith('/auth/')) return;
  if (!isProtectedPath(pathname)) return;

  window.location.href = '/auth/login';
};
