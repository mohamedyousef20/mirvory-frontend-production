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
import { HomeOffersCountdown } from "@/components/home-offers-countdown"
import { HomePromoBanners } from "@/components/home-promo-banners"
import StitchHome from "@/components/stitch/StitchHome"
import DesktopHome from "@/components/stitch/DesktopHome"

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
    <>
    <div className="md:hidden"><StitchHome /></div>
    <DesktopHome />
    {/* Legacy desktop home kept below but hidden: delete this block once the Stitch desktop home is approved. */}
    <div className="hidden min-h-screen flex-col">
      <main className="flex-1">
        {/* ── Hero Carousel ────────────────────────────────────────── */}
        <HeroCarousel />

        {/* ── Main content + side ads layout ──────────────────────── */}
        <div className="container px-4 py-6 md:py-10">
          {/* On md+: three-column layout with side ads flanking content */}
          <div className="flex gap-4 items-start">
            {/* Left side ad (hidden on mobile) */}
            <aside className="hidden xl:block w-44 flex-shrink-0 sticky top-20">
              
            </aside>

            {/* Main content column */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* ── Categories ────────────────────────────────────────── */}
              <CategorySection />

              {/* ── Scheduled offers with countdown ───────────────────── */}
              <HomeOffersCountdown />

              {/* ── Offer Banner ──────────────────────────────────────── */}
              <OfferBanner />

              {/* ── Best Sellers ──────────────────────────────────────── */}
              <BestSellersSection />

              <HomePromoBanners />

              <SectionDivider />

              {/* ── Featured Products (curated) ───────────────────────── */}
              <FeaturedProducts title="منتجات مميزة" />

              <SectionDivider />

              {/* ── Trending / New Arrivals ────────────────────────────── */}
              <TrendingSection />

              <SectionDivider />

              {/* ── Newest Products ────────────────────────────────────── */}
              <NewestProducts title="وصل حديثاً" />

              {/* ── Mobile side ads (between sections, below newest) ───── */}
              <div className="xl:hidden">
                
              </div>

              <SectionDivider icon={ShoppingBag} />

              {/* ── Full Product Grid with filters ────────────────────── */}
              <ProductGrid />
            </div>

            {/* Right side ad (hidden on mobile) */}
            <aside className="hidden xl:block w-44 flex-shrink-0 sticky top-20">
              
            </aside>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}
