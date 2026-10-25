import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth-options';

/**
 * Route handlers only — Next.js route type validation rejects extra
 * exports (like `authOptions`) from a route.ts file, so the config
 * lives in lib/auth-options.ts.
 */
export const { handlers: { GET, POST } } = NextAuth(authOptions);
