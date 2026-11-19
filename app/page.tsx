import Link from "next/link"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewestProducts } from "@/components/newest-product"
import { getUserServer } from "@/src/lib/getUserServer"
import { redirect } from "next/navigation"
import {
  ArrowLeft,
  Camera,
  PackageCheck,
  Percent,
  Repeat2,
  Shirt,
  Truck,
  WalletCards,
} from "lucide-react"

const quickCategories = [
  { title: "العروض", href: "/offers", icon: Percent, accent: "bg-red-500" },
  { title: "ملابس", href: "/categories", icon: Shirt, accent: "bg-slate-800" },
  { title: "كوتشيات حريمي", href: "/products?category=women", icon: PackageCheck, accent: "bg-pink-500" },
  { title: "كوتشيات رجالي", href: "/products?category=men", icon: PackageCheck, accent: "bg-blue-600" },
]

const trustItems = [
  { icon: Repeat2, title: "إرجاع واستبدال سهل", subtitle: "خلال 2 يوم" },
  { icon: WalletCards, title: "الدفع عند الاستلام", subtitle: "بكل سهولة" },
  { icon: Truck, title: "شحن سريع", subtitle: "لجميع المحافظات" },
]

function SectionHeader({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="mb-3 flex items-center justify-between" dir="rtl">
      <h2 className="relative pr-3 text-xl font-extrabold text-[#0b2c66] sm:text-2xl">
        <span className="absolute right-0 top-1 h-6 w-1 rounded-full bg-[#1f6fff]" />
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f6fff] hover:underline">
        {action}
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default async function Home() {
  const user = await getUserServer()
  if (user?.role === "seller") {
    redirect("/vendor/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb]">
      <main className="mx-auto w-full max-w-6xl space-y-4 px-3 py-4 md:px-6 md:py-8">
        <HeroCarousel />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" dir="rtl">
          {quickCategories.map(({ title, href, icon: Icon, accent }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-[#dfe7f5] bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-white ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="line-clamp-1 text-sm font-bold text-[#132a57]">{title}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2" dir="rtl">
          <div className="rounded-2xl bg-gradient-to-l from-[#0e2f75] to-[#1f58bb] p-4 text-white shadow-sm">
            <p className="text-xl font-extrabold">شحن مجاني</p>
            <p className="text-sm text-blue-100">داخل مترو الأنفاق</p>
            <Link
              href="/help"
              className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#0e2f75]"
            >
              اعرف المزيد
            </Link>
          </div>
          <div className="rounded-2xl bg-gradient-to-l from-white to-[#eaf1ff] p-4 text-[#0f2d65] shadow-sm ring-1 ring-[#d9e4fb]">
            <p className="text-xl font-extrabold">إستبدال وإرجاع</p>
            <p className="text-sm text-[#37558e]">بسهولة</p>
            <Link
              href="/return-policy"
              className="mt-3 inline-flex items-center rounded-full bg-[#0e2f75] px-3 py-1.5 text-xs font-bold text-white"
            >
              اعرف المزيد
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
          <SectionHeader title="أحدث المنتجات" href="/products" action="عرض الكل" />
          <NewestProducts title="" />
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#091f4c] to-[#123f97] p-5 text-white" dir="rtl">
          <p className="text-xl font-black">شوفت موديل وعاجبك؟</p>
          <p className="mt-1 max-w-xl text-sm text-blue-100">
            ساعدنا نلاقي الموديل ونوصلهولك بأقرب نتيجة من خلال رفع صورته.
          </p>
          <Link
            href="/request-product"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1f6fff] px-4 py-2 text-sm font-bold text-white"
          >
            <Camera className="h-4 w-4" />
            ارفع الصورة
          </Link>
        </section>

        <section className="grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 shadow-sm sm:grid-cols-3" dir="rtl">
          {trustItems.map(({ icon: Icon, title, subtitle }) => (
            <div key={title} className="flex items-center justify-between rounded-xl border border-[#e5edf8] bg-[#f9fbff] p-3 sm:flex-col sm:items-start sm:justify-start sm:gap-1">
              <Icon className="h-5 w-5 text-[#1f6fff]" />
              <div>
                <p className="text-sm font-bold text-[#0f2d65]">{title}</p>
                <p className="text-xs text-[#5f78a5]">{subtitle}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
