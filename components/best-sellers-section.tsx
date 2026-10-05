"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { productService } from "@/lib/api"
import { ProductCard } from "@/components/ProductCard"

interface Product {
  _id: string;
  title: string;
  titleEn?: string;
  images: string[];
  price: number;
  oldPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  quantity: number;
  sold?: number;
  ratings?: number | { average?: number; rounded?: number | null };
  count?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  category?: { name?: string; nameEn?: string };
}

export function BestSellersSection() {
  const { language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await productService.getBestSellers(8)
        let data: Product[] = []
        if (res?.data?.success && res.data.data) data = res.data.data
        else if (Array.isArray(res?.data?.data)) data = res.data.data
        else if (Array.isArray(res?.data)) data = res.data

        // Sort by sold count client-side as a fallback
        data = data.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
        setProducts(data)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <section className="my-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{language === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="my-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight">
              {language === "ar" ? "الأكثر مبيعاً" : "Best Sellers"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? "الأكثر طلباً من عملائنا" : "Most ordered by our customers"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-primary gap-1">
          <Link href="/products?sort=sold">
            {language === "ar" ? "عرض الكل" : "View All"}
            {language === "ar" ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </Link>
        </Button>
      </div>

      {/* Rank badges + product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.slice(0, 8).map((product, i) => (
          <div key={product._id} className="relative">
            {/* Rank badge */}
            {i < 3 && (
              <div className="absolute top-2 right-2 z-10">
                <Badge
                  className={`text-xs font-bold px-2 py-0.5 ${
                    i === 0 ? "bg-amber-500 hover:bg-amber-500 text-white" :
                    i === 1 ? "bg-slate-400 hover:bg-slate-400 text-white" :
                              "bg-amber-700 hover:bg-amber-700 text-white"
                  }`}
                >
                  #{i + 1}
                </Badge>
              </div>
            )}
            <ProductCard product={product as any} language={language} />
          </div>
        ))}
      </div>
    </section>
  )
}
