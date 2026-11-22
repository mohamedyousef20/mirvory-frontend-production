"use client"

import Link from "next/link"
import { useState } from "react"

export type M3CartItem = {
  _id: string
  name: string
  image: string
  quantity: number
  price: number
  size?: string
  colorName?: string
  brand?: string
  sellerName?: string
  maxQuantity: number
}

type Props = {
  items: M3CartItem[]
  subtotal: number
  discount: number
  couponCode: string
  couponApplied: boolean
  couponLoading: boolean
  couponError: string | null
  shipping: number
  total: number
  freeShipping: { enabled: boolean; minimum: number }
  updatingItemId: string | null
  error: string | null
  loading?: boolean
  hideCoupon?: boolean
  checkoutHref?: string
  onCouponChange: (v: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  onQuantity: (id: string, q: number) => void
  onRemove: (id: string) => void
}

const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

export function CartMobile(p: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const count = p.items.reduce((s, i) => s + i.quantity, 0)
  const missing = Math.max(0, p.freeShipping.minimum - p.subtotal)
  const pct = p.freeShipping.minimum > 0 ? Math.min(100, Math.round((p.subtotal / p.freeShipping.minimum) * 100)) : 0

  if (p.items.length === 0) {
    return (
      <div dir="rtl" className="md:hidden min-h-screen bg-m3-surface px-m3-margin pt-28 pb-24 flex flex-col items-center text-center gap-m3-space-sm">
        <div className="w-20 h-20 rounded-full bg-m3-primary-fixed flex items-center justify-center mt-m3-space-xl">
          <span className="material-symbols-outlined text-m3-primary text-[36px]">shopping_bag</span>
        </div>
        <h2 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">{p.loading ? "جاري مزامنة السلة..." : p.error || "سلتك فارغة"}</h2>
        {!p.loading && (
          <Link href="/products" className="px-m3-space-lg py-3 rounded-xl bg-m3-primary-container text-m3-on-primary font-m3-label-lg text-m3-label-lg font-bold">
            تصفح المنتجات
          </Link>
        )}
      </div>
    )
  }

  return (
    <div dir="rtl" className="md:hidden min-h-screen bg-m3-surface font-m3-body-md px-m3-margin pt-28 pb-24">
      <h1 className="sr-only">Cart</h1>
      <div className="flex flex-col w-full pb-20 select-none">
        {p.error && <div className="mb-m3-space-sm rounded-xl bg-m3-error-container text-m3-on-error-container p-m3-space-sm font-m3-body-sm text-m3-body-sm">{p.error}</div>}

        {p.freeShipping.enabled && p.items.length > 0 && (
          <div className="w-full bg-m3-surface-container-low rounded-2xl p-m3-space-md shadow-sm mb-m3-space-md relative overflow-hidden">
            <div className="flex items-center justify-between gap-m3-space-xs mb-m3-space-xs">
              <div className="flex items-center gap-m3-space-xs min-w-0">
                <div className="w-8 h-8 rounded-full bg-m3-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-m3-primary text-[20px]">local_shipping</span>
                </div>
                <p className="font-m3-body-md text-m3-body-md text-m3-on-surface truncate font-semibold">
                  {missing > 0 ? (
                    <>
                      أنت على بعد <span className="font-bold text-m3-primary font-m3-price-display">{fmt(missing)} ج.م</span> فقط من الشحن المجاني!
                    </>
                  ) : (
                    "مبروك! طلبك مؤهل للشحن المجاني"
                  )}
                </p>
              </div>
              <span className="font-m3-label-sm text-m3-label-sm px-2 py-0.5 rounded-full bg-m3-primary-container text-m3-on-primary shrink-0">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-m3-surface-container-highest rounded-full overflow-hidden relative">
              <div className="h-full bg-m3-primary-container rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant">{fmt(p.subtotal)} ج.م</span>
              <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant">الهدف: {fmt(p.freeShipping.minimum)} ج.م (شحن مجاني)</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-m3-space-sm px-1">
          <div className="flex items-center gap-m3-space-xs">
            <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">سلة المقتنيات</span>
            <span className="px-2 py-0.5 rounded-full bg-m3-surface-container-high text-m3-on-surface-variant font-m3-label-sm text-m3-label-sm font-bold">{count} قطع</span>
          </div>
          <span className="font-m3-label-sm text-m3-label-sm text-m3-primary flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            أصلي 100% موثق
          </span>
        </div>

        <div className="flex flex-col gap-m3-space-sm mb-m3-space-lg">
          {p.items.map((it) => (
            <div key={it._id} className="relative bg-m3-surface-container-lowest rounded-2xl p-m3-space-sm shadow-sm flex gap-m3-space-sm items-stretch transition-all duration-300">
              <div className="relative w-24 h-28 bg-m3-surface-container-low rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                <img alt={it.name} className="w-full h-full object-cover" src={it.image} />
                {it.size && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-m3-surface-container-lowest/90 backdrop-blur-sm text-[9px] font-bold text-m3-on-surface">EU {it.size}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-m3-space-xs">
                  <div className="min-w-0">
                    {it.brand && <span className="font-m3-label-sm text-m3-label-sm text-m3-secondary uppercase tracking-wider block">{it.brand}</span>}
                    <h3 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface truncate">{it.name}</h3>
                    <p className="font-m3-body-sm text-m3-body-sm text-m3-on-surface-variant truncate mt-0.5">
                      {[it.size && `المقاس: ${it.size}`, it.colorName].filter(Boolean).join(" • ")}
                    </p>
                    {it.sellerName && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-m3-primary-container" />
                        <span className="font-m3-label-sm text-m3-label-sm text-m3-on-secondary-container">البائع: {it.sellerName}</span>
                      </div>
                    )}
                  </div>
                  {confirmId === it._id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmId(null)
                        p.onRemove(it._id)
                      }}
                      className="px-2 h-8 rounded-full bg-m3-error text-m3-on-error font-m3-label-sm text-m3-label-sm font-bold shrink-0"
                    >
                      تأكيد
                    </button>
                  ) : (
                    <button
                      aria-label="حذف العنصر"
                      type="button"
                      onClick={() => setConfirmId(it._id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-m3-on-surface-variant hover:text-m3-error hover:bg-m3-error-container/40 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
                <div className="flex items-end justify-between mt-m3-space-xs">
                  <div className="font-m3-price-display text-m3-price-display text-m3-on-surface">
                    {fmt(it.price * it.quantity)} <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant">ج.م</span>
                  </div>
                  <div className="flex items-center bg-m3-surface-container-low rounded-full px-1.5 py-0.5">
                    <button
                      type="button"
                      aria-label="تقليل الكمية"
                      disabled={it.quantity <= 1 || p.updatingItemId === it._id}
                      onClick={() => p.onQuantity(it._id, it.quantity - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-m3-on-surface hover:bg-m3-surface-container-high transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[15px]">remove</span>
                    </button>
                    <span className="w-6 text-center font-m3-price-display text-[13px] font-bold text-m3-on-surface">{it.quantity}</span>
                    <button
                      type="button"
                      aria-label="زيادة الكمية"
                      disabled={it.quantity >= it.maxQuantity || p.updatingItemId === it._id}
                      onClick={() => p.onQuantity(it._id, it.quantity + 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-m3-on-surface hover:bg-m3-surface-container-high transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!p.hideCoupon && <div className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm mb-m3-space-md flex flex-col gap-m3-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-m3-headline-md text-m3-headline-md text-m3-on-surface">كوبون الخصم</span>
          </div>
          <div className="relative flex items-center bg-m3-surface-container-low rounded-xl p-1">
            <div className="flex items-center flex-1 px-m3-space-sm">
              <span className="material-symbols-outlined text-m3-primary text-[20px] ml-2">sell</span>
              <input
                className="bg-transparent font-m3-price-display text-m3-label-lg font-bold text-m3-on-surface focus:outline-none w-full placeholder:font-normal placeholder:text-m3-on-surface-variant/60"
                type="text"
                placeholder="أدخل كود الخصم"
                readOnly={p.couponApplied}
                value={p.couponCode}
                onChange={(e) => p.onCouponChange(e.target.value.toUpperCase())}
              />
            </div>
            {p.couponApplied ? (
              <button
                type="button"
                disabled={p.couponLoading}
                onClick={p.onRemoveCoupon}
                className="px-m3-space-md py-2 rounded-lg bg-m3-surface-container-high text-m3-on-surface-variant font-m3-label-md text-m3-label-md font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-m3-primary">check_circle</span>
                مطبّق · إزالة
              </button>
            ) : (
              <button
                type="button"
                disabled={p.couponLoading || !p.couponCode.trim()}
                onClick={p.onApplyCoupon}
                className="px-m3-space-md py-2 rounded-lg bg-m3-primary-container text-m3-on-primary font-m3-label-md text-m3-label-md font-bold disabled:opacity-50"
              >
                {p.couponLoading ? "..." : "تطبيق"}
              </button>
            )}
          </div>
          {p.couponError && <p className="font-m3-body-sm text-m3-body-sm text-m3-error">{p.couponError}</p>}
          {p.couponApplied && p.discount > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-m3-primary-fixed/40 text-m3-on-primary-fixed">
              <div className="flex items-center gap-m3-space-xs min-w-0">
                <span className="material-symbols-outlined text-m3-primary text-[18px]">high_res</span>
                <span className="font-m3-body-sm text-m3-body-sm font-semibold truncate">تم تطبيق الخصم بنجاح</span>
              </div>
              <span className="font-m3-price-display text-m3-label-md font-bold text-m3-primary shrink-0">-{fmt(p.discount)} ج.م</span>
            </div>
          )}
        </div>}

        <div className="bg-m3-surface-container-lowest rounded-2xl p-m3-space-md shadow-sm mb-m3-space-md">
          <h2 className="font-m3-headline-md text-m3-headline-md text-m3-on-surface mb-m3-space-sm">ملخص الطلب</h2>
          <div className="flex flex-col gap-m3-space-xs">
            <div className="flex items-center justify-between py-1">
              <span className="font-m3-body-md text-m3-body-md text-m3-on-surface-variant">المجموع الفرعي ({count} قطع)</span>
              <span className="font-m3-price-display text-m3-label-lg text-m3-on-surface">{fmt(p.subtotal)} ج.م</span>
            </div>
            {p.couponApplied && p.discount > 0 && (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1">
                  <span className="font-m3-body-md text-m3-body-md text-m3-primary">خصم الكوبون</span>
                  <span className="font-m3-label-sm text-m3-label-sm px-1.5 py-0.5 rounded bg-m3-primary-fixed text-m3-on-primary-fixed font-bold">{p.couponCode}</span>
                </div>
                <span className="font-m3-price-display text-m3-label-lg font-bold text-m3-primary">-{fmt(p.discount)} ج.م</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1">
              <span className="font-m3-body-md text-m3-body-md text-m3-on-surface-variant">مصاريف الشحن</span>
              <span className="font-m3-price-display text-m3-label-lg text-m3-on-surface">{p.shipping === 0 ? "مجاني" : `${fmt(p.shipping)} ج.م`}</span>
            </div>
            <div className="w-full h-px bg-m3-surface-container my-m3-space-xs" />
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-m3-headline-lg text-m3-headline-lg text-m3-on-surface block font-bold">الإجمالي النهائي</span>
              <div className="font-m3-price-display text-m3-headline-xl-mobile text-m3-primary font-black">
                {fmt(p.total)} <span className="font-m3-headline-md text-m3-headline-md">ج.م</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-m3-space-xs mb-m3-space-lg">
          {[
            ["payments", "الدفع عند الاستلام متاح"],
            ["visibility", "معاينة قبل الاستلام"],
            ["published_with_changes", "إرجاع مجاني 14 يوماً"],
          ].map(([icon, label]) => (
            <div key={icon} className="bg-m3-surface-container-low rounded-xl p-m3-space-xs flex flex-col items-center text-center justify-center min-h-[72px]">
              <span className="material-symbols-outlined text-m3-primary text-[20px] mb-1">{icon}</span>
              <span className="font-m3-label-sm text-m3-label-sm text-m3-on-surface font-semibold leading-tight">{label}</span>
            </div>
          ))}
        </div>

        <div className="w-full pt-1">
          <Link
            href={p.checkoutHref || "/checkout"}
            className="w-full h-14 bg-m3-primary-container hover:bg-m3-primary active:scale-[0.98] transition-all rounded-2xl shadow-lg shadow-m3-primary/20 flex items-center justify-between px-m3-space-md text-m3-on-primary"
          >
            <div className="flex items-center gap-m3-space-xs">
              <span className="material-symbols-outlined text-[22px] rotate-180">arrow_back</span>
              <span className="font-m3-headline-md text-m3-label-lg font-bold">المتابعة لإتمام الطلب</span>
            </div>
            <div className="flex items-center gap-1 font-m3-price-display text-m3-label-lg font-bold bg-m3-surface-container-lowest/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-m3-surface-container-lowest/20">
              <span>{fmt(p.total)}</span>
              <span className="font-m3-label-sm text-m3-label-sm">ج.م</span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-m3-space-sm mt-m3-space-sm">
            <p className="text-center font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-m3-primary">lock</span>دفع آمن 100% ومعاملة مشفرة
            </p>
            <span className="w-1 h-1 rounded-full bg-m3-outline-variant" />
            <p className="text-center font-m3-label-sm text-m3-label-sm text-m3-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-m3-primary">verified</span>شحن وتوصيل مؤكد
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
