'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, Shield, Clock, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { authService } from '@/lib/api';

const schema = z.object({
  code: z.string().min(6, 'الكود يجب أن يكون 6 أرقام').max(6, 'الكود يجب أن يكون 6 أرقام'),
});

export default function PasswordResetVerify() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // Cooldown in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const COOLDOWN_TIME = 180; // 3 minutes in seconds

  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (cooldown > 0) {
      setIsResendDisabled(true);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cooldown]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setLoading(true);

      const response = await authService.verifyResetCode(data.code);

      if (response.data?.success) {
        toast.success('تم التحقق بنجاح');
        router.push(`/auth/reset-password?email=${encodeURIComponent(emailParam)}`);
      } else {
        throw new Error(response.data?.message || 'الكود غير صحيح');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'الكود غير صحيح. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || resendLoading || !emailParam) {
      return;
    }

    try {
      setResendLoading(true);

      const resp = await authService.forgotPassword(emailParam);

      if (resp.data?.success) {
        toast.success('تم إرسال الكود مرة أخرى');
        // Start cooldown timer
        setCooldown(COOLDOWN_TIME);
      } else {
        throw new Error(resp.data?.message || 'حدث خطأ');
      }
    } catch (err: any) {
      // Check if it's a cooldown error from backend
      const errorMessage = err?.response?.data?.message || err.message || 'حدث خطأ';

      if (errorMessage.includes("يجب الانتظار") || errorMessage.includes("دقيقة")) {
        // Extract time from error message
        const timeMatch = errorMessage.match(/(\d+)\s*دقيقة/);
        if (timeMatch && timeMatch[1]) {
          const minutes = parseInt(timeMatch[1]);
          setCooldown(minutes * 60);
        }
      } else if (err?.response?.status === 429) {
        // Too many requests
        setCooldown(COOLDOWN_TIME);
        toast.error("لقد قمت بمحاولات كثيرة، يرجى الانتظار قبل إعادة المحاولة");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setResendLoading(false);
    }
  };

  // Check if email is available
  if (!emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] px-4 font-[Cairo,sans-serif]" dir="rtl">
        <div className="max-w-md w-full p-8 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">خطأ في البيانات</h2>
          <p className="text-slate-500 mb-6">لم يتم العثور على بريد إلكتروني للتحقق منه.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-[#004ac6] text-white h-12 px-6 rounded-xl font-bold hover:bg-[#003da6] transition-colors"
          >
            العودة لإدخال البريد الإلكتروني
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f7f9fb] font-[Cairo,sans-serif]" dir="rtl">

        {/* Verification Form */}
        <div className="mx-auto w-full max-w-md px-4 pt-12 pb-16">
          <Link href="/" className="mb-6 flex select-none items-center justify-center gap-2">
            <span className="font-extrabold text-2xl tracking-wider text-slate-950 font-['Space_Grotesk'] uppercase">MIRVORY</span>
            <span className="rounded-[9999px] bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">EGYPT</span>
          </Link>
          <div className="w-full rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <div className="text-center mb-7">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-[#004ac6]" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">تحقق من كود إعادة التعيين</h2>
              <p className="text-slate-500">أدخل الكود المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني</p>

              {emailParam && (
                <div className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-blue-50 rounded-lg">
                  <Mail className="h-4 w-4 text-[#004ac6] ml-2" />
                  <span className="text-[#003da6] font-medium text-sm">{emailParam}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <label htmlFor="code" className="block text-slate-700 text-[13px] font-bold mb-1.5">كود التحقق</label>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    {...register('code')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-[0.875rem] bg-slate-50 focus:ring-2 focus:ring-[#004ac6]/30 focus:border-[#004ac6] text-center text-xl tracking-widest ${errors.code ? 'border-red-300' : 'border-slate-200'
                      }`}
                    placeholder="٠٠٠٠٠٠"
                    dir="ltr"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.code && (
                  <p className="text-red-500 text-sm mt-2 pr-1">
                    {errors.code.message}
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
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    تحقق من الكود
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-6 text-center">
              {isResendDisabled ? (
                <div className="inline-flex items-center justify-center space-x-2 space-x-reverse bg-gray-100 px-4 py-3 rounded-lg w-full">
                  <Clock className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-slate-700 font-medium">
                      يمكنك إعادة الإرسال خلال {formatTime(cooldown)}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      يجب الانتظار 3 دقائق بين كل محاولة
                    </p>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !emailParam}
                  className={`w-full h-12 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${resendLoading || !emailParam
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-[#004ac6] hover:bg-blue-100 border border-blue-200'
                    }`}
                >
                  {resendLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      لم تستلم الكود؟ إعادة الإرسال
                    </>
                  )}
                </button>
              )}

            </div>

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
                  href="/auth/forgot-password"
                  className="block text-center text-[#004ac6] hover:text-blue-800 transition-colors font-medium"
                >
                  إعادة إدخال البريد الإلكتروني
                </Link>
                <Link
                  href="/auth/login"
                  className="block text-center text-slate-500 hover:text-gray-800 transition-colors"
                >
                  العودة إلى تسجيل الدخول
                </Link>
              </div>
            </div>

        
          </div>
        </div>
      </div>
    </>
  );
}