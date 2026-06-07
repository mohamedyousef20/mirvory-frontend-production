"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Trash,
  ShoppingCart,
  Minus,
  Plus,
  CreditCard,
  Truck,
  ShieldCheck,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Package,
  Gift,
  Star,
  ChevronLeft,
  Sparkles
} from "lucide-react"
import { cartService, couponService } from "@/lib/api"
import { MirvoryPageLoader } from "./MirvoryLoader"

interface CartItem {
  _id: string
  productId: string
  name: string
  nameEn: string
  image: string
  quantity: number
  price: number
  oldPrice?: number
  color?: string
  colorEn?: string
  size?: string
  maxQuantity: number
}

interface CouponResponse {
  valid: boolean
  coupon: {
    code: string
    discountType: string
    discountValue: number
    minCartValue: number
    maxDiscount?: number
  }
  originalTotal: number
  discountedTotal: number
  discountAmount: number
  message: string
}

interface CartData {
  _id: string
  user: string
  appliedCoupon?: {
    code: string
    discountAmount: number
    discountedTotal: number
    originalTotal: number
    appliedAt: string
  }
  items: CartItem[]
  total: number
  itemCount: number
}

export function CartPage() {
  const { language, t } = useLanguage()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponData, setCouponData] = useState<CouponResponse | null>(null)
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [freeShippingProgress, setFreeShippingProgress] = useState(0)

  // Ref for debouncing
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const mapCartItemsFromResponse = (cart: any): CartItem[] => {
    try {
      const items = Array.isArray(cart?.items) ? cart.items : [];

      return items.map((item: any) => {
        const product = item.product || {};

        return {
          _id: item._id || '',
          productId: product._id || '',
          name: product.title || '',
          nameEn: product.titleEn || product.title || '',
          image: Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "/placeholder.svg",
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          price: typeof item.price === 'number'
            ? item.price
            : (typeof product.price === 'number' ? product.price : 0),
          oldPrice: undefined,
          color: Array.isArray(item.colors) && item.colors.length > 0
            ? item.colors[0]
            : undefined,
          colorEn: Array.isArray(item.colors) && item.colors.length > 0
            ? item.colors[0]
            : undefined,
          size: Array.isArray(item.sizes) && item.sizes.length > 0
            ? item.sizes[0]
            : undefined,
          maxQuantity: product.quantity 
        };
      });
    } catch (error) {
      console.error('Error mapping cart items:', error);
      return [];
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await cartService.getCart();

      if (response.data) {
        const items = mapCartItemsFromResponse(response.data)
        setCartItems(items)
        setCartData(response.data);

        if (response.data.appliedCoupon && response.data.appliedCoupon.code) {
          setCouponApplied(true);
          setCouponCode(response.data.appliedCoupon.code);

          const couponData: CouponResponse = {
            valid: true,
            coupon: {
              code: response.data.appliedCoupon.code,
              discountType: 'fixed',
              discountValue: response.data.appliedCoupon.discountAmount,
              minCartValue: 0,
              maxDiscount: undefined
            },
            originalTotal: response.data.appliedCoupon.originalTotal,
            discountedTotal: response.data.appliedCoupon.discountedTotal,
            discountAmount: response.data.appliedCoupon.discountAmount,
            message: "Coupon applied to cart"
          };
          setCouponData(couponData);
        } else {
          setCouponApplied(false);
          setCouponCode("");
          setCouponData(null);
        }
      } else {
        setCartItems([]);
        setCartData(null);
        setCouponApplied(false);
        setCouponCode("");
        setCouponData(null);
      }
    } catch (err: any) {
      console.error('Cart fetch error:', err)
      if (err.response?.status === 401) {
        setError(language === "ar" ? "يرجى تسجيل الدخول لعرض السلة" : 'Please login to view your cart')
      } else if (err.response?.status === 404) {
        setCartItems([]);
        setCartData(null);
        setCouponApplied(false);
        setCouponCode("");
        setCouponData(null);
        setError(null);
      } else {
        setError(err.response?.data?.message || (language === "ar" ? 'فشل في تحميل السلة' : 'Failed to load cart'))
      }
      setCartItems([]);
      setCartData(null);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const progress = Math.min(100, (subtotal / 500) * 100)
    setFreeShippingProgress(progress)
  }, [cartItems])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === "ar" ? "يرجى إدخال كود الخصم" : "Please enter a coupon code")
      return
    }

    try {
      setCouponLoading(true)
      setCouponError(null)

      const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
      const applyResponse = await couponService.validateCoupon(couponCode.trim(), subtotal)

      if (applyResponse.status === 200) {
        setCouponApplied(true);
        setCouponData(applyResponse.data);
        setCouponError(null);
        await fetchCart();
      } else {
        setCouponApplied(false);
        setCouponData(null);
        setCouponError(applyResponse.data.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      console.error('Coupon application error:', err);
      setCouponApplied(false);
      setCouponData(null);
      setCouponError(
        err.response?.data?.message ||
        (language === "ar" ? "فشل في تطبيق كود الخصم" : "Failed to apply coupon code")
      );
    } finally {
      setCouponLoading(false);
    }
  }

  const handleRemoveCoupon = async () => {
    try {
      setCouponLoading(true)
      const response = await couponService.removeCouponFromCart()

      if (response.status === 200) {
        setCouponApplied(false)
        setCouponCode("")
        setCouponData(null)
        setCouponError(null)
        await fetchCart()
      } else {
        throw new Error(response.data?.message || 'Failed to remove coupon')
      }
    } catch (err: any) {
      console.error('Coupon removal error:', err)
      setCouponError(
        err.response?.data?.message || err.message ||
        (language === "ar" ? "فشل في إزالة كود الخصم" : "Failed to remove coupon code")
      )
    } finally {
      setCouponLoading(false)
    }
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(item => item._id === itemId);
    if (!item) return;

    if (newQuantity > item.maxQuantity) {
      setError(
        language === "ar"
          ? `الكمية المتاحة فقط ${item.maxQuantity} قطعة`
          : `Only ${item.maxQuantity} items available in stock`
      );
      return;
    }

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    const previousItems = [...cartItems];
    setCartItems(prev => prev.map(item =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    ));

    setUpdatingItemId(itemId);

    try {
      const response = await cartService.updateCartItem(itemId, newQuantity);
      if (response.status === 200) {
        const updatedCart = response.data?.data || response.data;
        const updatedItems = mapCartItemsFromResponse(updatedCart);
        setCartItems(updatedItems);
        setCartData(updatedCart);

        if (updatedCart.appliedCoupon && updatedCart.appliedCoupon.code) {
          setCouponApplied(true);
          setCouponCode(updatedCart.appliedCoupon.code);
          setCouponData({
            valid: true,
            coupon: {
              code: updatedCart.appliedCoupon.code,
              discountType: 'fixed',
              discountValue: updatedCart.appliedCoupon.discountAmount,
              minCartValue: 0,
              maxDiscount: undefined
            },
            originalTotal: updatedCart.appliedCoupon.originalTotal,
            discountedTotal: updatedCart.appliedCoupon.discountedTotal,
            discountAmount: updatedCart.appliedCoupon.discountAmount,
            message: "Coupon applied"
          });
        } else {
          if (couponApplied) {
            setCouponApplied(false);
            setCouponCode("");
            setCouponData(null);
          }
        }
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      setCartItems(previousItems);
      if (err.name === 'AbortError') {
        setError(language === "ar" ? "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى" : "Request timeout, please try again");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          (language === "ar" ? "فشل تحديث الكمية" : "Failed to update quantity")
        );
      }
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = [...cartItems]
    setCartItems(cartItems.filter(item => item._id !== itemId))

    try {
      setLoading(true)
      await cartService.removeFromCart(itemId)
      await fetchCart();
    } catch (err: any) {
      setCartItems(previousItems)
      setError(err.message || (language === "ar" ? 'فشل في إزالة المنتج' : 'Failed to remove item'))
    } finally {
      setLoading(false)
    }
  }

  const handleClearCart = async () => {
    try {
      setLoading(true)
      await cartService.clearCart()
      setCartItems([])
      setCartData(null)
      setCouponApplied(false)
      setCouponCode("")
      setCouponData(null)
      setCouponError(null)
    } catch (err: any) {
      setError(err.message || (language === "ar" ? 'فشل في إفراغ السلة' : 'Failed to clear cart'))
    } finally {
      setLoading(false)
    }
  }

  const subtotal = (cartItems || []).reduce((sum: number, item: CartItem) => {
    if (!item || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      return sum;
    }
    return sum + (item.price * item.quantity);
  }, 0)

  const shipping = subtotal > 500 ? 0 : 30
  const total = cartData?.total !== undefined
    ? cartData.total + shipping
    : subtotal + shipping;

  return (
    <>
      {/* 1. GLOBAL & FONTS INJECTION */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>

      <div dir="rtl" className="min-h-screen bg-[#f4f6fb]">
        {/* Modern Interactive Header Block */}
        <div className="bg-[#1a4fba] text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1.5">{t("cart")}</h1>
                <p className="text-blue-100/80 text-xs md:text-sm font-medium">
                  {language === "ar"
                    ? `${cartItems.length} منتج متوفر حالياً في سلة تسوقك`
                    : `${cartItems.length} items currently in your cart`}
                </p>
              </div>
              <div className="relative p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <ShoppingCart className="h-7 w-7 md:h-8 md:w-8 text-white" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-[11px] shadow-sm">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout Block */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* 7. Free Shipping Banner / Progress Block */}
          {cartItems.length > 0 && shipping > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">
                    {language === "ar" ? "احصل على شحن مجاني للمشتريات فوق 500 ج.م!" : "Get Free Shipping on orders over 500 EGP!"}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700">
                  {Math.max(0, 500 - subtotal).toFixed(2)} {language === "ar" ? "ج.م متبقية للشحن المجاني" : "EGP to go"}
                </span>
              </div>
              <Progress
                value={freeShippingProgress}
                className="h-2 bg-amber-100/60 [&_*]:bg-[#1a4fba] transition-all"
              />
            </div>
          )}

          {loading && cartItems.length === 0 ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <MirvoryPageLoader text={language === "ar" ? "جاري مزامنة السلة..." : "Syncing cart..."} />
            </div>
          ) : error ? (
            /* 7. Error Alert State */
            <div className="max-w-md mx-auto text-center py-12 bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
              <AlertCircle className="h-12 w-12 text-rose-600 mx-auto mb-3" />
              <p className="text-rose-700 text-sm font-semibold mb-5">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-200"
              >
                {(t as any)("retry")}
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart Corporate UI */
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-blue-50 rounded-full">
                <ShoppingCart className="h-10 w-10 text-[#1a4fba]" />
              </div>
              <h2 className="text-lg font-bold mb-1 text-slate-800">{t("emptyCart")}</h2>
              <p className="text-slate-400 mb-6 text-xs leading-relaxed">
                {language === "ar"
                  ? "ابدأ رحلة تسوق جديدة واكتشف منتجاتنا الحصرية والمميزة."
                  : "Start a new shopping journey and discover our exclusive premium products."}
              </p>
              <Button
                asChild
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-200"
              >
                <Link href="/products">
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  {t("continueShopping")}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* 6. DATA PRESENTATION & RESPONSIVENESS: Left Column (Items Container) */}
              <div className="lg:col-span-2 space-y-4">

                {/* Header controls for items list */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-slate-800">
                    {language === "ar" ? "المنتجات المختارة" : "Selected Items"}
                  </h2>

                  {/* 8. MODAL / ALERT DIALOG FOR BULK CLEANUP */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        {language === "ar" ? "إفراغ السلة بالكامل" : "Clear Entire Cart"}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 text-right">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-slate-800 font-bold text-base">
                            {language === "ar" ? "هل أنت متأكد من تفريغ السلة؟" : "Confirm Cart Clearance"}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-500 text-xs leading-relaxed mt-1">
                            {language === "ar"
                              ? "سيتم إزالة جميع المنتجات والمرفقات المخزنة داخل سلة تسوقك حالياً بشكل نهائي."
                              : "This action will permanently remove all products and applied updates from your active cart."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex items-center justify-end gap-2.5 pt-2">
                          <AlertDialogCancel className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition">
                            {language === "ar" ? "إلغاء التراجع" : "Cancel"}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearCart}
                            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition shadow-sm"
                          >
                            {language === "ar" ? "نعم، تأكيد المسح" : "Yes, clear data"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Stacked list cards layout */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    /* 2. CONTAINERS & CARDS implementation */
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                        {/* Image wrapper block */}
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 mx-auto sm:mx-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={language === "ar" ? item.name : item.nameEn}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* 7. Semantic Badge Mapping */}
                          {item.quantity >= item.maxQuantity && (
                            <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-center py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                              {language === "ar" ? "أقصى كمية" : "Max Limit"}
                            </span>
                          )}
                        </div>

                        {/* Middle detailed metadata columns */}
                        <div className="flex-1 min-w-0 w-full text-center sm:text-right">
                          <Link href={`/products/${item.productId}`} className="inline-block max-w-full">
                            <h3 className="font-bold text-slate-800 hover:text-[#1a4fba] transition-colors text-sm md:text-base truncate">
                              {language === "ar" ? item.name : item.nameEn}
                            </h3>
                          </Link>

                          {/* Dynamic Attribute badges rendering */}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5">
                            {item.color && (
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <span className="text-[11px] text-slate-400">
                                  {language === "ar" ? "اللون:" : "Color:"}
                                </span>
                                <div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: item.color }} />
                                <span className="text-[11px] font-medium text-slate-600">{language === "ar" ? item.color : item.colorEn}</span>
                              </div>
                            )}
                            {item.size && (
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <span className="text-[11px] text-slate-400">
                                  {language === "ar" ? "المقاس:" : "Size:"}
                                </span>
                                <span className="text-[11px] font-bold text-slate-700">{item.size}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-400">
                                {language === "ar" ? "سعر القطعة:" : "Unit Price:"}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-600">
                                {item.price.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-center sm:justify-start gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${item.maxQuantity > 3 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {language === "ar" ? `متوفر ${item.maxQuantity} قطعة بالمخزن` : `${item.maxQuantity} items left`}
                          </p>
                        </div>

                        {/* Interactive adjustments row mapping */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-slate-50 sm:border-0 pt-3 sm:pt-0">

                          {/* 4. FORM ELEMENTS/INPUTS Structure for Quantity */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItemId === item._id}
                              className="p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <div className="w-10 text-center text-xs font-bold text-slate-800">
                              {updatingItemId === item._id ? (
                                <div className="w-3.5 h-3.5 border-2 border-[#1a4fba] border-t-transparent rounded-full animate-spin mx-auto" />
                              ) : (
                                item.quantity
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity || updatingItemId === item._id}
                              className="p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Calculated aggregate element rendering */}
                          <div className="text-left">
                            <p className="text-sm md:text-base font-bold text-[#1a4fba]">
                              {(item.price * item.quantity).toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                            </p>
                          </div>

                          {/* Trash button implementation */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title={language === "ar" ? "إزالة المنتج" : "Remove item"}
                          >
                            <Trash className="h-4 w-4" />
                          </button>

                        </div>

                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column Layout: Coupon Actions & Financial Invoice Overview */}
              <div className="space-y-4">

                {/* 4. COUPON FORM INPUTS CARD */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-[#1a4fba]" />
                    {language === "ar" ? "هل لديك كود خصم؟" : "Have a promotional coupon?"}
                  </h3>

                  <div className="flex gap-2 relative">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder={language === "ar" ? "أدخل رمز الكوبون..." : "Enter coupon code..."}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied || couponLoading}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1a4fba]/30 focus:border-[#1a4fba] transition"
                      />
                    </div>

                    {couponApplied ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition border border-rose-100"
                      >
                        {language === "ar" ? "حذف" : "Remove"}
                      </button>
                    ) : (
                      /* 5. Primary button rule applied */
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-[#1a4fba] text-white text-xs font-bold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-100 disabled:opacity-40"
                      >
                        {couponLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          language === "ar" ? "تطبيق" : "Apply"
                        )}
                      </button>
                    )}
                  </div>

                  {/* 7. Status feedback rendering */}
                  {couponError && (
                    <div className="bg-rose-50 text-rose-700 border border-rose-100 p-2.5 rounded-xl text-xs flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponApplied && (
                    <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-2.5 rounded-xl text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {language === "ar" ? "تم تفعيل القسيمة بنجاح" : "Coupon activated!"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. PREMIUM FINANCIAL INVOICE CARD */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                    {language === "ar" ? "ملخص وتكلفة الفاتورة" : "Financial Invoice Summary"}
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>{language === "ar" ? "المجموع الفرعي المنتجات" : "Products Subtotal"}</span>
                      <span className="font-semibold text-slate-700">
                        {subtotal.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                      </span>
                    </div>

                    {couponApplied && couponData && (
                      <div className="flex justify-between text-emerald-700 bg-emerald-50/60 border border-emerald-100 px-3 py-2 rounded-xl">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-emerald-600" />
                          {language === "ar" ? "قيمة خصم الكوبون" : "Coupon Discount"} ({couponCode})
                        </span>
                        <span className="font-bold">
                          -{couponData.discountAmount.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500 items-center">
                      <span>{language === "ar" ? "تكاليف ومصاريف الشحن" : "Shipping Logistics Fee"}</span>
                      <span>
                        {shipping === 0 ? (
                          /* 7. Success State badge mapping */
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                            {language === "ar" ? "شحن مجاني" : "Free Shipping"}
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-700">
                            {shipping.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                          </span>
                        )}
                      </span>
                    </div>

                    <Separator className="bg-slate-100/80 my-1" />

                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-1.5">
                      <span>{language === "ar" ? "المجموع الإجمالي الكلي" : "Grand Total"}</span>
                      <span className="text-base text-[#1a4fba] font-extrabold">
                        {total.toFixed(2)} {language === "ar" ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  </div>

                  {/* 5. Checkout Call-To-Action Button Row */}
                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1a4fba] text-white text-sm font-semibold rounded-xl hover:bg-[#1640a0] transition shadow-md shadow-blue-200"
                    >
                      <Link href="/checkout" className="w-full flex items-center justify-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t("checkout")}
                      </Link>
                    </Button>

                    <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed">
                      {language === "ar"
                        ? "بإتمام خطوة الشراء، أنت توافق مسبقاً على شروط الاستخدام وسياسة الخصوصية الخاصة بنا."
                        : "By checking out, you agree to our corporate Terms of Use & standard Privacy Policy."}
                    </p>
                  </div>
                </div>

                {/* Additional Regulatory Compliance Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <Package className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-amber-900 text-xs">
                      {language === "ar" ? "إشعار الفحص والتحقق الجمركي المسبق" : "Stock Verification Protocol"}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {language === "ar"
                      ? "سيتم مراجعة وتأكيد توفر كميات المخزون والمدفوعات الإلكترونية بدقة من قبل الدعم قبل شحن الطرد."
                      : "Stock verification and final payment authorization are compiled comprehensively prior to package dispatch."}
                  </p>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}