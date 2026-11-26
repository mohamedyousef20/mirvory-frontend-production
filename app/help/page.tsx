"use client";

import { PageShell } from "@/components/stitch/PageKit";
import { HelpMobile } from "@/components/stitch/help-mobile";
import { useRouter } from "next/navigation";
import { Mail, MessageCircle } from "lucide-react";

function HelpDesktop() {
  const router = useRouter();

  const faqs = [
    {
      q: "كيف أتتبع طلباتي؟",
      a: "يمكنك تتبع طلباتك من خلال صفحة \"طلباتي\" حيث ستجد حالة كل طلب بالتفصيل.",
    },
    {
      q: "كيف أعدل أو ألغي طلب؟",
      a: "إذا كان الطلب قيد الانتظار يمكنك التواصل معنا لإلغائه أو تعديله قبل الشحن.",
    },
    {
      q: "ما هي خيارات الدفع المتاحة؟",
      a: "نقبل الدفع بالبطاقات البنكية، المحافظ الإلكترونية وخدمة الدفع عند الاستلام في بعض المناطق.",
    },
    {
      q: "كم يستغرق التوصيل؟",
      a: "عادةً ما يتم التوصيل خلال 2-5 أيام عمل داخل مصر حسب المدينة ومنطقة التوصيل.",
    },
    {
      q: "كيف أتواصل مع الدعم الفني؟",
      a: "توجه إلى صفحة التواصل واختر الوسيلة التي تناسبك مثل البريد الإلكتروني أو واتساب.",
    },
  ];

  return (
    <PageShell>
      <div className="mb-8 text-center">
        <span className="inline-flex rounded-full bg-[#dbeafe] px-3.5 py-1 text-[12px] font-bold text-[#004ac6]">مركز المساعدة</span>
        <h1 className="mt-3 text-[26px] font-extrabold text-slate-900 md:text-3xl">المساعدة والأسئلة الشائعة</h1>
        <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed text-slate-500">إجابات عن أكتر الأسئلة شيوعاً. ولو ملقيتش اللي بتدور عليه كلمنا.</p>
      </div>
      <div className="mb-8 space-y-2.5">
        {faqs.map(({ q, a }, idx) => (
          <details key={idx} className="group rounded-[1rem] border border-slate-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-[14px] font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
              <span>{q}</span>
              <span className="material-symbols-outlined text-[20px] text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <p className="px-4 pb-4 text-[13px] leading-relaxed text-slate-600">{a}</p>
          </details>
        ))}
      </div>
      <div className="rounded-[1.25rem] border border-slate-100 bg-white p-5 text-center shadow-sm">
        <p className="mb-4 text-[14px] font-bold text-slate-800">لسه محتاج مساعدة؟ فريق الدعم معاك.</p>
        <div className="flex flex-col justify-center gap-2.5 sm:flex-row">
          <button onClick={() => router.push("/contact")} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#004ac6] px-6 text-[14px] font-bold text-white"><Mail className="h-4 w-4" />صفحة التواصل</button>
          <button onClick={() => window.open("https://wa.me/201060167568", "_blank")} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-[14px] font-bold text-slate-700"><MessageCircle className="h-4 w-4" />واتساب مباشر</button>
        </div>
      </div>
    </PageShell>
  );
}

export default function HelpPage() {
  return (
    <>
      <HelpMobile />
      <div className="hidden md:block">
        <HelpDesktop />
      </div>
    </>
  );
}
