import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تغيير كلمة المرور | ميرفوري',
  description: 'تغيير كلمة المرور لحساب ميرفوري الخاص بك',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
