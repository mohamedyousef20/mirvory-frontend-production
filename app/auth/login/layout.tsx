import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل الدخول | ميرفوري',
  description: 'تسجيل الدخول إلى حساب ميرفوري الخاص بك',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
