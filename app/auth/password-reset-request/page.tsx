// pages/auth/password-reset-request/page.tsx
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authService } from '@/lib/api';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

export default function PasswordResetRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setLoading(true);

      const response = await authService.forgotPassword(data.email);
      if (response.data?.success) {
        toast.success('تم إرسال كود التحقق إلى بريدك الإلكتروني');
        router.push(`/auth/password-reset-verify?email=${encodeURIComponent(data.email)}`);
      } else {
        throw new Error(response.data?.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'حدث خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f7f9fb] font-[Cairo,sans-serif]" dir="rtl">

        {/* Reset Password Form */}
        <div className="mx-auto w-full max-w-md px-4 pt-12 pb-16">
          <Link href="/" className="mb-6 flex select-none items-center justify-center gap-2">
            <span className="font-extrabold text-2xl tracking-wider text-slate-950 font-['Space_Grotesk'] uppercase">MIRVORY</span>
            <span className="rounded-[9999px] bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">EGYPT</span>
          </Link>
          <div className="w-full rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <div className="text-center mb-7">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">إعادة تعيين كلمة المرور</h2>
              <p className="text-slate-500">أدخل بريدك الإلكتروني لإرسال كود التحقق</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-slate-700 text-[13px] font-bold mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-[0.875rem] bg-slate-50 focus:ring-2 focus:ring-[#004ac6]/30 focus:border-[#004ac6] ${errors.email ? 'border-red-300' : 'border-slate-200'
                      }`}
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#004ac6] text-white h-12 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'hover:bg-[#003da6]'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    إرسال كود التحقق
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Additional Links */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">خيارات إضافية</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Link
                  href="/auth/login"
                  className="block text-center text-[#004ac6] hover:text-blue-800 transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="block text-center text-slate-500 hover:text-gray-800 transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-[#eff4ff] rounded-xl">
              <p className="text-sm text-[#003da6] text-center">
                سوف نرسل رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني.
                تأكد من صحة البريد الإلكتروني المدخل.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}