import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'غير مصرح | ميرفوري',
  description: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4 pb-24 pt-24 [font-family:var(--font-cairo),Cairo,sans-serif]" dir="rtl">
      <div className="w-full max-w-md rounded-[1.5rem] border border-slate-100 bg-white p-8 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-[#ba1a1a]">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">مش مسموح تدخل الصفحة دي</h1>
        <p className="mb-7 text-[14px] leading-relaxed text-slate-500">حسابك ملوش صلاحية الوصول للصفحة دي. لو شايف إن ده غلط، تواصل مع الدعم.</p>
        <div className="flex flex-col gap-2.5">
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#004ac6] text-[14px] font-bold text-white active:scale-[0.99]">الرئيسية</Link>
          <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 text-[14px] font-bold text-slate-700">تسجيل الدخول بحساب تاني</Link>
        </div>
      </div>
    </div>
  )
}
