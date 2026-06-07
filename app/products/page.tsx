import { MainNav } from "@/components/main-nav"
import { ProductGrid } from "@/components/product-grid"
import { SiteFooter } from "@/components/site-footer"

export default function ProductsPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>
      <div className="flex min-h-screen flex-col bg-[#f4f6fb]" dir="rtl">
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <ProductGrid />
          </div>
        </main>
      </div>
    </>
  )
}
