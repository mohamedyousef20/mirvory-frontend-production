import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إعادة تعيين كلمة المرور | ميرفوري',
  description: 'إعادة تعيين كلمة المرور لحساب ميرفوري الخاص بك',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
