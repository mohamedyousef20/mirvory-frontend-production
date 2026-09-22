"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Percent,
  Tag,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  Truck,
  TicketPercent,
  Zap,
  Gift,
  ChevronLeft,
  X,
  Megaphone,
} from "lucide-react"
import { toast } from "react-hot-toast"

import { productService, cartService, wishlistService, offerService } from "@/lib/api"
import { announcementService } from "@/lib/api/services/announcementService"
import { ProductCard } from "./ProductCard"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/contexts/AuthProvider"
import { addToGuestCart } from "@/lib/guestCart"

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

interface Announcement {
  _id: string
  title: string
  content: string
  type: "info" | "promo" | "urgent" | "announcement"
  isActive: boolean
  startDate?: string
  endDate?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

interface DiscountProduct {
  _id: string
  title: string
  description?: string
  price: number
  quantity: number
  discountPercentage: number
  discountedPrice: number
  images: string[]
  ratingsAverage?: number
  ratingsQuantity?: number
  ratings?: number | { rounded?: number | null }
  sizes?: string[]
  colors?: Array<{
    name: string
    value: string
    available?: boolean
    image?: string
  }>
  sold?: number
  isFeatured?: boolean
  isTrusted?: boolean
  isFavorite?: boolean
  category?: {
    _id?: string
    name?: string
    nameEn?: string
  }
  brand?: string
  createdAt?: string
}

type OfferTab =
  | "all"
  | "discounts"
  | "flash"
  | "quantity"
  | "shipping"
  | "coupons"

interface MockPromotion {
  id: string
  title: string
  description: string
  type: Exclude<OfferTab, "all" | "discounts">
  badge: string
  icon: typeof Zap
  expiresAt?: string
}

interface RealOffer {
  _id: string
  title: string
  description: string
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping'
  value: number
  minPurchaseAmount: number
  maxDiscountAmount: number | null
  startDate: string
  endDate: string
  isActive: boolean
  image: string
  applicableProducts?: string[]
  applicableCategories?: string[]
  usageLimit: number | null
  usageCount: number
}

const PROMOTIONS: MockPromotion[] = [
  {
    id: "flash-sale",
    title: "Flash Sale",
    description: "خصومات لفترة محدودة على منتجات مختارة.",
    type: "flash",
    badge: "لفترة محدودة",
    icon: Zap,
  },
  {
    id: "quantity-offer",
    title: "عروض الكمية",
    description: "اشترِ أكثر واستفد من توفير أفضل على المنتجات المؤهلة.",
    type: "quantity",
    badge: "وفر أكثر",
    icon: Gift,
  },
  {
    id: "free-shipping",
    title: "الشحن المجاني",
    description: "استفد من عروض الشحن المجاني المتاحة حسب شروط الطلب.",
    type: "shipping",
    badge: "شحن مجاني",
    icon: Truck,
  },
  {
    id: "coupons",
    title: "كوبونات الخصم",
    description: "استخدم كود الخصم أثناء إتمام الطلب للاستفادة من العروض المتاحة.",
    type: "coupons",
    badge: "خصم إضافي",
    icon: TicketPercent,
  },
]
/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

const formatDate = (date: string, language: string) =>
  new Date(date).toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

const formatPrice = (price: number) =>
  new Intl.NumberFormat("ar-EG").format(price)

export function OffersPage() {
  const { language } = useLanguage()
  const { user } = useAuth()

  const isLoggedIn = Boolean(user)

  const [discountProducts, setDiscountProducts] = useState<
    DiscountProduct[]
  >([])

  const [realOffers, setRealOffers] = useState<RealOffer[]>([])

  const [announcements, setAnnouncements] = useState<
    Announcement[]
  >([])

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState<OfferTab>("all")

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)

    try {
      // Fetch discounted products
      const productsResponse = await productService.getProducts({ limit: 50, sort: "-discountPercentage" })

      const productsData =
        productsResponse.data?.data ||
        productsResponse.data ||
        []

      const productsWithDiscount = Array.isArray(productsData)
        ? productsData.filter(
            (product: any) =>
              (product.discountPercentage || 0) > 0
          )
        : []

      setDiscountProducts(productsWithDiscount)

      // Fetch real offers from API
      try {
        const offersResponse = await offerService.getActiveOffers();
        console.log("Offers response:", offersResponse)
        const offersData = offersResponse.data || offersResponse
        setRealOffers(Array.isArray(offersData) ? offersData : [])
      } catch (err) {
        console.error("Failed to load offers", err)
        setRealOffers([])
      }

      // Fetch announcements
      const announcementsResponse =
        await announcementService.getActiveAnnouncements()

      const announcementsData =
        announcementsResponse.data?.announcements ||
        announcementsResponse.data ||
        []

      setAnnouncements(
        Array.isArray(announcementsData)
          ? announcementsData
          : []
      )
    } catch (err) {
      console.error("Failed to load offers data", err)

      toast.error(
        language === "ar"
          ? "فشل تحميل العروض"
          : "Failed to load offers"
      )
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ─────────────────────────────────────────────────────────
     Cart
  ───────────────────────────────────────────────────────── */

  const handleAddToCart = async (productId: string) => {
    const product = discountProducts.find(
      (p) => p._id === productId
    )

    if (!product) return

    if (isLoggedIn) {
      try {
        await cartService.addToCart({
          productId,
          quantity: 1,
        })

        toast.success(
          language === "ar"
            ? "تمت إضافة المنتج إلى السلة"
            : "Added to cart"
        )
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          (language === "ar"
            ? "فشل إضافة المنتج"
            : "Failed to add product")

        toast.error(message)
      }

      return
    }

    addToGuestCart({
      productId,
      quantity: 1,
      size: null,
      color: null,
      title: product.title,
      image: product.images?.[0] ?? null,
      price: product.discountedPrice || product.price,
    })

    toast.success(
      language === "ar"
        ? "تمت إضافة المنتج إلى السلة"
        : "Added to cart"
    )
  }

  /* ─────────────────────────────────────────────────────────
     Wishlist
  ───────────────────────────────────────────────────────── */

  const toggleWishlist = async (productId: string) => {
    if (!isLoggedIn) {
      toast.error(
        language === "ar"
          ? "يجب تسجيل الدخول أولاً"
          : "Please login first"
      )
      return
    }

    try {
      await wishlistService.toggleWishlist(productId)

      toast.success(
        language === "ar"
          ? "تم تحديث المفضلة"
          : "Wishlist updated"
      )

      fetchData()
    } catch {
      toast.error(
        language === "ar"
          ? "فشل تحديث المفضلة"
          : "Failed to update wishlist"
      )
    }
  }

  /* ─────────────────────────────────────────────────────────
     Filters
  ───────────────────────────────────────────────────────── */

  const filteredProducts = discountProducts.filter(
    (product) => {
      const matchesSearch =
        !search ||
        product.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === "all" ||
        product.category?._id === categoryFilter ||
        product.category?.name === categoryFilter

      return matchesSearch && matchesCategory
    }
  )

  const categories: string[] = Array.from(
    new Set(
      discountProducts
        .map((p) => p.category?.name)
        .filter(
          (name): name is string => Boolean(name)
        )
    )
  )

  /* ─────────────────────────────────────────────────────────
     Stats
  ───────────────────────────────────────────────────────── */

  const averageDiscount = Math.round(
    discountProducts.reduce(
      (sum, product) =>
        sum + (product.discountPercentage || 0),
      0
    ) / (discountProducts.length || 1)
  )

  const maxDiscount = Math.max(
    0,
    ...discountProducts.map(
      (product) => product.discountPercentage || 0
    )
  )

  /* ─────────────────────────────────────────────────────────
     Tabs
  ───────────────────────────────────────────────────────── */

  const tabs = [
    {
      id: "all" as OfferTab,
      label: language === "ar" ? "كل العروض" : "All Offers",
      icon: Tag,
    },
    {
      id: "discounts" as OfferTab,
      label:
        language === "ar"
          ? "خصومات المنتجات"
          : "Product Discounts",
      icon: Percent,
    },
    {
      id: "flash" as OfferTab,
      label: "Flash Sale",
      icon: Zap,
    },
    {
      id: "quantity" as OfferTab,
      label:
        language === "ar"
          ? "عروض الكمية"
          : "Quantity Offers",
      icon: Gift,
    },
    {
      id: "shipping" as OfferTab,
      label:
        language === "ar"
          ? "الشحن المجاني"
          : "Free Shipping",
      icon: Truck,
    },
    {
      id: "coupons" as OfferTab,
      label:
        language === "ar"
          ? "الكوبونات"
          : "Coupons",
      icon: TicketPercent,
    },
  ]

  const showProducts =
    activeTab === "all" ||
    activeTab === "discounts" ||
    activeTab === "flash"

  const showPromotions =
    activeTab === "all" ||
    ["flash", "quantity", "shipping", "coupons"].includes(
      activeTab
    )

  const visiblePromotions = PROMOTIONS.filter(
    (promotion) =>
      activeTab === "all" ||
      activeTab === promotion.type
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

        .mirvory-offers-page * {
          font-family: 'Cairo', sans-serif;
        }
      `}</style>

      <div
        className="mirvory-offers-page min-h-screen bg-[#f5f7fb]"
        dir="rtl"
      >
        {/* ─────────────────────────────────────────────
            HERO
        ───────────────────────────────────────────── */}

        <section className="relative overflow-hidden bg-[#0d2f75]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2f75] via-[#1649a6] to-[#2465d4]" />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-14">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold mb-5">
                <Percent className="w-4 h-4" />
                {language === "ar"
                  ? "عروض MIRVORY"
                  : "MIRVORY Offers"}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {language === "ar"
                  ? "عروضك المفضلة في مكان واحد"
                  : "All your favorite offers in one place"}
              </h1>

              <p className="mt-4 text-blue-100 text-sm sm:text-base max-w-2xl leading-7">
                {language === "ar"
                  ? "خصومات، Flash Sale، عروض كمية، كوبونات وشحن مجاني — اكتشف كل طرق التوفير على MIRVORY."
                  : "Discounts, Flash Sales, quantity offers, coupons and free shipping — all your ways to save on MIRVORY."}
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-blue-200 text-[11px]">
                    {language === "ar"
                      ? "منتجات عليها خصم"
                      : "Discounted Products"}
                  </p>
                  <p className="text-white text-xl font-black">
                    {discountProducts.length}
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-blue-200 text-[11px]">
                    {language === "ar"
                      ? "متوسط الخصم"
                      : "Average Discount"}
                  </p>
                  <p className="text-white text-xl font-black">
                    {averageDiscount}%
                  </p>
                </div>

                <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-blue-200 text-[11px]">
                    {language === "ar"
                      ? "أعلى خصم"
                      : "Highest Discount"}
                  </p>
                  <p className="text-white text-xl font-black">
                    {maxDiscount}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────
            TABS
        ───────────────────────────────────────────── */}

        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id)
                    }
                    className={`
                      shrink-0 flex items-center gap-2
                      px-4 py-2.5 rounded-xl text-sm font-semibold
                      transition-all
                      ${
                        active
                          ? "bg-[#1a4fba] text-white shadow-md shadow-blue-100"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-5 sm:px-6 py-7 space-y-7">

          {/* ───────────────────────────────────────────
              REAL OFFERS FROM API
          ─────────────────────────────────────────── */}

          {realOffers.length > 0 && activeTab === "all" && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-[#1a4fba]" />
                <h2 className="text-xl font-black text-slate-800">
                  {language === "ar" ? "العروض الحالية" : "Current Offers"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {realOffers.map((offer) => (
                  <div
                    key={offer._id}
 className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {offer.image && (
                      <div className="relative h-40 bg-slate-100">
                        <img
                          src={offer.image}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 bg-[#1a4fba] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                            {offer.type === 'percentage' ? (
                              <>{offer.value}%</>
                            ) : offer.type === 'fixed' ? (
                              <>{formatPrice(offer.value)} EGP</>
                            ) : offer.type === 'free_shipping' ? (
                              <>{language === 'ar' ? 'شحن مجاني' : 'Free Shipping'}</>
                            ) : (
                              <>{language === 'ar' ? 'عرض خاص' : 'Special Offer'}</>
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-black text-slate-800 text-lg">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-6">
                        {offer.description}
                      </p>
                      {offer.minPurchaseAmount > 0 && (
                        <p className="text-xs text-slate-400 mt-3">
                          {language === "ar" ? "الحد الأدنى للشراء:" : "Min purchase:"}{" "}
                          {formatPrice(offer.minPurchaseAmount)} EGP
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-xs text-slate-400">
                          {language === "ar" ? "ينتهي:" : "Ends:"}{" "}
                          {formatDate(offer.endDate, language)}
                        </div>
                        {offer.usageLimit && (
                          <div className="text-xs text-slate-400">
                            {offer.usageCount} / {offer.usageLimit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ───────────────────────────────────────────
              PROMOTION CARDS
          ─────────────────────────────────────────── */}

          {showPromotions &&
            visiblePromotions.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-800">
                      {language === "ar"
                        ? "طرق التوفير"
                        : "Ways to Save"}
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                      {language === "ar"
                        ? "استخدم العروض المناسبة لك"
                        : "Choose the offer that suits you"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visiblePromotions.map(
                    (promotion) => {
                      const Icon = promotion.icon

                      return (
                        <div
                          key={promotion.id}
                          className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1a4fba] flex items-center justify-center">
                              <Icon className="w-5 h-5" />
                            </div>

                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                              {promotion.badge}
                            </span>
                          </div>

                          <h3 className="font-black text-slate-800 mt-5">
                            {promotion.title}
                          </h3>

                          <p className="text-sm text-slate-500 leading-6 mt-2 min-h-[48px]">
                            {promotion.description}
                          </p>

                          {promotion.expiresAt && (
                            <div className="flex items-center gap-1.5 text-xs text-red-500 mt-4">
                              <Clock className="w-3.5 h-3.5" />
                              {language === "ar"
                                ? "ينتهي قريباً"
                                : "Ending soon"}
                            </div>
                          )}

                          <button
                            onClick={() =>
                              setActiveTab(
                                promotion.type
                              )
                            }
                            className="w-full mt-5 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 text-[#1a4fba] text-sm font-bold group-hover:bg-[#1a4fba] group-hover:text-white transition"
                          >
                            {language === "ar"
                              ? "اكتشف العرض"
                              : "Explore offer"}

                            <ChevronLeft className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    }
                  )}
                </div>
              </section>
            )}

          {/* ───────────────────────────────────────────
              ANNOUNCEMENTS
          ─────────────────────────────────────────── */}

          {announcements.length > 0 &&
            activeTab === "all" && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone className="w-5 h-5 text-[#1a4fba]" />

                  <h2 className="text-xl font-black text-slate-800">
                    {language === "ar"
                      ? "آخر الإعلانات"
                      : "Latest Announcements"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {announcements.map(
                    (announcement) => (
                      <button
                        key={announcement._id}
                        onClick={() =>
                          setSelectedAnnouncement(
                            announcement
                          )
                        }
                        className="text-right bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#1a4fba] bg-blue-50 px-2.5 py-1 rounded-full">
                            {announcement.type ===
                            "promo"
                              ? "عرض خاص"
                              : announcement.type ===
                                "urgent"
                              ? "عاجل"
                              : "إعلان"}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            {formatDate(
                              announcement.createdAt,
                              language
                            )}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-800 line-clamp-1">
                          {announcement.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-6">
                          {announcement.content}
                        </p>
                      </button>
                    )
                  )}
                </div>
              </section>
            )}

          {/* ───────────────────────────────────────────
              PRODUCT FILTERS
          ─────────────────────────────────────────── */}

          {showProducts && (
            <section>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                      type="text"
                      placeholder={
                        language === "ar"
                          ? "ابحث داخل العروض..."
                          : "Search offers..."
                      }
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1a4fba]"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                    <select
                      value={categoryFilter}
                      onChange={(e) =>
                        setCategoryFilter(
                          e.target.value
                        )
                      }
                      className="appearance-none w-full lg:w-[210px] pr-10 pl-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="all">
                        {language === "ar"
                          ? "جميع الفئات"
                          : "All Categories"}
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      fetchData()
                    }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a4fba] text-white text-sm font-bold hover:bg-[#1640a0] transition"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {language === "ar"
                      ? "تحديث"
                      : "Refresh"}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ───────────────────────────────────────────
              PRODUCT GRID
          ─────────────────────────────────────────── */}

          {showProducts && (
            <section>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-[#1a4fba]" />

                    <h2 className="text-xl font-black text-slate-800">
                      {activeTab === "flash"
                        ? "Flash Sale"
                        : language === "ar"
                        ? "المنتجات المخفضة"
                        : "Discounted Products"}
                    </h2>
                  </div>

                  <p className="text-sm text-slate-400 mt-1">
                    {filteredProducts.length}{" "}
                    {language === "ar"
                      ? "منتج متاح"
                      : "products available"}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-24 flex flex-col items-center gap-4">
                  <div className="w-11 h-11 border-4 border-[#1a4fba] border-t-transparent rounded-full animate-spin" />

                  <p className="text-sm text-slate-500">
                    {language === "ar"
                      ? "جاري تحميل العروض..."
                      : "Loading offers..."}
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 py-24 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                    <ShoppingBag className="w-9 h-9 text-slate-300" />
                  </div>

                  <h3 className="font-bold text-slate-700 mt-5">
                    {language === "ar"
                      ? "لا توجد عروض مطابقة"
                      : "No matching offers"}
                  </h3>

                  <p className="text-sm text-slate-400 mt-2">
                    {language === "ar"
                      ? "جرّب تغيير البحث أو الفئة"
                      : "Try changing your search or category"}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredProducts.map(
                      (product) => (
                        <div
                          key={product._id}
                          className="relative"
                        >
                          <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-sm">
                              <Percent className="w-3 h-3" />
                              {product.discountPercentage}%
                            </span>
                          </div>

                          <ProductCard
                            product={product}
                            language={language}
                            onAddToCart={
                              handleAddToCart
                            }
                            onToggleWishlist={
                              toggleWishlist
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ───────────────────────────────────────────
              SHIPPING OFFER
          ─────────────────────────────────────────── */}

          {activeTab === "shipping" && (
            <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-[#0d2f75] to-[#2465d4] p-7 sm:p-10 text-white">
                <div className="max-w-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                    <Truck className="w-6 h-6" />
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black">
                    {language === "ar"
                      ? "وفر تكلفة الشحن"
                      : "Save on shipping"}
                  </h2>

                  <p className="mt-3 text-blue-100 leading-7">
                    {language === "ar"
                      ? "استفد من عروض الشحن المجاني المتاحة على MIRVORY حسب قيمة الطلب وطريقة الاستلام."
                      : "Enjoy available free-shipping offers depending on order value and delivery method."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-blue-200 text-xs">
                        {language === "ar"
                          ? "نقطة الاستلام"
                          : "Pickup"}
                      </p>
                      <p className="font-black mt-1">
                        {language === "ar"
                          ? "شحن مجاني"
                          : "Free Shipping"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                      <p className="text-blue-200 text-xs">
                        {language === "ar"
                          ? "العروض المؤهلة"
                          : "Eligible Offers"}
                      </p>
                      <p className="font-black mt-1">
                        {language === "ar"
                          ? "حسب العرض"
                          : "Offer dependent"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ───────────────────────────────────────────
              QUANTITY OFFER
          ─────────────────────────────────────────── */}

          {activeTab === "quantity" && (
            <section className="bg-white rounded-3xl border border-slate-100 p-7 sm:p-10 shadow-sm">
              <div className="max-w-3xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mt-5">
                  {language === "ar"
                    ? "اشترِ أكثر ووفر أكثر"
                    : "Buy more, save more"}
                </h2>

                <p className="text-slate-500 leading-7 mt-3">
                  {language === "ar"
                    ? "عروض الكمية تسمح بتقديم خصم إضافي عند شراء أكثر من قطعة من المنتجات المؤهلة."
                    : "Quantity promotions provide additional discounts when buying multiple eligible products."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7">
                  {[
                    ["2 قطع", "خصم إضافي"],
                    ["3 قطع", "خصم أكبر"],
                    ["4+ قطع", "أفضل توفير"],
                  ].map(([title, subtitle]) => (
                    <div
                      key={title}
                      className="rounded-2xl bg-slate-50 border border-slate-100 p-5"
                    >
                      <p className="font-black text-slate-800">
                        {title}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        {subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ───────────────────────────────────────────
              COUPONS
          ─────────────────────────────────────────── */}

          {activeTab === "coupons" && (
            <section className="bg-white rounded-3xl border border-slate-100 p-7 sm:p-10 shadow-sm">
              <div className="max-w-3xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TicketPercent className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mt-5">
                  {language === "ar"
                    ? "كوبونات MIRVORY"
                    : "MIRVORY Coupons"}
                </h2>

                <p className="text-slate-500 leading-7 mt-3">
                  {language === "ar"
                    ? "أدخل كود الخصم أثناء إتمام الطلب للاستفادة من الكوبونات المتاحة."
                    : "Enter your coupon code during checkout to use available discounts."}
                </p>

                <div className="mt-7 rounded-2xl border-2 border-dashed border-slate-200 p-6 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    <TicketPercent className="w-5 h-5 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-800">
                      {language === "ar"
                        ? "لديك كود خصم؟"
                        : "Have a coupon?"}
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      {language === "ar"
                        ? "يمكنك استخدامه في صفحة إتمام الطلب."
                        : "Use it during checkout."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* ─────────────────────────────────────────────
            ANNOUNCEMENT MODAL
        ───────────────────────────────────────────── */}

        {selectedAnnouncement && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() =>
              setSelectedAnnouncement(null)
            }
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-auto shadow-2xl"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <h3 className="text-xl font-black text-slate-800">
                    {selectedAnnouncement.title}
                  </h3>

                  <button
                    onClick={() =>
                      setSelectedAnnouncement(null)
                    }
                    className="shrink-0 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedAnnouncement.imageUrl && (
                  <img
                    src={
                      selectedAnnouncement.imageUrl
                    }
                    alt={
                      selectedAnnouncement.title
                    }
                    className="w-full h-52 object-cover rounded-2xl mb-5"
                  />
                )}

                <p className="text-slate-600 leading-7">
                  {selectedAnnouncement.content}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 mt-6 pt-5 border-t border-slate-100">
                  <span>
                    {language === "ar"
                      ? "تاريخ النشر: "
                      : "Published: "}

                    {formatDate(
                      selectedAnnouncement.createdAt,
                      language
                    )}
                  </span>

                  {selectedAnnouncement.endDate && (
                    <span>
                      {language === "ar"
                        ? "ينتهي: "
                        : "Ends: "}

                      {formatDate(
                        selectedAnnouncement.endDate,
                        language
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
