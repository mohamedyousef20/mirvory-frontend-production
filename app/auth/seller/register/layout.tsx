import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تسجيل بائع جديد | ميرفوري',
  description: 'انضم كبائع في منصة ميرفوري وابدأ بيع منتجاتك',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
