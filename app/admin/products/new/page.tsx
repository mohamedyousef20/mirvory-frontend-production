'use client';

import { useRouter } from 'next/navigation';
import AddProductForm from '@/components/admin/AddProductForm';

// A Next.js page cannot take custom props, so the form lives in components/admin/AddProductForm.tsx
export default function AdminNewProductPage() {
  const router = useRouter();
  return <AddProductForm onClose={() => router.back()} />;
}
