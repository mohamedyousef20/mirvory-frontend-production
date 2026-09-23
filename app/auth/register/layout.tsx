import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد | ميرفوري',
  description: 'إنشاء حساب جديد في منصة ميرفوري للتسوق',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
