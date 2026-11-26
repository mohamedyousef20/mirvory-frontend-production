// app/auth/login/page.tsx
"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { authService } from '@/lib/api';
import { getReturnTo } from '@/lib/returnTo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: getReturnTo() });
    } catch (err) {
      console.error(err);
      toast.error('تعذر تسجيل الدخول عبر جوجل في الوقت الحالي');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });

      if (!response.data.success) {
        const message = response.data.message || "فشل تسجيل الدخول";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح");

      // FIX: Backend returns { tokens: { accessToken, refreshToken }, data: { user } }
      // Primary path is response.data.tokens.accessToken
      const accessToken =
        response.data.tokens?.accessToken ||
        response.data.data?.accessToken ||
        response.data.accessToken;

      const refreshToken =
        response.data.tokens?.refreshToken ||
        response.data.data?.refreshToken ||
        response.data.refreshToken;

      const role =
        response.data.data?.user?.role ||
        response.data.role;

      // ─── Set cookies on Vercel domain ──────────────────────────────────────
      // Railway backend sets cookies on railway.app only — Vercel middleware
      // cannot see them. We call our own Next.js API route to set the tokens on
      // the Vercel domain so middleware can read them on the next request.
      if (accessToken) {
        try {
          await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ accessToken, refreshToken, role }),
          });
        } catch (cookieErr) {
          console.warn('[login] Failed to set Vercel-domain cookies:', cookieErr);
        }
      }

      // Go back to where the customer was (cart, product, checkout...), not the home page.
      // Sellers still land on their dashboard. Full load so user data and cart refresh.
      const dest = role === "seller" ? "/vendor/dashboard" : getReturnTo();
      window.location.assign(dest);

    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "فشل تسجيل الدخول";

      setError(errorMessage);
      console.error("Login Error:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-[Cairo,sans-serif]" dir="rtl">
      <div className="mx-auto w-full max-w-md px-4 pt-12 pb-12">
        <div className="w-full">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6 select-none">
            <span className="font-extrabold text-2xl tracking-wider text-slate-950 font-['Space_Grotesk'] uppercase">MIRVORY</span>
            <span className="px-2 py-0.5 rounded-[9999px] bg-slate-900 text-white font-bold text-[10px] tracking-widest">EGYPT</span>
          </Link>
          <div className="rounded-[1.5rem] bg-white border border-slate-100 shadow-sm p-5 md:p-7">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">أهلاً بك مجدداً</h2>
            <p className="text-sm text-slate-500">سجّل الدخول للوصول إلى حسابك وطلباتك</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-[0.875rem] mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="w-full h-12 pr-4 pl-11 rounded-[0.875rem] bg-[#f1f5f9] border border-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full h-12 pr-4 pl-11 rounded-[0.875rem] bg-[#f1f5f9] border border-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#004ac6] focus:ring-4 focus:ring-[#004ac6]/10 transition"
                  placeholder="أدخل كلمة المرور"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 z-10"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 accent-[#004ac6] rounded"
                />
                <label htmlFor="remember" className="mr-2 block text-sm text-slate-700">
                  تذكرني
                </label>
              </div>
              <Link href="/auth/password-reset-request" className="text-sm font-bold text-[#004ac6] hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[0.875rem] bg-[#004ac6] text-white text-sm font-extrabold shadow-md transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#2563eb]"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500 text-xs font-semibold">أو تسجيل الدخول باستخدام</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-[0.875rem] border border-slate-200 bg-white text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.61l6.9-6.9C35.9 2.38 30.47 0 24 0 14.64 0 6.59 5.38 2.56 13.22l8.02 6.22C12.5 13.13 17.77 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.1 24.55c0-1.6-.14-3.14-.41-4.63H24v9.02h12.43c-.54 2.9-2.16 5.36-4.59 7.01l7.06 5.47C43.87 37.13 46.1 31.4 46.1 24.55z" />
                  <path fill="#FBBC05" d="M10.58 28.44a14.5 14.5 0 010-8.88l-8.02-6.22a24.003 24.003 0 000 21.32l8.02-6.22z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.14 15.9-5.78l-7.06-5.47c-1.96 1.32-4.47 2.1-8.84 2.1-6.23 0-11.5-3.63-13.42-8.94l-8.02 6.22C6.59 42.62 14.64 48 24 48z" />
                </svg>
                <span>تسجيل الدخول عبر جوجل</span>
              </button>
            </div>
          </div>
          </div>
          <p className="text-center text-sm text-slate-600 mt-5">مستخدم جديد؟ <Link href="/auth/register" className="font-extrabold text-[#004ac6] hover:underline">إنشاء حساب جديد</Link></p>
        </div>
      </div>
    </div>
  );
}
