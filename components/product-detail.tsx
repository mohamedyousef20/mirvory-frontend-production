"use client"
import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MirvoryPageLoader } from "./MirvoryLoader"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ShoppingCart, Heart, Share2, Truck,
  ShieldCheck, RotateCcw, Minus, Plus, AlertCircle,
  Pencil,
  Loader2,
  Trash2,
  Zap,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cartService, productService, ratingService, wishlistService } from "@/lib/api"
import { addToGuestCart } from "@/lib/guestCart"
import RatingStars from "@/components/Rating/RatingStars"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthProvider"
import { useRouter } from "next/navigation"

// ── Video embed helper ───────────────────────────────────────────────────────

/**
 * Extracts a YouTube video ID from every common URL format:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://m.youtube.com/watch?v=VIDEO_ID
 *  - https://youtube.com/embed/VIDEO_ID          (already an embed)
 *  - https://youtube.com/shorts/VIDEO_ID         (Shorts)
 *  - https://www.youtube.com/watch?v=ID&t=30s    (with extra params)
 */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  try {
    const u = new URL(trimmed)
    const host = u.hostname.replace(/^(www\.|m\.)/, '')

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('?')[0].split('/')[0]
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      // /watch?v=VIDEO_ID
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`

      // /embed/VIDEO_ID (already embed — just normalise domain)
      const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/)
      if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`

      // /shorts/VIDEO_ID
      const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/)
      if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`
    }

    return null
  } catch {
    return null
  }
}

function ProductVideoEmbed({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url)

  if (embedUrl) {
    return (
      <div className="space-y-3">
        {/* 16:9 responsive container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900"
             style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title="فيديو المنتج"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          انقر على الفيديو لتشغيله — يُفتح في وضع آمن (YouTube Privacy Enhanced)
        </p>
      </div>
    )
  }

  // Invalid / unsupported URL — show a safe fallback
  const looksLikeUrl = /^https?:\/\//i.test(url.trim())
  if (looksLikeUrl) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">لا يمكن عرض الفيديو مضمّناً</p>
        <p className="text-xs text-slate-500">رابط الفيديو غير مدعوم للعرض المباشر (يدعم YouTube فقط)</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a4fba] text-white text-sm font-medium rounded-xl hover:bg-[#1640a0] transition">
          مشاهدة الفيديو ↗
        </a>
      </div>
    )
  }

  return (
    <div className="py-6 text-center text-sm text-muted-foreground bg-slate-50 rounded-2xl border border-slate-200">
      رابط الفيديو غير صالح أو مفقود.
    </div>
  )
}

// ── TypeScript interfaces ────────────────────────────────────────────────────

interface ColorSize {
  size: string
  quantity: number
}

interface ProductColor {
  name: string
  value: string            // hex e.g. "#000000"
  image?: string | null
  available: boolean
  /** Per-size inventory — present in new products */
  sizes?: ColorSize[]
}

interface Product {
  _id: string
  title: string
  description: string
  price: number
  discountPercentage: number
  discountedPrice: number
  quantity: number
  sold: number
  images: string[]
  sizes: string[]          // legacy flat sizes list
  colors: ProductColor[]
  ratings: {
    average: number
    count: number
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number }
  }
  category: {
    _id: string
    name: string
    nameEn: string
  }
  isFeatured: boolean
  status: 'available' | 'pending' | 'sold'
  createdAt: string
  updatedAt: string
  videoUrl?: string  // optional YouTube / embed URL
}

interface Review {
  id: string
  _id?: string
  rating: number
  comment?: string
  user?: { _id?: string; fullName: string | null }
  createdAt: string
}

interface RelatedProduct {
  _id: string
  title: string
  price: number
  discountPercentage: number
  discountedPrice: number
  images: string[]
  ratings: { average: number; count: number }
}

// ── Component ─────────────────────────────────────────────────────────────────

const ProductDetail = ({ productId }: { productId: string }) => {
  const { language, t } = useLanguage()
  const { user, cookiesReady } = useAuth()
  const isLoggedIn = Boolean(user)
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')

  // ── New: single selected color + size ──────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<string>('')   // hex value
  const [selectedSize, setSelectedSize]   = useState<string>('')

  // Legacy arrays — kept for cart/checkout backwards compatibility
  const [selectedSizes,  setSelectedSizes]  = useState<string[]>([''])
  const [selectedColors, setSelectedColors] = useState<string[]>([''])

  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingsSummary, setRatingsSummary] = useState<{ average: number; total: number } | null>(null)
  const [userRatingId, setUserRatingId] = useState<string | null>(null)
  const [ratingInput, setRatingInput] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const userId = user?._id || null
  const reviewFormRef = useRef<HTMLFormElement | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Return the available sizes for a given color hex value */
  const getSizesForColor = useCallback(
    (colorValue: string): ColorSize[] => {
      if (!product) return []
      const colorObj = product.colors?.find(c => c.value === colorValue)
      if (colorObj?.sizes && colorObj.sizes.length > 0) return colorObj.sizes
      // Fallback: legacy flat sizes array
      return (product.sizes || []).map(s => ({ size: s, quantity: 99 }))
    },
    [product]
  )

  /** Sizes currently relevant to the selected color */
  const activeSizes: ColorSize[] = useMemo(
    () => (selectedColor ? getSizesForColor(selectedColor) : []),
    [selectedColor, getSizesForColor]
  )

  /** Max purchasable quantity for the current color+size combo */
  const maxQty: number = useMemo(() => {
    if (selectedSize) {
      const entry = activeSizes.find(s => s.size === selectedSize)
      if (entry) return entry.quantity
    }
    // No color-size granularity — fall back to product-level
    return product?.quantity ?? 0
  }, [selectedSize, activeSizes, product?.quantity])

  // ── Reload ─────────────────────────────────────────────────────────────────

  const handleReload = useCallback(() => {
    setIsLoading(true)
    setProduct(null)
    setError(null)
  }, [])

  // ── Fetch product ──────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await productService.getProductById(productId)
        if (response.data && response.data.product) {
          const pd = response.data.product as Product
          setProduct(pd)

          // Set initial main image: prefer first color's image, then product images
          const firstColor = pd.colors?.find(c => c.available) ?? pd.colors?.[0]
          const initImage = firstColor?.image || pd.images?.[0] || ''
          setMainImage(initImage)

          // Pre-select first available color
          if (firstColor) {
            setSelectedColor(firstColor.value)
            setSelectedColors([firstColor.value])
          } else {
            setSelectedColor('')
            setSelectedColors([''])
          }
          setSelectedSize('')
          setSelectedSizes([''])
          setQuantity(1)

          // Fetch related products
          if (pd.category?._id) {
            fetchRelatedProducts(pd.category._id)
          }
        } else {
          const msg = language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'Error loading product'
          setError(msg)
          toast.error(msg)
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        const msg = language === 'ar' ? 'حدث خطأ أثناء تحميل المنتج' : 'Error loading product'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchRelatedProducts = async (categoryId: string) => {
      try {
        const response = await productService.getProducts({ category: categoryId, limit: 4, exclude: productId })
        if (response.data?.products) setRelatedProducts(response.data.products)
      } catch {
        setRelatedProducts([])
      }
    }

    if (productId) fetchProduct()
  }, [productId, language])

  // ── Wishlist check ─────────────────────────────────────────────────────────

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await wishlistService.getWishlist()
        const items = response.data?.items || response.data?.products || []
        setIsFavorite(items.some((item: { product?: { _id?: string } | string }) =>
          (typeof item.product === 'object' ? item.product?._id : item.product) === productId
        ))
      } catch {
        setIsFavorite(false)
      }
    }
    if (productId && product && isLoggedIn) checkFavorite()
    else setIsFavorite(false)
  }, [productId, product, isLoggedIn])

  // ── Color selection ────────────────────────────────────────────────────────

  const handleColorSelect = useCallback((colorValue: string) => {
    setSelectedColor(colorValue)
    setSelectedColors([colorValue])
    setSelectedSize('')
    setSelectedSizes([''])
    setQuantity(1)

    if (product) {
      const colorObj = product.colors?.find(c => c.value === colorValue)
      setMainImage(colorObj?.image || product.images?.[0] || '')
    }
  }, [product])

  // ── Size selection ─────────────────────────────────────────────────────────

  const handleSizeSelect = useCallback((sizeValue: string) => {
    setSelectedSize(sizeValue)
    setSelectedSizes([sizeValue])
    setQuantity(1)
  }, [])

  // ── Quantity change ────────────────────────────────────────────────────────

  const handleQuantityChange = useCallback((value: number) => {
    const next = Math.max(1, maxQty > 0 ? Math.min(value, maxQty) : 1)
    setQuantity(next)
  }, [maxQty])

  // ── Validate before add-to-cart / buy-now ─────────────────────────────────

  const validateSelections = useCallback((): boolean => {
    if (!product) return false

    const hasColors = product.colors?.length > 0
    const hasSizes  = product.sizes?.length > 0 || activeSizes.length > 0

    if (hasColors && !selectedColor) {
      toast.error(language === 'ar' ? 'يرجى اختيار اللون' : 'Please select a color')
      return false
    }
    if (hasSizes && !selectedSize) {
      toast.error(language === 'ar' ? 'يرجى اختيار المقاس' : 'Please select a size')
      return false
    }
    if (maxQty === 0) {
      toast.error(language === 'ar' ? 'هذا المقاس غير متوفر حالياً' : 'This size is currently out of stock')
      return false
    }
    if (quantity > maxQty) {
      toast.error(language === 'ar' ? `الكمية المتاحة ${maxQty} فقط` : `Only ${maxQty} available`)
      return false
    }
    return true
  }, [product, selectedColor, selectedSize, maxQty, quantity, activeSizes.length, language])

  // ── Add to cart ────────────────────────────────────────────────────────────

  const addToCartHandler = useCallback(async () => {
    if (!validateSelections()) return
    if (!product) return

    // Build color snapshot for guest cart display
    const colorObj = product.colors?.find(c => c.value === selectedColor)
    const colorImage = colorObj?.image || product.images?.[0] || null

    try {
      if (isLoggedIn) {
        if (!cookiesReady) await new Promise(r => setTimeout(r, 1500))

        await cartService.addToCart({
          productId,
          quantity,
          sizes: selectedSizes,
          colors: selectedColors,
        })
        toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة بنجاح' : 'Product added to cart successfully')
      } else {
        addToGuestCart({
          productId,
          quantity,
          size: selectedSize || null,
          color: selectedColor || null,
          title: product.title,
          image: colorImage,
          price: product.discountedPrice || product.price,
          maxQuantity: product.quantity,
        })
        toast.success(language === 'ar' ? 'تم إضافة المنتج إلى السلة بنجاح' : 'Product added to cart successfully')
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'ar' ? 'فشل إضافة المنتج إلى السلة' : 'Failed to add product to cart')
      toast.error(msg)
    }
  }, [validateSelections, product, selectedColor, selectedSize, selectedColors, selectedSizes, productId, quantity, isLoggedIn, cookiesReady, language])

  // ── Buy Now ────────────────────────────────────────────────────────────────

  const handleBuyNow = useCallback(() => {
    if (!validateSelections()) return
    if (!product) return

    const buyNowItem = {
      productId,
      quantity,
      color: selectedColor || null,
      size: selectedSize || null,
      image: mainImage || product.images?.[0] || null,
      title: product.title,
      price: product.discountedPrice ?? product.price,
    }

    try {
      sessionStorage.setItem('buyNowItem', JSON.stringify(buyNowItem))
    } catch {
      toast.error(language === 'ar' ? 'تعذر تخزين البيانات — يُرجى إضافة المنتج للسلة' : 'Could not store data — please add to cart instead')
      return
    }

    router.push(isLoggedIn ? '/checkout?mode=buyNow' : '/guest-checkout?mode=buyNow')
  }, [validateSelections, product, productId, quantity, selectedColor, selectedSize, mainImage, isLoggedIn, language, router])

  // ── Wishlist ───────────────────────────────────────────────────────────────

  const toggleWishlist = useCallback(async () => {
    if (!isLoggedIn) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول لإضافة المنتج إلى المفضلة' : 'Please log in to add products to your favorites')
      return
    }
    try {
      await wishlistService.toggleWishlist(productId)
      setIsFavorite(p => !p)
      toast.success(!isFavorite
        ? (language === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to favorites')
        : (language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites')
      )
    } catch {
      toast.error(language === 'ar' ? 'فشل تحديث المفضلة' : 'Failed to update favorites')
    }
  }, [productId, isFavorite, language, isLoggedIn])

  // ── Ratings ────────────────────────────────────────────────────────────────

  const fetchRatings = useCallback(async () => {
    try {
      setIsLoadingReviews(true)
      const res = await ratingService.getProductRatings(productId)
      setReviews(res?.data?.data || [])
    } catch {
      toast.error(language === 'ar' ? 'فشل تحميل التقييمات' : 'Failed to load reviews')
    } finally {
      setIsLoadingReviews(false)
    }
  }, [productId, language])

  useEffect(() => { if (productId) fetchRatings() }, [productId, fetchRatings])

  useEffect(() => {
    if (!userId) { setUserRatingId(null); setRatingInput(0); setCommentInput(''); return }
    const existing = reviews.find(r => r?.user?._id === userId)
    if (existing) {
      setUserRatingId(existing._id || null)
      setRatingInput(existing.rating)
      setCommentInput(existing.comment || '')
    } else {
      setUserRatingId(null); setRatingInput(0); setCommentInput('')
    }
  }, [userId, reviews])

  const handleEditReview = useCallback((review: Review) => {
    if (!review._id) { toast.error(language === 'ar' ? 'تعذر العثور على التقييم' : 'Could not find review'); return }
    setUserRatingId(review._id)
    setRatingInput(review.rating)
    setCommentInput(review.comment || '')
    reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    toast.info(language === 'ar' ? 'يمكنك الآن تعديل تقييمك' : 'You can now edit your review')
  }, [language])

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) { toast.error(language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please log in'); return }
    if (!ratingInput) { toast.error(language === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating'); return }
    setIsSubmittingReview(true)
    try {
      const payload = { rating: ratingInput, comment: commentInput.trim() || undefined }
      if (userRatingId) {
        await ratingService.updateRating(productId, userRatingId, payload)
        toast.success(language === 'ar' ? 'تم تحديث تقييمك' : 'Review updated')
      } else {
        await ratingService.createRating(productId, payload)
        toast.success(language === 'ar' ? 'تم إضافة تقييمك' : 'Review submitted')
      }
      await fetchRatings()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'ar' ? 'فشل حفظ التقييم' : 'Failed to save review')
      toast.error(msg)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = useCallback(async (ratingId?: string) => {
    const targetId = ratingId || userRatingId
    if (!targetId) { toast.error(language === 'ar' ? 'لم يتم العثور على التقييم' : 'Review not found'); return }
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Delete this review?')) return
    setDeletingReviewId(targetId)
    try {
      await ratingService.deleteRating(productId, targetId)
      toast.success(language === 'ar' ? 'تم حذف التقييم' : 'Review deleted')
      if (targetId === userRatingId) { setRatingInput(0); setCommentInput(''); setUserRatingId(null) }
      await fetchRatings()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (language === 'ar' ? 'فشل حذف التقييم' : 'Failed to delete review')
      toast.error(msg)
    } finally {
      setDeletingReviewId(null)
    }
  }, [userRatingId, productId, language, fetchRatings])

  // ── Render guards ──────────────────────────────────────────────────────────

  if (isLoading) return <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-500 mb-4">{language === "ar" ? "لم يتم العثور على المنتج أو حدث خطأ" : "Product not found or an error occurred"}</p>
        <Button onClick={handleReload}>{language === "ar" ? "إعادة المحاولة" : "Try Again"}</Button>
      </div>
    )
  }

  // ── Derived display values ─────────────────────────────────────────────────

  const hasDiscount    = product.discountPercentage > 0
  const finalPrice     = hasDiscount ? product.discountedPrice : product.price
  const isOutOfStock   = product.quantity === 0 || product.status === 'sold'
  const selectedColorObj = product.colors?.find(c => c.value === selectedColor)

  // All thumbnails: color images first, then extra product images
  const colorThumbnails = product.colors?.filter(c => c.image) ?? []
  const productImages   = product.images ?? []

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">{language === "ar" ? "الرئيسية" : "Home"}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/products">{language === "ar" ? "المنتجات" : "Products"}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>{language === "ar" ? product.category?.name : product.category?.nameEn}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>{product.title}</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Left: Images ────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Main image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 shadow">
            {mainImage && (
              <Image src={mainImage} alt={product.title} fill className="object-cover" priority />
            )}
            {hasDiscount && (
              <div className="absolute top-3 start-3">
                <Badge variant="destructive" className="text-sm font-bold px-2 py-1">
                  -{product.discountPercentage}%
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnail strip: colour images + extra product images */}
          {(colorThumbnails.length > 0 || productImages.length > 1) && (
            <div className="flex gap-2 flex-wrap">
              {/* Color thumbnails */}
              {colorThumbnails.map((colorItem) => (
                <button
                  key={colorItem.value}
                  onClick={() => handleColorSelect(colorItem.value)}
                  title={colorItem.name}
                  className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    selectedColor === colorItem.value
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={colorItem.image!}
                    alt={colorItem.name}
                    fill
                    className="object-cover"
                  />
                  {selectedColor === colorItem.value && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}

              {/* Extra product images (that are not colour images) */}
              {productImages
                .filter(img => !colorThumbnails.some(c => c.image === img))
                .map((image, index) => (
                  <button
                    key={`pi-${index}`}
                    onClick={() => setMainImage(image)}
                    className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      mainImage === image
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ── Right: Product info ──────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Title + ratings */}
          <div>
            <h1 className="text-2xl font-bold leading-snug">{product.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={product.ratings?.average || 0} />
              <span className="text-sm text-muted-foreground">
                ({product?.ratings?.count || 0} {language === "ar" ? "تقييم" : "reviews"})
              </span>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {finalPrice.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}
              </span>
              {hasDiscount && (
                <span className="text-base text-muted-foreground line-through">
                  {product.price.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}
                </span>
              )}
            </div>
            {!isOutOfStock ? (
              <span className="text-sm text-green-600 font-medium">
                ● {language === "ar" ? "متوفر" : "In Stock"}
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">
                ● {language === "ar" ? "نفد من المخزون" : "Out of Stock"}
              </span>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

          {/* ── Color selector ─────────────────────────────────────────────── */}
          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <Label className="font-semibold">
                {language === "ar" ? "اللون" : "Color"}
                {selectedColorObj && (
                  <span className="font-normal text-muted-foreground ms-2">— {selectedColorObj.name}</span>
                )}
              </Label>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => color.available && handleColorSelect(color.value)}
                    title={color.name}
                    disabled={!color.available}
                    className={`relative h-9 w-9 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color.value
                        ? 'border-primary scale-110 shadow-md'
                        : color.available
                          ? 'border-gray-300 hover:border-gray-500'
                          : 'border-gray-200 opacity-40 cursor-not-allowed'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColor === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" style={{ color: color.value === '#FFFFFF' || color.value === '#ffffff' ? '#000' : '#fff' }} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Size selector ──────────────────────────────────────────────── */}
          {(activeSizes.length > 0 || product.sizes?.length > 0) && (
            <div className="space-y-2">
              <Label className="font-semibold">
                {language === "ar" ? "المقاس" : "Size"}
                {selectedSize && (
                  <span className="font-normal text-muted-foreground ms-2">— {selectedSize}</span>
                )}
              </Label>
              <div className="flex gap-2 flex-wrap">
                {(activeSizes.length > 0 ? activeSizes : product.sizes.map(s => ({ size: s, quantity: 99 }))).map(({ size, quantity: qty }) => {
                  const isUnavailable = qty === 0
                  const isLow        = qty > 0 && qty <= 3
                  const isSelected   = selectedSize === size

                  return (
                    <button
                      key={size}
                      onClick={() => !isUnavailable && handleSizeSelect(size)}
                      disabled={isUnavailable}
                      className={`relative px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : isUnavailable
                            ? 'border-gray-200 text-gray-400 line-through cursor-not-allowed bg-gray-50'
                            : 'border-gray-300 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {size}
                      {isLow && !isUnavailable && (
                        <span className="absolute -top-1.5 -end-1.5 h-3 w-3 rounded-full bg-orange-500 border border-white" title={`${qty} left`} />
                      )}
                      {isUnavailable && (
                        <span className="sr-only">{language === "ar" ? "غير متوفر" : "Out of stock"}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Stock info for selected size */}
              {selectedSize && (() => {
                const entry = activeSizes.find(s => s.size === selectedSize)
                if (!entry) return null
                if (entry.quantity === 0) return (
                  <p className="text-sm text-red-500">{language === "ar" ? "هذا المقاس نفد من المخزون" : "This size is out of stock"}</p>
                )
                if (entry.quantity <= 3) return (
                  <p className="text-sm text-orange-500">{language === "ar" ? `باقي ${entry.quantity} قطع فقط!` : `Only ${entry.quantity} left!`}</p>
                )
                return null
              })()}
            </div>
          )}

          {/* ── Quantity ───────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Label className="font-semibold">{language === "ar" ? "الكمية" : "Quantity"}</Label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                className="w-14 text-center border-0 h-9 rounded-none focus-visible:ring-0"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(Number(e.target.value))}
                type="number"
                min="1"
                max={maxQty}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-none"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={maxQty > 0 ? quantity >= maxQty : true}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {maxQty > 0 && maxQty <= 5 && (
              <span className="text-xs text-orange-500">{language === "ar" ? `متوفر: ${maxQty}` : `Available: ${maxQty}`}</span>
            )}
          </div>

          {/* ── CTA buttons ────────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white min-w-[140px]"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              size="lg"
            >
              <Zap className="me-2 h-4 w-4" />
              {language === "ar" ? "اشترِ الآن" : "Buy Now"}
            </Button>

            <Button
              variant="outline"
              className="flex-1 min-w-[140px]"
              onClick={addToCartHandler}
              disabled={isOutOfStock}
              size="lg"
            >
              <ShoppingCart className="me-2 h-4 w-4" />
              {language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
            </Button>

            <Button variant="outline" size="icon" className="h-11 w-11" onClick={toggleWishlist} disabled={isOutOfStock}>
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="flex flex-col items-center text-center gap-1 p-2">
              <Truck className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{language === "ar" ? "شحن سريع" : "Fast Shipping"}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{language === "ar" ? "إرجاع سهل" : "Easy Returns"}</span>
            </div>
            <div className="flex flex-col items-center text-center gap-1 p-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{language === "ar" ? "ضمان الجودة" : "Quality Guarantee"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Tabs ─────────────────────────────────────────────────────── */}
      <div className="mt-12">
        <Tabs defaultValue="description" className={language === "ar" ? "dir-rtl" : "dir-ltr"}>
          <TabsList className={`grid w-full ${product.videoUrl ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="description">{language === "ar" ? "الوصف" : "Description"}</TabsTrigger>
            <TabsTrigger value="specifications">{language === "ar" ? "المواصفات" : "Specifications"}</TabsTrigger>
            <TabsTrigger value="reviews">{language === "ar" ? "التقييمات" : "Reviews"}</TabsTrigger>
            {product.videoUrl && (
              <TabsTrigger value="video" className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {language === "ar" ? "فيديو المنتج" : "Product Video"}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="description">
            <div className="p-4 prose prose-slate max-w-none">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>

          {/* ── Video Tab ── */}
          {product.videoUrl && (
            <TabsContent value="video">
              <div className="p-4 md:p-6">
                <ProductVideoEmbed url={product.videoUrl} />
              </div>
            </TabsContent>
          )}

          <TabsContent value="specifications">
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الفئة" : "Category"}</span>
                  <span className="text-muted-foreground">{language === "ar" ? product.category?.name : product.category?.nameEn}</span>
                </div>
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الحالة" : "Status"}</span>
                  <span className="text-muted-foreground">
                    {product.status === 'available' ? (language === "ar" ? "متاح" : "Available") : (language === "ar" ? "مباع" : "Sold")}
                  </span>
                </div>
                <div className="flex border-b py-2">
                  <span className="font-medium w-1/3">{language === "ar" ? "الكمية المباعة" : "Sold"}</span>
                  <span className="text-muted-foreground">{product.sold}</span>
                </div>
                {product.colors?.length > 0 && (
                  <div className="flex border-b py-2">
                    <span className="font-medium w-1/3">{language === "ar" ? "الألوان" : "Colors"}</span>
                    <div className="flex gap-1 flex-wrap">
                      {product.colors.map(c => (
                        <span key={c.value} className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span className="inline-block h-3 w-3 rounded-full border" style={{ backgroundColor: c.value }} />
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="p-4 space-y-8">
              <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
                <Card className="bg-muted/40">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{language === "ar" ? "متوسط التقييم" : "Average rating"}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold">{(product.ratings?.average || 0).toFixed(1)}</span>
                        <RatingStars rating={product.ratings?.average || 0} size={20} showEmptyStars className="text-yellow-400" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === "ar" ? `${product.ratings?.count || 0} تقييم` : `${product.ratings?.count || 0} reviews`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <form ref={reviewFormRef} className="space-y-4" onSubmit={handleSubmitReview}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">
                          {userRatingId
                            ? (language === "ar" ? "تعديل تقييمك" : "Update your review")
                            : (language === "ar" ? "أضف تقييمك" : "Add your review")}
                        </h3>
                        {userRatingId && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteReview()}
                            disabled={!!deletingReviewId} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            {deletingReviewId
                              ? (language === "ar" ? "جاري الحذف..." : "Deleting...")
                              : (language === "ar" ? "حذف التقييم" : "Delete review")}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>{language === "ar" ? "تقييمك" : "Your rating"}</Label>
                        <RatingStars rating={ratingInput} interactive onChange={(v: number) => setRatingInput(v)} size={32} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review-comment">{language === "ar" ? "تعليقك" : "Your comment"}</Label>
                        <Textarea
                          id="review-comment"
                          placeholder={language === "ar" ? "شارك تجربتك" : "Share your experience"}
                          value={commentInput}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentInput(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button type="submit" disabled={isSubmittingReview || isLoadingReviews} className="w-full">
                        {isSubmittingReview
                          ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                          : userRatingId
                            ? (language === "ar" ? "تحديث التقييم" : "Update review")
                            : (language === "ar" ? "إرسال التقييم" : "Submit review")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{language === "ar" ? "آراء العملاء" : "Customer reviews"}</h3>
                {isLoadingReviews ? (
                  <p className="text-muted-foreground">{language === "ar" ? "جاري تحميل التقييمات..." : "Loading reviews..."}</p>
                ) : reviews.length === 0 ? (
                  <p className="text-muted-foreground">{language === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => {
                      const ratingId = review?._id
                      const isUserReview = userId && review?.user?._id === userId
                      const isDeletingThis = deletingReviewId === ratingId
                      return (
                        <Card key={ratingId} className="border">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{review.user?.fullName || (language === 'ar' ? 'مستخدم' : 'Customer')}</p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isUserReview && (
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditReview(review)} className="text-blue-600 hover:text-blue-800">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                      onClick={() => handleDeleteReview(ratingId)} disabled={isDeletingThis}>
                                      {isDeletingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                )}
                                <RatingStars rating={review.rating} size={20} showEmptyStars readOnly />
                              </div>
                            </div>
                            {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Related Products ──────────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">{language === "ar" ? "منتجات ذات صلة" : "Related Products"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <Card key={rp._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/products/${rp._id}`} className="block">
                    <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                      <Image
                        src={rp.images?.[0] || '/placeholder.svg'}
                        alt={rp.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{rp.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{rp.discountedPrice.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</span>
                          {rp.discountPercentage > 0 && (
                            <span className="text-xs text-muted-foreground line-through">{rp.price.toLocaleString()}</span>
                          )}
                        </div>
                        {rp.discountPercentage > 0 && (
                          <Badge variant="destructive" className="text-xs">{rp.discountPercentage}%</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetail
