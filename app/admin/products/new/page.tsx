'use client';

import { useRouter } from 'next/navigation';
import AddProductForm from '@/components/admin/AddProductForm';

/**
 * Route entry only — Next.js App Router forbids custom props on a
 * page's default export, so the form itself lives in
 * components/admin/AddProductForm.tsx.
 */
export default function NewProductPage() {
  const router = useRouter();

  return <AddProductForm onClose={() => router.back()} />;
}
