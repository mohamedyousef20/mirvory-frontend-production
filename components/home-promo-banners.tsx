import Link from "next/link"
import { Crown, Search } from "lucide-react"
import { WhatsAppIcon } from "@/components/whatsapp-help-button"

/** Concierge + loyalty promo banners for the home page. */
export function HomePromoBanners() {
  return (
    <section className="grid gap-3 md:grid-cols-2" dir="rtl" aria-label="خدمات ميرفوري">
      <Link
        href="/request-product"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white"
      >
        <Search className="absolute -bottom-3 start-3 h-24 w-24 opacity-10" />
        <p className="text-xs font-semibold opacity-80">كونسيرج ميرفوري</p>
        <h3 className="mt-1 text-lg font-extrabold">مش لاقي الموديل اللي بتدور عليه؟</h3>
        <p className="mt-1 text-xs opacity-80">ابعتلنا صورة أو اسم الموديل ونحاول نوفره لك.</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900">
          اطلب منتجك الخاص
        </span>
      </Link>

      <Link
        href="/loyalty"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-foreground"
      >
        <Crown className="absolute -bottom-3 start-3 h-24 w-24 opacity-10" />
        <p className="text-xs font-semibold opacity-80">نادي ميرفوري</p>
        <h3 className="mt-1 text-lg font-extrabold">اكسب نقاط مع كل طلب</h3>
        <p className="mt-1 text-xs opacity-80">نقطة عن كل 5 جنيه، واستخدمها كخصم عند الدفع.</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-primary">
          اعرف أكتر
        </span>
      </Link>
    </section>
  )
}
