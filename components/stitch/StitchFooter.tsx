"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

/** Footer in the Stitch design language: slate surface, Cairo, rounded-2xl cards, same trust icons as the home screen. */
const cols: { title: string; links: [string, string][] }[] = [
  { title: "تسوّق", links: [["كل المنتجات", "/products"], ["العروض", "/offers"], ["المفضلة", "/wishlist"], ["السلة", "/cart"]] },
  { title: "مساعدة", links: [["الأسئلة الشائعة", "/faq"], ["دليل المقاسات", "/size-guide"], ["تتبع طلباتي", "/orders"], ["اطلب منتجك", "/request-product"]] },
  { title: "السياسات", links: [["سياسة الاستبدال والاسترجاع", "/return-policy"], ["الشروط والأحكام", "/terms"], ["الخصوصية", "/privacy"]] },
]
const trust: [string, string, string][] = [
  ["verified_user", "ضمان استبدال 14 يوم", "استبدال أو استرجاع بسهولة"],
  ["visibility", "معاينة قبل الدفع", "جرّب المقاس مع المندوب"],
  ["local_shipping", "شحن لكل المحافظات", "توصيل لباب بيتك"],
]

export function StitchFooter() {
  const pathname = usePathname() || "/"
  if (["/admin", "/vendor", "/auth", "/checkout", "/guest-checkout", "/verifyEmail"].some((x) => pathname.startsWith(x))) return null
  return (
    <footer dir="rtl" className="bg-[#f8fafc] font-[Cairo,sans-serif] px-[1rem] pt-[1.5rem] pb-[1.5rem] md:px-[2rem] md:pb-[2.25rem]">
      <div className="mx-auto max-w-6xl flex flex-col gap-[1.5rem]">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-[0.75rem] ${pathname === "/" ? "hidden" : ""}`}>
          {trust.map(([icon, t, d]) => (
            <div key={icon} className="flex items-center gap-3 p-3 rounded-[1.25rem] bg-white border border-slate-100 shadow-sm">
              <span className="w-10 h-10 rounded-[0.875rem] bg-blue-100 text-[#004ac6] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </span>
              <div className="flex flex-col text-right">
                <span className="text-sm font-extrabold text-slate-900">{t}</span>
                <span className="text-xs text-slate-500">{d}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-5 md:p-8 border border-slate-800 shadow-xl">
          <div className="absolute -top-16 -left-16 w-52 h-52 rounded-[9999px] bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-[9999px] bg-rose-600/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div className="flex flex-col gap-3 text-right">
              <Link href="/" className="flex items-center gap-2 w-fit">
                <span className="font-extrabold text-[19px] tracking-wider font-['Space_Grotesk'] uppercase">MIRVORY</span>
              </Link>
              <p className="text-xs text-slate-300 leading-relaxed">متجر سنيكرز في مصر. معاينة وتجربة المقاس قبل الدفع، وتوصيل لكل المحافظات.</p>
              <ul className="flex flex-col gap-2 text-xs text-slate-300 mt-1">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-blue-400">location_on</span>فيصل، الجيزة، مصر</li>
                <li><a href="tel:+201060167568" className="flex items-center gap-2 hover:text-white"><span className="material-symbols-outlined text-[16px] text-blue-400">call</span><span dir="ltr">+20 106 016 7568</span></a></li>
                <li><a href="mailto:support.mirvory@gmail.com" className="flex items-center gap-2 hover:text-white"><span className="material-symbols-outlined text-[16px] text-blue-400">mail</span>support.mirvory@gmail.com</a></li>
              </ul>
            </div>
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2 text-right">
                <h3 className="text-sm font-extrabold text-white pb-2 border-b border-slate-700/60">{c.title}</h3>
                {c.links.map(([l, h]) => (
                  <Link key={h} href={h} className="text-xs text-slate-300 hover:text-white py-0.5 transition-colors">{l}</Link>
                ))}
              </nav>
            ))}
          </div>
          <div className="relative z-10 mt-5 pt-4 border-t border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} Mirvory. جميع الحقوق محفوظة.</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-emerald-400">lock</span>دفع آمن ومعاملات مشفرة، والدفع عند الاستلام متاح</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
