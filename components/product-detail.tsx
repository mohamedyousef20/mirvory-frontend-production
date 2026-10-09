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
  Play,
} from "lucide-react"
import { toast } from "sonner"
import { cartService, productService, ratingService, wishlistService } from "@/lib/api"
import { addToGuestCart } from "@/lib/guestCart"
import RatingStars from "@/components/Rating/RatingStars"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthProvider"
import { useRouter } from "next/navigation"

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  try {
    const u = new URL(trimmed)
    const host = u.hostname.replace(/^(www\.|m\.)/, '')

    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('?')[0].split('/')[0]
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`

      const embedMatch = u.pathname.match(/\/embed\/([^/?]+)/)
      if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`

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
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-red-500 shadow-md bg-slate-900"
          style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            title="فيديو المنتج"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  const looksLikeUrl = /^https?:\/\//i.test(url.trim())
  if (looksLikeUrl) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <Play className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition">
          مشاهدة الفيديو على يوتيوب ↗
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

interface ColorSize {
  size: string
  quantity: number
}

interface ProductColor {
  name: string
  value: string
  image?: string | null
  available: boolean
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
  sizes: string[]
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
  videoUrl?: string
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

const ProductDetail = ({ productId }: { productId: string }) => {
  const { language } = useLanguage()
  const { user, cookiesReady } = useAuth()
  const isLoggedIn = Boolean(user)
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mainImage, setMainImage] = useState('')

  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([''])
  const [selectedColors, setSelectedColors] = useState<string[]>([''])

  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [userRatingId, setUserRatingId] = useState<string | null>(null)
  const [ratingInput, setRatingInput] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)
  const userId = user?._id || null
  const reviewFormRef = useRef<HTMLFormElement | null>(null)

  const getSizesForColor = useCallback(
    (colorValue: string): ColorSize[] => {
      if (!product) return []
      const colorObj = product.colors?.find(c => c.value === colorValue)
      if (colorObj?.sizes && colorObj.sizes.length > 0) return colorObj.sizes
      return (product.sizes || []).map(s => ({ size: s, quantity: 99 }))
    },
    [product]
  )

  const activeSizes: ColorSize[] = useMemo(
    () => (selectedColor ? getSizesForColor(selectedColor) : []),
    [selectedColor, getSizesForColor]
  )

  const maxQty: number = useMemo(() => {
    if (selectedSize) {
      const entry = activeSizes.find(s => s.size === selectedSize)
      if (entry) return entry.quantity
    }
    return product?.quantity ?? 0
  }, [selectedSize, activeSizes, product?.quantity])

  const handleReload = useCallback(() => {
    setIsLoading(true)
    setProduct(null)
    setError(null)
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await productService.getProductById(productId)
        if (response.data && response.data.product) {
          const pd = response.data.product as Product
          setProduct(pd)

          const firstColor = pd.colors?.find(c => c.available) ?? pd.colors?.[0]
          const initImage = firstColor?.image || pd.images?.[0] || ''
          setMainImage(initImage)

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

  const handleSizeSelect = useCallback((sizeValue: string) => {
    setSelectedSize(sizeValue)
    setSelectedSizes([sizeValue])
    setQuantity(1)
  }, [])

  const handleQuantityChange = useCallback((value: number) => {
    const next = Math.max(1, maxQty > 0 ? Math.min(value, maxQty) : 1)
    setQuantity(next)
  }, [maxQty])

  const validateSelections = useCallback((): boolean => {
    if (!product) return false

    const hasColors = product.colors?.length > 0
    const hasSizes = product.sizes?.length > 0 || activeSizes.length > 0

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

  const addToCartHandler = useCallback(async () => {
    if (!validateSelections()) return
    if (!product) return

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

  const hasDiscount = product.discountPercentage > 0
  const finalPrice = hasDiscount ? product.discountedPrice : product.price
  const isOutOfStock = product.quantity === 0 || product.status === 'sold'
  const selectedColorObj = product.colors?.find(c => c.value === selectedColor)

  const colorThumbnails = product.colors?.filter(c => c.image) ?? []
  const productImages = product.images ?? []

  const scrollToVideoSection = () => {
    const videoTabEl = document.getElementById("product-video-section")
    if (videoTabEl) {
      videoTabEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={language === "ar" ? "rtl" : "ltr"}>
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
        {/* ── Left Side: Images & Small Video Button ─────────────────────── */}
        <div className="space-y-4">
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

          {/* 🌟 زر فيديو المنتج مصغر وأنيق في الجانب الأيسر تحت الصور */}
          {product.videoUrl && (
            <button
              onClick={scrollToVideoSection}
              className="w-full flex items-center justify-between p-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-700 transition shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div className="text-start">
                  <span className="block text-xs font-bold leading-tight">
                    {language === "ar" ? "فيديو معاينة المنتج" : "Watch Product Video"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {language === "ar" ? "انقر للمشاهدة السريعة" : "Click to view"}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-red-600 underline">
                {language === "ar" ? "عرض" : "Play"}
              </span>
            </button>
          )}

          {(colorThumbnails.length > 0 || productImages.length > 1) && (
            <div className="flex gap-2 flex-wrap">
              {colorThumbnails.map((colorItem) => (
                <button
                  key={colorItem.value}
                  onClick={() => handleColorSelect(colorItem.value)}
                  title={colorItem.name}
                  className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${selectedColor === colorItem.value
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-transparent hover:border-gray-300'
                    }`}
                >
                  <Image src={colorItem.image!} alt={colorItem.name} fill className="object-cover" />
                  {selectedColor === colorItem.value && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              ))}

              {productImages
                .filter(img => !colorThumbnails.some(c => c.image === img))
                .map((image, index) => (
                  <button
                    key={`pi-${index}`}
                    onClick={() => setMainImage(image)}
                    className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === image
                      ? 'border-primary shadow-lg scale-105'
                      : 'border-transparent hover:border-gray-300'
                      }`}
                  >
                    <Image src={image} alt={`${product.title} ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* ── Right Side: Product info ─────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold leading-snug">{product.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <RatingStars rating={product.ratings?.average || 0} />
              <span className="text-sm text-muted-foreground">
                ({product?.ratings?.count || 0} {language === "ar" ? "تقييم" : "reviews"})
              </span>
            </div>
          </div>

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
              <span className="text-sm text-green-600 font-medium">● {language === "ar" ? "متوفر" : "In Stock"}</span>
            ) : (
              <span className="text-sm text-red-500 font-medium">● {language === "ar" ? "نفد من المخزون" : "Out of Stock"}</span>
            )}
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>

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
                    className={`relative h-9 w-9 rounded-full border-2 transition-all duration-200 ${selectedColor === color.value
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
                  const isLow = qty > 0 && qty <= 3
                  const isSelected = selectedSize === size

                  return (
                    <button
                      key={size}
                      onClick={() => !isUnavailable && handleSizeSelect(size)}
                      disabled={isUnavailable}
                      className={`relative px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${isSelected
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
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Label className="font-semibold">{language === "ar" ? "الكمية" : "Quantity"}</Label>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>
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
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" onClick={() => handleQuantityChange(quantity + 1)} disabled={maxQty > 0 ? quantity >= maxQty : true}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

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

      <div className="mt-12" id="product-video-section">
        <Tabs defaultValue={product.videoUrl ? "video" : "description"} className={language === "ar" ? "dir-rtl" : "dir-ltr"}>
          <TabsList className={`grid w-full ${product.videoUrl ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="description">{language === "ar" ? "الوصف" : "Description"}</TabsTrigger>
            <TabsTrigger value="specifications">{language === "ar" ? "المواصفات" : "Specifications"}</TabsTrigger>
            <TabsTrigger value="reviews">{language === "ar" ? "التقييمات" : "Reviews"}</TabsTrigger>
            {product.videoUrl && (
              <TabsTrigger value="video" className="flex items-center gap-1.5 text-red-600 font-bold data-[state=active]:bg-red-50">
                <Play className="w-4 h-4 fill-red-500 text-red-500" />
                {language === "ar" ? "فيديو المنتج" : "Product Video"}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="description">
            <div className="p-4 prose prose-slate max-w-none">
              <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>

          {product.videoUrl && (
            <TabsContent value="video">
              <div className="p-4 md:p-6 bg-red-50/40 rounded-2xl border border-red-100">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-500 fill-red-500" />
                    {language === "ar" ? "عرض فيديو المنتج التفصيلي" : "Detailed Product Video"}
                  </h3>
                  <ProductVideoEmbed url={product.videoUrl} />
                </div>
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
                            {deletingReviewId ? (language === "ar" ? "جاري الحذف..." : "Deleting...") : (language === "ar" ? "حذف التقييم" : "Delete review")}
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
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">{language === "ar" ? "منتجات ذات صلة" : "Related Products"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <Card key={rp._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <Link href={`/products/${rp._id}`} className="block">
                    <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                      <Image src={rp.images?.[0] || '/placeholder.svg'} alt={rp.title} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{rp.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{rp.discountedPrice.toLocaleString()} {language === "ar" ? "ج.م" : "EGP"}</span>
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