"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react"
import { cartService, productService } from "@/lib/api"
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl"
import { useAuth } from "@/contexts/AuthProvider"
import { addToGuestCart } from "@/lib/guestCart"

interface MiniProduct {
  _id: string
  title: string
  titleEn?: string
  images: string[]
  price: number
  discountedPrice?: number
  discountPercentage?: number
  quantity: number
}

export function OfferBanner() {
  const { language } = useLanguage()
  const { user, cookiesReady } = useAuth()
  const isLoggedIn = Boolean(user)

  const [products, setProducts] = useState<MiniProduct[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Fetch discounted products on mount
  useEffect(() => {
    let cancelled = false

    const fetchDiscountedProducts = async () => {
      setIsLoading(true)
      try {
        const res = await productService.getProducts({ limit: 50, sort: "-discountPercentage" })
        const allProducts: MiniProduct[] = res.data?.data || []
        const discounted = allProducts.filter(
          (p) =>
            (p.discountPercentage && p.discountPercentage > 0) ||
            (p.discountedPrice && p.discountedPrice > 0 && p.discountedPrice < p.price)
        )
        if (!cancelled) {
          setProducts(discounted)
        }
      } catch (error) {
        if (!cancelled) setProducts([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDiscountedProducts()
    return () => { cancelled = true }
  }, [])

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (products.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [products.length])

  const currentProduct = products[currentIndex]

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }, [products.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }, [products.length])

  const handleAddToCart = useCallback(async (product: MiniProduct) => {
    setIsAddingToCart(true)
    try {
      if (isLoggedIn) {
        if (!cookiesReady) {
          await new Promise((resolve) => setTimeout(resolve, 1500))
        }
        await cartService.addToCart({ productId: product._id, quantity: 1 })
      } else {
        addToGuestCart({
          productId: product._id,
          quantity: 1,
          size: null,
          color: null,
          title: product.title,
          image: product.images?.[0] ?? null,
          price: product.discountedPrice || product.price,
          maxQuantity: product.quantity,
        })
      }
      toast.success(language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart")
      window.dispatchEvent(new Event("cart-updated"))
    } catch (error) {
      toast.error(language === "ar" ? "فشل إضافة المنتج إلى السلة" : "Failed to add product to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }, [isLoggedIn, cookiesReady, language])

  if (isLoading || products.length === 0 || !currentProduct) {
    return null
  }

  const discountLabel = currentProduct.discountPercentage
    ? `-${currentProduct.discountPercentage}%`
    : undefined

  return (
    <section className="px-4 md:px-6 py-8">
      <div className="relative max-w-7xl mx-auto overflow-hidden rounded-[28px] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] shadow-2xl">

        {/* Decorative background */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />

        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "35px 35px",
          }}
        />

        {/* Main Grid Layout for perfect visibility of both text and large image */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6 p-6 sm:p-10 md:p-14 lg:p-16">

          {/* Text Content Column */}
          <div className="md:col-span-7 space-y-5">

            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-white/90 text-xs sm:text-sm font-medium">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              {language === "ar" ? "عرض لفترة محدودة" : "Limited Time Offer"}
            </div>

            {/* Discount */}
            {discountLabel && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 bg-red-500 blur-xl opacity-30" />
                  <div className="relative flex items-center justify-center min-w-[70px] h-[70px] rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg rotate-[-4deg]">
                    <div className="text-center leading-none">
                      <span className="block text-2xl font-black">
                        {discountLabel.replace("-", "").replace("%", "")}
                      </span>
                      <span className="text-[10px] font-bold uppercase">
                        {language === "ar" ? "خصم" : "OFF"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-white/60 text-xs sm:text-sm">
                  <p>{language === "ar" ? "لا تفوّت الفرصة" : "Don't miss this offer"}</p>
                  <p className="text-white/90 font-semibold mt-1">{language === "ar" ? "احصل عليه الآن" : "Get yours today"}</p>
                </div>
              </div>
            )}

            {/* Product title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-tight font-black text-white tracking-tight">
              {language === "ar"
                ? currentProduct.title
                : currentProduct.titleEn || currentProduct.title}
            </h2>

            {/* Price */}
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl md:text-4xl font-black text-white">
                {(
                  currentProduct.discountedPrice || currentProduct.price
                ).toLocaleString()}{" "}
                <span className="text-base font-semibold text-white/70">
                  {language === "ar" ? "ج.م" : "EGP"}
                </span>
              </span>

              {currentProduct.discountedPrice &&
                currentProduct.discountedPrice < currentProduct.price && (
                  <span className="text-lg text-white/40 line-through mb-1">
                    {currentProduct.price.toLocaleString()}{" "}
                    {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs sm:text-sm text-white/60">
                {currentProduct.quantity > 0
                  ? language === "ar"
                    ? `متوفر الآن — ${currentProduct.quantity} قطعة`
                    : `Available now — ${currentProduct.quantity} left`
                  : language === "ar"
                    ? "نفذت الكمية"
                    : "Out of stock"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                disabled={currentProduct.quantity === 0 || isAddingToCart}
                onClick={() => handleAddToCart(currentProduct)}
                className="h-12 px-7 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold shadow-lg transition-all hover:-translate-y-0.5"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAddingToCart
                  ? language === "ar" ? "جاري الإضافة..." : "Adding..."
                  : currentProduct.quantity === 0
                    ? language === "ar" ? "نفذت الكمية" : "Out of Stock"
                    : language === "ar" ? "أضف للسلة" : "Add to Cart"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-7 rounded-xl bg-transparent border-white/25 text-white hover:bg-white/10 hover:text-white font-semibold"
                asChild
              >
                <Link href={`/products/${currentProduct._id}`}>
                  {language === "ar" ? "عرض التفاصيل" : "View Details"}
                  {language === "ar" ? (
                    <ChevronLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </Link>
              </Button>
            </div>
          </div>

          {/* Clearly Visible Product Image Column (Responsive for Mobile & Desktop) */}
          <div className="md:col-span-5 flex items-center justify-center my-4 md:my-0">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square">

              {/* Glow Behind Image */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl scale-90" />

              {/* Floating Discount Badge */}
              {discountLabel && (
                <div className="absolute -top-3 -right-3 z-20 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl rotate-12">
                  <div className="text-center leading-none">
                    <span className="block text-lg font-black">
                      {discountLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Glass Card Container */}
              <div className="absolute inset-0 rounded-[32px] bg-white/10 border border-white/15 backdrop-blur-md shadow-2xl overflow-hidden flex items-center justify-center p-6">
                {currentProduct.images?.[0] && (
                  <Image
                    src={normalizeImageUrl(currentProduct.images[0])}
                    alt={
                      language === "ar"
                        ? currentProduct.title
                        : currentProduct.titleEn || currentProduct.title
                    }
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-contain p-4 drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.src = "/placeholder.svg"
                    }}
                  />
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Controls */}
        {products.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute z-30 left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white transition-all hover:scale-105"
              aria-label="Previous offer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              onClick={goToNext}
              className="absolute z-30 right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white transition-all hover:scale-105"
              aria-label="Next offer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Indicators */}
            <div className="absolute z-30 bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
              {products.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                      ? "w-7 bg-white"
                      : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  aria-label={`Go to offer ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}