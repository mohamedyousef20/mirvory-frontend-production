import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/vendor", "/api", "/cart", "/checkout", "/guest-checkout", "/profile", "/orders", "/auth", "/verifyEmail", "/notifications", "/wishlist", "/loyalty"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
