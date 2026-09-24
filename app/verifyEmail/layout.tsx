import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تأكيد البريد الإلكتروني | ميرفوري',
  description: 'تأكيد البريد الإلكتروني لحساب ميرفوري',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
