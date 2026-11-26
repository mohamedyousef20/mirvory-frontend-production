import { SideAds } from "@/components/side-ads"
import { ProductGrid } from "@/components/product-grid"
import { CatalogMobile } from "@/components/stitch/catalog-mobile"

export default function ProductsPage() {
  return (
    <>
      <div className="md:hidden"><CatalogMobile /><SideAds placement="products" /></div>
      <div className="hidden md:block cairo-desktop">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); .cairo-desktop * { font-family: 'Cairo', sans-serif !important; }`}</style>
        <div className="flex min-h-screen flex-col bg-[#f4f6fb]" dir="rtl">
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
              <SideAds placement="products" />
              <ProductGrid />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
