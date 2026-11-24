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

export function CartMobileInner(p: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const count = p.items.reduce((s, i) => s + i.quantity, 0)
  const missing = Math.max(0, p.freeShipping.minimum - p.subtotal)
  const pct = p.freeShipping.minimum > 0 ? Math.min(100, Math.round((p.subtotal / p.freeShipping.minimum) * 100)) : 0

  if (p.items.length === 0) {
    return (
      <div dir="rtl" className="md:hidden min-h-screen bg-[#f7f9fb] px-[1rem] pt-28 pb-24 flex flex-col items-center text-center gap-[0.5rem]">
        <div className="w-20 h-20 rounded-[9999px] bg-[#dbe1ff] flex items-center justify-center mt-[2.25rem]">
          <span className="material-symbols-outlined text-[#004ac6] text-[36px]">shopping_bag</span>
        </div>
        <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">{p.loading ? "جاري مزامنة السلة..." : p.error || "سلتك فارغة"}</h2>
        {!p.loading && (
          <Link href="/products" className="px-[1.5rem] py-3 rounded-[0.75rem] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">
            تصفح المنتجات
          </Link>
        )}
      </div>
    )
  }

  return (
    <div dir="rtl" className="md:hidden min-h-screen bg-[#f7f9fb] font-[Cairo,sans-serif] px-[1rem] pt-28 pb-24">
      <h1 className="sr-only">Cart</h1>
      <div className="flex flex-col w-full pb-20 select-none">
        {p.error && <div className="mb-[0.5rem] rounded-[0.75rem] bg-[#ffdad6] text-[#93000a] p-[0.5rem] font-[Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400]">{p.error}</div>}

        {p.freeShipping.enabled && p.items.length > 0 && (
          <div className="w-full bg-[#f2f4f6] rounded-2xl p-[1rem] shadow-sm mb-[1rem] relative overflow-hidden">
            <div className="flex items-center justify-between gap-[0.25rem] mb-[0.25rem]">
              <div className="flex items-center gap-[0.25rem] min-w-0">
                <div className="w-8 h-8 rounded-[9999px] bg-[#dbe1ff] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#004ac6] text-[20px]">local_shipping</span>
                </div>
                <p className="font-[Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#191c1e] truncate font-semibold">
                  {missing > 0 ? (
                    <>
                      أنت على بعد <span className="font-bold text-[#004ac6] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif]">{fmt(missing)} ج.م</span> فقط من الشحن المجاني!
                    </>
                  ) : (
                    "مبروك! طلبك مؤهل للشحن المجاني"
                  )}
                </p>
              </div>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] px-2 py-0.5 rounded-[9999px] bg-[#2563eb] text-[#ffffff] shrink-0">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-[#e0e3e5] rounded-[9999px] overflow-hidden relative">
              <div className="h-full bg-[#2563eb] rounded-[9999px] transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">{fmt(p.subtotal)} ج.م</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">الهدف: {fmt(p.freeShipping.minimum)} ج.م (شحن مجاني)</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-[0.5rem] px-1">
          <div className="flex items-center gap-[0.25rem]">
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">سلة المقتنيات</span>
            <span className="px-2 py-0.5 rounded-[9999px] bg-[#e6e8ea] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold">{count} قطع</span>
          </div>
          <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#004ac6] flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            أصلي 100% موثق
          </span>
        </div>

        <div className="flex flex-col gap-[0.5rem] mb-[1.5rem]">
          {p.items.map((it) => (
            <div key={it._id} className="relative bg-[#ffffff] rounded-2xl p-[0.5rem] shadow-sm flex gap-[0.5rem] items-stretch transition-all duration-300">
              <div className="relative w-24 h-28 bg-[#f2f4f6] rounded-[0.75rem] overflow-hidden shrink-0 flex items-center justify-center">
                <img alt={it.name} className="w-full h-full object-cover" src={it.image} />
                {it.size && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-[0.25rem] bg-[#ffffff]/90 backdrop-blur-sm text-[9px] font-bold text-[#191c1e]">EU {it.size}</span>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-[0.25rem]">
                  <div className="min-w-0">
                    {it.brand && <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#565e74] uppercase tracking-wider block">{it.brand}</span>}
                    <h3 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] truncate">{it.name}</h3>
                    <p className="font-[Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#434655] truncate mt-0.5">
                      {[it.size && `المقاس: ${it.size}`, it.colorName].filter(Boolean).join(" • ")}
                    </p>
                    {it.sellerName && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-[9999px] bg-[#2563eb]" />
                        <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#5c647a]">البائع: {it.sellerName}</span>
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
                      className="px-2 h-8 rounded-[9999px] bg-[#ba1a1a] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] font-bold shrink-0"
                    >
                      تأكيد
                    </button>
                  ) : (
                    <button
                      aria-label="حذف العنصر"
                      type="button"
                      onClick={() => setConfirmId(it._id)}
                      className="w-8 h-8 rounded-[9999px] flex items-center justify-center text-[#434655] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
                <div className="flex items-end justify-between mt-[0.25rem]">
                  <div className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[20px] leading-[26px] tracking-[-0.02em] font-[700] text-[#191c1e]">
                    {fmt(it.price * it.quantity)} <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655]">ج.م</span>
                  </div>
                  <div className="flex items-center bg-[#f2f4f6] rounded-[9999px] px-1.5 py-0.5">
                    <button
                      type="button"
                      aria-label="تقليل الكمية"
                      disabled={it.quantity <= 1 || p.updatingItemId === it._id}
                      onClick={() => p.onQuantity(it._id, it.quantity - 1)}
                      className="w-6 h-6 rounded-[9999px] flex items-center justify-center text-[#191c1e] hover:bg-[#e6e8ea] transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[15px]">remove</span>
                    </button>
                    <span className="w-6 text-center [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[13px] font-bold text-[#191c1e]">{it.quantity}</span>
                    <button
                      type="button"
                      aria-label="زيادة الكمية"
                      disabled={it.quantity >= it.maxQuantity || p.updatingItemId === it._id}
                      onClick={() => p.onQuantity(it._id, it.quantity + 1)}
                      className="w-6 h-6 rounded-[9999px] flex items-center justify-center text-[#191c1e] hover:bg-[#e6e8ea] transition-colors disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!p.hideCoupon && <div className="bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm mb-[1rem] flex flex-col gap-[0.5rem]">
          <div className="flex items-center justify-between">
            <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e]">كوبون الخصم</span>
          </div>
          <div className="relative flex items-center bg-[#f2f4f6] rounded-[0.75rem] p-1">
            <div className="flex items-center flex-1 px-[0.5rem]">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px] ml-2">sell</span>
              <input
                className="bg-transparent [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold text-[#191c1e] focus:outline-none w-full placeholder:font-normal placeholder:text-[#434655]/60"
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
                className="px-[1rem] py-2 rounded-[0.5rem] bg-[#e6e8ea] text-[#434655] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-[#004ac6]">check_circle</span>
                مطبّق · إزالة
              </button>
            ) : (
              <button
                type="button"
                disabled={p.couponLoading || !p.couponCode.trim()}
                onClick={p.onApplyCoupon}
                className="px-[1rem] py-2 rounded-[0.5rem] bg-[#2563eb] text-[#ffffff] [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold disabled:opacity-50"
              >
                {p.couponLoading ? "..." : "تطبيق"}
              </button>
            )}
          </div>
          {p.couponError && <p className="font-[Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] text-[#ba1a1a]">{p.couponError}</p>}
          {p.couponApplied && p.discount > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-[0.75rem] bg-[#dbe1ff]/40 text-[#00174b]">
              <div className="flex items-center gap-[0.25rem] min-w-0">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">high_res</span>
                <span className="font-[Cairo,sans-serif] text-[12px] leading-[18px] tracking-[0.01em] font-[400] font-semibold truncate">تم تطبيق الخصم بنجاح</span>
              </div>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[12px] leading-[16px] tracking-[0.04em] font-[600] font-bold text-[#004ac6] shrink-0">-{fmt(p.discount)} ج.م</span>
            </div>
          )}
        </div>}

        <div className="bg-[#ffffff] rounded-2xl p-[1rem] shadow-sm mb-[1rem]">
          <h2 className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600] text-[#191c1e] mb-[0.5rem]">ملخص الطلب</h2>
          <div className="flex flex-col gap-[0.25rem]">
            <div className="flex items-center justify-between py-1">
              <span className="font-[Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655]">المجموع الفرعي ({count} قطع)</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e]">{fmt(p.subtotal)} ج.م</span>
            </div>
            {p.couponApplied && p.discount > 0 && (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1">
                  <span className="font-[Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#004ac6]">خصم الكوبون</span>
                  <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] px-1.5 py-0.5 rounded-[0.25rem] bg-[#dbe1ff] text-[#00174b] font-bold">{p.couponCode}</span>
                </div>
                <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold text-[#004ac6]">-{fmt(p.discount)} ج.م</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1">
              <span className="font-[Cairo,sans-serif] text-[14px] leading-[22px] tracking-[0em] font-[400] text-[#434655]">مصاريف الشحن</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] text-[#191c1e]">{p.shipping === 0 ? "مجاني" : `${fmt(p.shipping)} ج.م`}</span>
            </div>
            <div className="w-full h-px bg-[#eceef0] my-[0.25rem]" />
            <div className="flex items-baseline justify-between pt-1">
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[22px] leading-[30px] tracking-[-0.02em] font-[700] text-[#191c1e] block font-bold">الإجمالي النهائي</span>
              <div className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[26px] leading-[34px] tracking-[-0.02em] font-[700] text-[#004ac6] font-black">
                {fmt(p.total)} <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[18px] leading-[26px] tracking-[-0.01em] font-[600]">ج.م</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[0.25rem] mb-[1.5rem]">
          {[
            ["payments", "الدفع عند الاستلام متاح"],
            ["visibility", "معاينة قبل الاستلام"],
            ["published_with_changes", "إرجاع مجاني 14 يوماً"],
          ].map(([icon, label]) => (
            <div key={icon} className="bg-[#f2f4f6] rounded-[0.75rem] p-[0.25rem] flex flex-col items-center text-center justify-center min-h-[72px]">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px] mb-1">{icon}</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#191c1e] font-semibold leading-tight">{label}</span>
            </div>
          ))}
        </div>

        <div className="w-full pt-1">
          <Link
            href={p.checkoutHref || "/checkout"}
            className="w-full h-14 bg-[#2563eb] hover:bg-[#004ac6] active:scale-[0.98] transition-all rounded-2xl shadow-lg shadow-[#004ac6]/20 flex items-center justify-between px-[1rem] text-[#ffffff]"
          >
            <div className="flex items-center gap-[0.25rem]">
              <span className="material-symbols-outlined text-[22px] rotate-180">arrow_back</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold">المتابعة لإتمام الطلب</span>
            </div>
            <div className="flex items-center gap-1 [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[14px] leading-[20px] tracking-[0.02em] font-[600] font-bold bg-[#ffffff]/20 backdrop-blur-sm px-3 py-1.5 rounded-[0.75rem] border border-[#ffffff]/20">
              <span>{fmt(p.total)}</span>
              <span className="[font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700]">ج.م</span>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-[0.5rem] mt-[0.5rem]">
            <p className="text-center [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#004ac6]">lock</span>دفع آمن 100% ومعاملة مشفرة
            </p>
            <span className="w-1 h-1 rounded-[9999px] bg-[#c3c6d7]" />
            <p className="text-center [font-family:var(--font-space-grotesk),Space_Grotesk,var(--font-cairo),Cairo,sans-serif] text-[10px] leading-[14px] tracking-[0.06em] font-[700] text-[#434655] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#004ac6]">verified</span>شحن وتوصيل مؤكد
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


import { StitchHeader, StitchNav } from "./StitchChrome"

export function CartMobile(p: Props) {
  return (
    <>
      <StitchHeader variant="cart" />
      <CartMobileInner {...p} />
      <StitchNav />
    </>
  )
}
