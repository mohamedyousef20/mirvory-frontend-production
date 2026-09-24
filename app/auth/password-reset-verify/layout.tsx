import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تحقق من كود إعادة التعيين | ميرفوري',
  description: 'تحقق من كود إعادة تعيين كلمة المرور لحساب ميرفوري الخاص بك',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
