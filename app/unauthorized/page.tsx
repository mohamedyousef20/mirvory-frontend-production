import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'غير مصرح | ميرفوري',
  description: 'ليس لديك صلاحية للوصول إلى هذه الصفحة',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4" dir="rtl">
      <div className="max-w-md w-full text-center">
        {/* Shield icon */}
        <div className="mb-6 flex justify-center">
          <svg
            className="h-24 w-24 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">غير مصرح بالوصول</h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.
          <br />
          يرجى التواصل مع مسؤول النظام إذا كنت تعتقد أن هذا خطأ.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            تسجيل الدخول بحساب آخر
          </Link>
        </div>
      </div>
    </div>
  );
}
