import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  compress: true,
  // Tree-shake known large packages to reduce bundle size
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
      "lodash",
    ],
  },
  images: {
    // Minimum cache TTL for optimized images (7 days)
    minimumCacheTTL: 7 * 24 * 60 * 60,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "your-image-host.com" },
      // Allow Railway backend hostname for any product images served directly
      { protocol: "https", hostname: "*.up.railway.app" },
      { protocol: "http", hostname: "localhost", port: "5000" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  env: {
    // Expose a safe fallback; actual value must be set in Vercel dashboard.
    // Never use the broken 'https://http://...' form.
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  },

  // ── API Proxy Rewrites ────────────────────────────────────────────────────
  //
  // All /api/* requests (except Next.js auth routes) are proxied server-side
  // to the Railway backend.
  //
  // WHY this fixes the Google Login → 401 bug:
  //   1. After Google OAuth the Next.js social-set-cookies route stores
  //      `accessToken` as an HTTP-only cookie scoped to www.mirvory.net
  //      with SameSite=Lax.
  //   2. When the browser calls /api/carts it goes to the SAME origin
  //      (www.mirvory.net), so the SameSite=Lax cookie IS attached.
  //   3. The Next.js edge forwards the full Cookie header to Railway.
  //   4. Railway reads req.cookies.accessToken → authenticates → req.user ✓
  //
  // IMPORTANT: Railway's Set-Cookie response headers are NOT forwarded back
  // to the browser by Next.js rewrites (this is by design in Next.js).
  // Therefore all cookie-setting must happen through the Next.js routes
  // (e.g. /api/auth/social-set-cookies), NOT directly from Railway responses.
  //
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

    return [
      // ── Next.js Auth routes: handled locally, NOT proxied ────────────────
      // The [...nextauth] catch-all and our custom Next.js API routes live
      // under /api/auth/ — they must stay local.
      // (No explicit rule needed: the source pattern below starts at /api/users
      // and /api/products etc., skipping /api/auth entirely.)

      // ── Backend API proxy ────────────────────────────────────────────────
      // Proxy all non-auth /api/* requests to Railway.
      // The cookie header is forwarded automatically by Next.js.
      {
        source: "/api/users/:path*",
        destination: `${backendUrl}/api/users/:path*`,
      },
      {
        source: "/api/products/:path*",
        destination: `${backendUrl}/api/products/:path*`,
      },
      {
        source: "/api/carts/:path*",
        destination: `${backendUrl}/api/carts/:path*`,
      },
      {
        source: "/api/carts",
        destination: `${backendUrl}/api/carts`,
      },
      {
        source: "/api/wishlist/:path*",
        destination: `${backendUrl}/api/wishlist/:path*`,
      },
      {
        source: "/api/wishlist",
        destination: `${backendUrl}/api/wishlist`,
      },
      {
        source: "/api/orders/:path*",
        destination: `${backendUrl}/api/orders/:path*`,
      },
      {
        source: "/api/categories/:path*",
        destination: `${backendUrl}/api/categories/:path*`,
      },
      {
        source: "/api/notifications/:path*",
        destination: `${backendUrl}/api/notifications/:path*`,
      },
      {
        source: "/api/notifications",
        destination: `${backendUrl}/api/notifications`,
      },
      {
        source: "/api/announcements/:path*",
        destination: `${backendUrl}/api/announcements/:path*`,
      },
      {
        source: "/api/addresses/:path*",
        destination: `${backendUrl}/api/addresses/:path*`,
      },
      {
        source: "/api/coupons/:path*",
        destination: `${backendUrl}/api/coupons/:path*`,
      },
      {
        source: "/api/pickup/:path*",
        destination: `${backendUrl}/api/pickup/:path*`,
      },
      {
        source: "/api/returns/:path*",
        destination: `${backendUrl}/api/returns/:path*`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${backendUrl}/api/payments/:path*`,
      },
      {
        source: "/api/complaints/:path*",
        destination: `${backendUrl}/api/complaints/:path*`,
      },
      {
        source: "/api/dashboard/:path*",
        destination: `${backendUrl}/api/dashboard/:path*`,
      },
      {
        source: "/api/analytics/:path*",
        destination: `${backendUrl}/api/analytics/:path*`,
      },
      {
        source: "/api/transactions/:path*",
        destination: `${backendUrl}/api/transactions/:path*`,
      },
      {
        source: "/api/platform-earnings/:path*",
        destination: `${backendUrl}/api/platform-earnings/:path*`,
      },
      {
        source: "/api/guest-cart/:path*",
        destination: `${backendUrl}/api/guest-cart/:path*`,
      },
      {
        source: "/api/guest-orders/:path*",
        destination: `${backendUrl}/api/guest-orders/:path*`,
      },
    ]
  },

  async headers() {
    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
      // Long-lived cache for static assets (images, fonts, etc.)
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  reactStrictMode: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  typescript: {
    ignoreBuildErrors: false,
  },
}

if (process.env.NODE_ENV === "production") {
  nextConfig.productionBrowserSourceMaps = false
  nextConfig.devIndicators = {
    buildActivity: false,
  }
}

export default nextConfig
