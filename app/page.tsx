import { ProductGrid } from "@/components/product-grid"
import { HeroCarousel } from "@/components/hero-carousel"
import { CategorySection } from "@/components/category-section"
import { FeaturedProducts } from "@/components/featured-products"
import { NewestProducts } from "@/components/newest-product"
import { OfferBanner } from "@/components/offer-banner"
import { BestSellersSection } from "@/components/best-sellers-section"
import { TrendingSection } from "@/components/trending-section"
import { getUserServer } from "@/src/lib/getUserServer"
import { redirect } from "next/navigation"
import { ShoppingBag } from "lucide-react"

/** Lightweight visual divider between homepage sections */
function SectionDivider({ icon: Icon, label }: { icon?: React.ElementType; label?: string }) {
  return (
    <div className="flex items-center gap-3 my-2" aria-hidden="true">
      <div className="flex-1 h-px bg-border" />
      {Icon && <Icon className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />}
      {label && <span className="text-xs text-muted-foreground/60 whitespace-nowrap">{label}</span>}
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default async function Home() {
  const user = await getUserServer()
  if (user?.role === "seller") {
    redirect("/vendor/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* ── Hero Carousel ────────────────────────────────────────── */}
        <HeroCarousel />

        <div className="container px-4 py-6 md:py-10 space-y-2">
          {/* ── Categories ──────────────────────────────────────────── */}
          <CategorySection />

          {/* ── Offer Banner ────────────────────────────────────────── */}
          <OfferBanner />

          {/* ── Best Sellers ────────────────────────────────────────── */}
          <BestSellersSection />

          <SectionDivider />

          {/* ── Featured Products (curated) ──────────────────────────── */}
          <FeaturedProducts title="منتجات مميزة" />

          <SectionDivider />

          {/* ── Trending / New Arrivals ──────────────────────────────── */}
          <TrendingSection />

          <SectionDivider />

          {/* ── Newest Products (also new arrivals, different heading) ── */}
          <NewestProducts title="وصل حديثاً" />

          <SectionDivider icon={ShoppingBag} />

          {/* ── Full Product Grid with filters ──────────────────────── */}
          <ProductGrid />
        </div>
      </main>
    </div>
  )
}
