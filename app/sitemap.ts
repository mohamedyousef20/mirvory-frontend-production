import type { MetadataRoute } from "next"
import { SITE_URL, fetchAllProducts, fetchCategories } from "@/lib/seo"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([fetchAllProducts(), fetchCategories()])
  const statics = ["", "/products", "/offers", "/about", "/contact", "/faq", "/size-guide", "/return-policy", "/privacy", "/terms"]
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })),
    ...categories.filter((c: any) => c?._id).map((c: any) => ({
      url: `${SITE_URL}/categories/${c._id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.filter((p: any) => p?._id).map((p: any) => ({
      url: `${SITE_URL}/products/${p._id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
