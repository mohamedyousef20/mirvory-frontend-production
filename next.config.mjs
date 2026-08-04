import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pure-courtesy-production-8cb1.up.railway.app" },
      { protocol: "https", hostname: "example.com" },
      { protocol: "https", hostname: "your-image-host.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  env: {
    // JWT_SECRET removed - frontend should never have access to JWT secret
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://pure-courtesy-production-8cb1.up.railway.app",
  },
  // ⚠️  NO rewrites to the Railway backend.
  //
  // A Next.js rewrite proxies the request server-side, which means the
  // browser never sees the Railway domain.  When Railway's Set-Cookie header
  // arrives at the Vercel edge it is dropped because the cookie's Domain
  // (railway.app) does not match the response origin (vercel.app).
  // The browser therefore never stores the accessToken / refreshToken cookies,
  // which causes every authenticated request to fail and the user to be
  // redirected back to /auth/login.
  //
  // Fix: axios already sends directly to Railway with withCredentials: true
  // so CORS + SameSite=None; Secure handles it correctly.  No rewrites needed.
  async rewrites() {
    return [
      // Keep only the NextAuth self-referencing rule so /api/auth/* is
      // handled by the Next.js App Router, not proxied anywhere.
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          // Allow-Origin must be the FRONTEND origin (Vercel URL), not the backend URL.
          // NEXTAUTH_URL must be set to your Vercel deployment URL in the Vercel dashboard.
          { key: "Access-Control-Allow-Origin", value: process.env.NEXTAUTH_URL || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
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
