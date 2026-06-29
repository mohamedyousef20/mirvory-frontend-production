"use client"

/**
 * GuestCartPage
 * Shown on /cart when the user is NOT authenticated.
 * Items are stored in localStorage via lib/guestCart.ts.
 * On mount it calls the backend to validate prices / stock.
 */

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Trash,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  AlertCircle,
  Package,
  ChevronLeft,
  UserPlus,
  LogIn,
  ShoppingBag,
} from "lucide-react"
import { toast } from "sonner"
import { guestCartService } from "@/lib/api"
import {
  getGuestCart,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  mergeValidatedItems,
  type GuestCartItem,
} from "@/lib/guestCart"

export function GuestCartPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const isAr = language === "ar"

  const [items, setItems] = useState<GuestCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)

  // ── Load from localStorage, then validate against backend ────────────────
  const loadAndValidate = useCallback(async () => {
    const local = getGuestCart()
    setItems(local)      // show immediately
    setLoading(false)

    if (local.length === 0) return

    try {
      setValidating(true)
      const res = await guestCartService.validateCart(
        local.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size ?? null,
          color: i.color ?? null,
        }))
      )

      if (res.data?.items) {
        const enriched: GuestCartItem[] = res.data.items.map(
          (vi: any, idx: number) => ({
            ...local[idx],
            title: vi.title || local[idx].title,
            titleEn: vi.titleEn || local[idx].titleEn,
            image: vi.image || local[idx].image,
            price: vi.price ?? local[idx].price,
            maxQuantity: vi.maxQuantity ?? local[idx].maxQuantity,
            available: vi.available ?? true,
          })
        )
        mergeValidatedItems(enriched)
        setItems(enriched)
      }
    } catch {
      // Silently fall back to cached data
    } finally {
      setValidating(false)
    }
  }, [])

  useEffect(() => {
    loadAndValidate()

    const sync = () => setItems([...getGuestCart()])
    window.addEventListener("guest-cart-updated", sync)
    return () => window.removeEventListener("guest-cart-updated", sync)
  }, [loadAndValidate])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleQtyChange = (item: GuestCartItem, delta: number) => {
    const next = item.quantity + delta
    if (next < 1) return
    if (item.maxQuantity != null && next > item.maxQuantity) {
      toast.error(
        isAr
          ? `الكمية المتاحة ${item.maxQuantity} قطعة فقط`
          : `Only ${item.maxQuantity} in stock`
      )
      return
    }
    const updated = updateGuestCartItem(item.productId, next, item.size, item.color)
    setItems([...updated])
  }

  const handleRemove = (item: GuestCartItem) => {
    const updated = removeGuestCartItem(item.productId, item.size, item.color)
    setItems([...updated])
    toast.success(isAr ? "تم حذف المنتج" : "Item removed")
  }

  const handleClear = () => {
    clearGuestCart()
    setItems([])
    toast.success(isAr ? "تم إفراغ السلة" : "Cart cleared")
  }

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  )
  const shipping = subtotal > 500 ? 0 : 30
  const total = subtotal + shipping
  const freeShippingProgress = Math.min(100, (subtotal / 500) * 100)

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1a4fba] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap'); * { font-family: 'Cairo', sans-serif !important; }`}</style>

      <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-[#f4f6fb]">

        {/* Header */}
        <div className="bg-[#1a4fba] text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {isAr ? "سلة التسوق" : "Shopping Cart"}
              </h1>
              <p className="text-blue-100/80 text-xs md:text-sm font-medium">
                {isAr
                  ? `${items.length} منتج — وضع الزائر`
                  : `${items.length} item(s) — Guest`}
              </p>
            </div>
            <div className="relative p-3 bg-white/10 rounded-2xl">
              <ShoppingCart className="h-7 w-7 text-white" />
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-[11px]">
                  {items.length}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">

          {/* Guest banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-right">
              <p className="text-amber-800 text-sm font-semibold">
                {isAr
                  ? "أنت تتسوق كزائر — السلة محفوظة في متصفحك"
                  : "You're shopping as a guest — cart is saved locally"}
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                {isAr
                  ? "سجّل الدخول للاحتفاظ بسلتك والوصول لمزايا إضافية"
                  : "Sign in to keep your cart and unlock more features"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
              >
                <Link href="/auth/login" className="flex items-center gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  {isAr ? "تسجيل الدخول" : "Sign In"}
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-[#1a4fba] text-white hover:bg-[#1640a0]"
              >
                <Link href="/auth/register" className="flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  {isAr ? "إنشاء حساب" : "Register"}
                </Link>
              </Button>
            </div>
          </div>

          {/* Free shipping progress */}
          {items.length > 0 && shipping > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">
                    {isAr
                      ? "احصل على شحن مجاني للمشتريات فوق 500 ج.م!"
                      : "Free shipping on orders over 500 EGP!"}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700">
                  {Math.max(0, 500 - subtotal).toFixed(2)}{" "}
                  {isAr ? "ج.م متبقية" : "EGP to go"}
                </span>
              </div>
              <Progress
                value={freeShippingProgress}
                className="h-2 bg-amber-100/60 [&_*]:bg-[#1a4fba] transition-all"
              />
            </div>
          )}

          {/* Validation notice */}
          {validating && (
            <p className="text-center text-xs text-slate-400">
              {isAr
                ? "جاري التحقق من الأسعار والمخزون..."
                : "Verifying prices and availability..."}
            </p>
          )}

          {/* Empty */}
          {items.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="w-20 h-20 mx-auto mb-5 flex items-center justify-center bg-blue-50 rounded-full">
                <ShoppingCart className="h-10 w-10 text-[#1a4fba]" />
              </div>
              <h2 className="text-lg font-bold mb-1 text-slate-800">
                {isAr ? "السلة فارغة" : "Your cart is empty"}
              </h2>
              <p className="text-slate-400 mb-6 text-xs leading-relaxed">
                {isAr
                  ? "ابدأ التسوق واكتشف منتجاتنا."
                  : "Start shopping and discover our products."}
              </p>
              <Button
                asChild
                className="bg-[#1a4fba] text-white hover:bg-[#1640a0] rounded-xl px-6 py-2.5 text-sm font-semibold shadow-md"
              >
                <Link href="/products">
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                  {isAr ? "تصفح المنتجات" : "Browse Products"}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-slate-800">
                    {isAr ? "المنتجات المختارة" : "Selected Items"}
                  </h2>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                  >
                    <Trash className="h-3.5 w-3.5" />
                    {isAr ? "إفراغ السلة" : "Clear Cart"}
                  </button>
                </div>

                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                      className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all group ${
                        item.available === false
                          ? "border-rose-200 bg-rose-50"
                          : "border-slate-100"
                      }`}
                    >
                      {item.available === false && (
                        <div className="flex items-center gap-1.5 mb-3 text-rose-600 text-xs font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {isAr
                            ? "هذا المنتج غير متاح حاليًا"
                            : "This item is currently unavailable"}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        {/* Image */}
                        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 mx-auto sm:mx-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={
                                isAr
                                  ? item.title || ""
                                  : item.titleEn || item.title || ""
                              }
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src =
                                  "/placeholder.svg"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 w-full text-center sm:text-right">
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="font-bold text-slate-800 hover:text-[#1a4fba] transition-colors text-sm md:text-base truncate">
                              {isAr
                                ? item.title
                                : item.titleEn || item.title}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5">
                            {item.color && (
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-[11px]">
                                <span className="text-slate-400">
                                  {isAr ? "اللون:" : "Color:"}
                                </span>
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-200"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-slate-600 font-medium">
                                  {item.color}
                                </span>
                              </span>
                            )}
                            {item.size && (
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-[11px]">
                                <span className="text-slate-400">
                                  {isAr ? "المقاس:" : "Size:"}
                                </span>
                                <span className="font-bold text-slate-700">
                                  {item.size}
                                </span>
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500">
                              {isAr ? "سعر القطعة:" : "Unit:"}{" "}
                              <strong>
                                {(item.price ?? 0).toFixed(2)}{" "}
                                {isAr ? "ج.م" : "EGP"}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t border-slate-50 sm:border-0 pt-3 sm:pt-0">
                          {/* Quantity */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item, -1)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item, +1)}
                              disabled={
                                item.maxQuantity != null &&
                                item.quantity >= item.maxQuantity
                              }
                              className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Line total */}
                          <p className="text-sm font-bold text-[#1a4fba]">
                            {((item.price ?? 0) * item.quantity).toFixed(2)}{" "}
                            {isAr ? "ج.م" : "EGP"}
                          </p>

                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
                    {isAr ? "ملخص الفاتورة" : "Order Summary"}
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span className="font-semibold text-slate-700">
                        {subtotal.toFixed(2)} {isAr ? "ج.م" : "EGP"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 items-center">
                      <span>{isAr ? "الشحن" : "Shipping"}</span>
                      {shipping === 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          {isAr ? "مجاني" : "Free"}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {shipping.toFixed(2)} {isAr ? "ج.م" : "EGP"}
                        </span>
                      )}
                    </div>
                    <Separator className="bg-slate-100 my-1" />
                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-1">
                      <span>{isAr ? "الإجمالي" : "Total"}</span>
                      <span className="text-base text-[#1a4fba] font-extrabold">
                        {total.toFixed(2)} {isAr ? "ج.م" : "EGP"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={() => router.push("/guest-checkout")}
                      disabled={
                        items.length === 0 ||
                        items.some((i) => i.available === false)
                      }
                      className="w-full flex items-center justify-center gap-2 bg-[#1a4fba] hover:bg-[#1640a0] text-white font-semibold rounded-xl shadow-md h-12"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {isAr ? "إتمام الطلب كضيف" : "Checkout as Guest"}
                    </Button>

                    <Button asChild variant="outline" className="w-full h-11">
                      <Link href="/auth/login" className="flex items-center justify-center gap-2">
                        <LogIn className="h-4 w-4" />
                        {isAr ? "تسجيل الدخول للدفع" : "Sign In to Checkout"}
                      </Link>
                    </Button>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                    {isAr
                      ? "بإتمام الطلب أنت توافق على شروط الاستخدام وسياسة الخصوصية."
                      : "By checking out, you agree to our Terms & Privacy Policy."}
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
