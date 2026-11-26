"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  CheckCircle,
  ArrowRight,
  Clock,
  RefreshCw
} from "lucide-react";
import { authService } from "@/lib/api";
import { toast } from "sonner";

const VerifyEmail = () => {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // in seconds
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const COOLDOWN_TIME = 180; // 3 minutes in seconds

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
    if (resendCooldown > 0) {
      setIsResendDisabled(true);
      timerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
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
  }, [resendCooldown]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !verificationCode) {
      setErrorText("يرجى ملء جميع الحقول");
      return;
    }

    if (verificationCode.length !== 6) {
      setErrorText("يجب أن يكون رمز التحقق 6 أرقام");
      return;
    }

    setIsLoading(true);
    setErrorText("");

    try {
      const verifyData = {
        email,
        code: verificationCode
      };

      await authService.verifyEmail(verifyData);
      toast.success('تم تفعيل البريد الإلكتروني بنجاح');
      setIsVerified(true);

      // Reset cooldown on successful verification
      setResendCooldown(0);
      setIsResendDisabled(false);
      setResendAttempts(0);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);

    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "فشل التحقق من الرمز";
      setErrorText(errorMessage);

      // Check if it's a cooldown error from backend
      if (errorMessage.includes("يجب الانتظار") || errorMessage.includes("دقيقة")) {
        // Extract time from error message
        const timeMatch = errorMessage.match(/(\d+)\s*دقيقة/);
        if (timeMatch && timeMatch[1]) {
          const minutes = parseInt(timeMatch[1]);
          setResendCooldown(minutes * 60);
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || !email) {
      return;
    }

    setErrorText("");

    try {
      const response = await authService.resendVerification(email);

      toast.success('تم إعادة إرسال الرمز بنجاح');
      setResendAttempts(prev => prev + 1);

      // Start cooldown timer
      setResendCooldown(COOLDOWN_TIME);

      // If backend returns cooldown info, use it
      if (response?.data?.cooldown) {
        setResendCooldown(response.data.cooldown);
      }

      // Reset verification code input for new code
      setVerificationCode("");

    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "تعذر إعادة إرسال الرمز";
      setErrorText(errorMessage);

      // Handle cooldown error from backend
      if (errorMessage.includes("يجب الانتظار") || errorMessage.includes("دقيقة")) {
        const timeMatch = errorMessage.match(/(\d+)\s*دقيقة/);
        if (timeMatch && timeMatch[1]) {
          const minutes = parseInt(timeMatch[1]);
          setResendCooldown(minutes * 60);
        }
      } else if (error?.response?.status === 429) {
        // Too many requests
        setResendCooldown(COOLDOWN_TIME);
        toast.error("لقد قمت بمحاولات كثيرة، يرجى الانتظار قبل إعادة المحاولة");
      }

      toast.error(errorMessage);
    }
  };

  // ===================== SUCCESS SCREEN ======================
  if (isVerified) {
    return (
      <>
        <div className="min-h-screen bg-[#f7f9fb] font-[Cairo,sans-serif]" dir="rtl">

          {/* Success Message */}
          <div className="mx-auto w-full max-w-md px-4 pt-12 pb-16">
          <Link href="/" className="mb-6 flex select-none items-center justify-center gap-2">
            <span className="font-extrabold text-2xl tracking-wider text-slate-950 font-['Space_Grotesk'] uppercase">MIRVORY</span>
            <span className="rounded-[9999px] bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white">EGYPT</span>
          </Link>
          <div className="w-full rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm md:p-7 text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">تم التحقق بنجاح</h2>
                <p className="text-slate-500 text-lg">سيتم تحويلك تلقائياً إلى صفحة تسجيل الدخول خلال ثوانٍ قليلة</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600 mr-2" size={24} />
                  <span className="text-green-800 font-medium">تم تأكيد هويتك بنجاح</span>
                </div>
                <p className="text-green-700 text-sm">
                  يمكنك الآن الاستفادة من جميع مزايا منصة ميرفوري
                </p>
              </div>

              <div className="mt-6">
                <div className="text-center">
                  <div className="inline-flex items-center text-slate-500">
                    <Clock className="w-4 h-4 ml-1" />
                    <span>سيتم التوجيه خلال 3 ثوانٍ...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ===================== MAIN FORM ======================
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
              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">تأكيد البريد الإلكتروني</h2>
              <p className="text-slate-500">أدخل رمز التحقق المرسل إلى بريدك الإلكتروني</p>
            </div>

            {errorText && (
              <div className={`px-4 py-3 rounded-lg mb-6 ${errorText.includes("نجاح")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
                }`}>
                {errorText}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-slate-700 text-[13px] font-bold mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    className="w-full pr-4 pl-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label htmlFor="verificationCode" className="block text-slate-700 text-[13px] font-bold mb-1.5">رمز التحقق</label>
                <div className="relative">
                  <input
                    id="verificationCode"
                    type={showCode ? "text" : "password"}
                    value={verificationCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setVerificationCode(value);
                      setErrorText("");
                    }}
                    className="w-full pr-4 pl-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-lg tracking-widest"
                    placeholder="••••••"
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute left-3 top-3.5"
                  >
                    {showCode ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-2 text-center">
                  أدخل الرمز المكون من 6 أرقام
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6 || !email}
                className={`w-full bg-[#004ac6] text-white h-12 rounded-xl font-bold transition-colors ${isLoading || verificationCode.length !== 6 || !email
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'hover:bg-[#003da6]'
                  }`}
              >
                {isLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
              </button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-8 text-center">
              <p className="text-slate-500 mb-4">لم تستلم الرمز؟</p>

              {isResendDisabled ? (
                <div className="inline-flex items-center justify-center space-x-2 space-x-reverse bg-gray-100 px-4 py-2 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-700 font-medium">
                    يمكنك إعادة الإرسال خلال {formatTime(resendCooldown)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={!email || isResendDisabled}
                  className={`inline-flex items-center justify-center space-x-2 space-x-reverse px-4 py-2 rounded-lg font-medium transition-colors ${!email || isResendDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-[#004ac6] hover:bg-blue-100'
                    }`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>إعادة إرسال رمز التحقق</span>
                </button>
              )}

            
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-slate-500 mb-2">تواجه مشكلة في التحقق؟</p>
                <div className="space-y-2">
                  <Link
                    href="/contact"
                    className="block text-[#004ac6] hover:text-blue-800 font-medium"
                  >
                    اتصل بالدعم الفني
                  </Link>
                  <Link
                    href="/auth/forgot-password"
                    className="block text-[#004ac6] hover:text-blue-800 font-medium"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;