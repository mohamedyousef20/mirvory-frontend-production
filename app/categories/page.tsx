"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoryService, productService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';
import { useLanguage } from '@/components/language-provider';

interface Category {
  _id: string;
  name: string | { ar?: string; en?: string };
  nameEn?: string;
  description?: string | { ar?: string; en?: string };
  descriptionEn?: string;
  image?: string;
  [key: string]: any;
}

const CategoriesPage = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsCount, setProductsCount] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();

        if (response.data) {
          setCategories(response.data);

          const counts: { [key: string]: number } = {};
          for (const category of response.data) {
            try {
              const productsResponse = await productService.getProductsByCategory(category._id, {
                limit: 1,
                page: 1
              });
              counts[category._id] = productsResponse.data.pagination.total || 0;
            } catch (err) {
              console.error(`Error fetching products count for category ${category._id}:`, err);
              counts[category._id] = 0;
            }
          }
          setProductsCount(counts);
        } else {
          setError('لا توجد فئات متاحة');
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || 'حدث خطأ أثناء جلب الفئات');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <MirvoryPageLoader text={"جاري التحميل..."} />;
  }

  const label = (v: any) => (typeof v === 'string' ? v : v?.ar || v?.en || '')

  if (error) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-4 [font-family:var(--font-cairo),Cairo,sans-serif]">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-100 bg-white p-7 text-center shadow-sm">
          <p className="mb-4 text-[15px] font-bold text-slate-800">{error}</p>
          <button onClick={() => window.location.reload()} className="h-11 rounded-xl bg-[#004ac6] px-6 text-[14px] font-bold text-white">إعادة المحاولة</button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f9fb] px-4 pb-28 pt-24 md:pt-10 [font-family:var(--font-cairo),Cairo,sans-serif]">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6">
          <h1 className="text-[26px] font-extrabold text-slate-900 md:text-3xl">الأقسام</h1>
          <p className="mt-1 text-[14px] text-slate-500">اختار القسم وشوف كل المنتجات فيه.</p>
        </div>
        {categories.length === 0 ? (
          <div className="rounded-[1.25rem] border border-slate-100 bg-white py-12 text-center text-slate-500">لا توجد فئات متاحة حالياً</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category: Category) => {
              const count = productsCount[category._id] ?? 0;
              return (
                <Link key={category._id} href={`/products?category=${category._id}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.08)] active:scale-[0.99]">
                  {category.image && <img src={category.image} alt={label(category.name)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-right text-white">
                    <h2 className="text-[18px] font-extrabold leading-tight">{label(category.name)}</h2>
                    <span className="mt-1 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur">{count} منتج</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
