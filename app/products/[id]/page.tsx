import ProductDetail from "@/components/product-detail"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"
import { SITE_URL, fetchProduct } from "@/lib/seo"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const p = await fetchProduct(id)
  if (!p?.title) return {}
  const desc = String(p.description || "").replace(/\s+/g, " ").trim().slice(0, 160)
  const img = p.image || p.colors?.[0]?.image
  const price = p.discountedPrice ?? p.price
  const url = `${SITE_URL}/products/${id}`
  const title = `${p.title} | Mirvory`
  return {
    title,
    description: desc || undefined,
    alternates: { canonical: url },
    openGraph: { title, description: desc || undefined, url, type: "website", locale: "ar_EG", siteName: "Mirvory", images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title, description: desc || undefined, images: img ? [img] : undefined },
    other: price ? { "product:price:amount": String(price), "product:price:currency": "EGP" } : undefined,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <ProductDetail productId={id} />
      </main>
    </div>
  )
}
