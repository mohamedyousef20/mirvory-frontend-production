'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, User, Phone, Mail, MapPin, Package } from 'lucide-react';

interface GuestItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  title?: string;
  price?: number;
}

interface GuestCheckoutForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryMethod: 'home' | 'pickup';
  paymentMethod: 'cash';
  address: string;
  items: GuestItem[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function GuestCheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<GuestCheckoutForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    deliveryMethod: 'home',
    paymentMethod: 'cash',
    address: '',
    items: [],
  });
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // In a real flow, items come from URL params / cart stored in localStorage
  // For demo, we parse from localStorage key 'guest_cart'
  const [demoItems] = useState<GuestItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('guest_cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleChange = (field: keyof GuestCheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.guestName.trim()) return 'الاسم مطلوب';
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      return 'البريد الإلكتروني غير صالح';
    if (!/^01[0125][0-9]{8}$/.test(form.guestPhone))
      return 'رقم الهاتف غير صالح. يجب أن يكون رقمًا مصريًا صحيحًا';
    if (form.deliveryMethod === 'home' && !form.address.trim())
      return 'عنوان التوصيل مطلوب';
    if (demoItems.length === 0)
      return 'السلة فارغة. أضف منتجات قبل إتمام الطلب';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const payload = {
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.toLowerCase().trim(),
        guestPhone: form.guestPhone.trim(),
        deliveryMethod: form.deliveryMethod,
        paymentMethod: form.paymentMethod,
        deliveryInfo: { address: form.address.trim() },
        items: demoItems,
      };

      const res = await fetch(`${BACKEND_URL}/api/guest-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'حدث خطأ أثناء إنشاء الطلب');
        return;
      }

      // Clear guest cart
      localStorage.removeItem('guest_cart');

      setTrackingToken(data.trackingToken);
      setOrderNumber(data.orderNumber);
      toast.success('تم إنشاء طلبك بنجاح!');
    } catch {
      toast.error('حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // ── Order Confirmation Screen ───────────────────────────────────────────────
  if (trackingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Package className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">تم تأكيد طلبك! 🎉</h1>
          {orderNumber && (
            <p className="text-gray-600">رقم الطلب: <span className="font-mono font-bold">{orderNumber}</span></p>
          )}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-600">رمز التتبع الخاص بك:</p>
            <p className="font-mono text-sm bg-white border rounded-lg p-3 break-all select-all">
              {trackingToken}
            </p>
            <p className="text-xs text-gray-500">احفظ هذا الرمز لتتبع طلبك</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/track-order?token=${trackingToken}`)}
              className="w-full"
            >
              تتبع طلبي
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <ShoppingBag className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">الشراء كضيف</h1>
          <p className="text-gray-500 mt-1">لا تحتاج لحساب — فقط أكمل بياناتك</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
          {/* Personal Info */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> بياناتك الشخصية
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName">الاسم الكامل *</Label>
                <Input
                  id="guestName"
                  value={form.guestName}
                  onChange={(e) => handleChange('guestName', e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="guestEmail" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" /> البريد الإلكتروني *
                </Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={form.guestEmail}
                  onChange={(e) => handleChange('guestEmail', e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">سنرسل تأكيد الطلب على هذا البريد</p>
              </div>
              <div>
                <Label htmlFor="guestPhone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> رقم الهاتف *
                </Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={form.guestPhone}
                  onChange={(e) => handleChange('guestPhone', e.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> عنوان التوصيل
            </h2>
            <div>
              <Label htmlFor="address">العنوان التفصيلي *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="المحافظة، المدينة، الشارع، رقم المبنى"
                required
                className="mt-1"
              />
            </div>
          </section>

          {/* Summary */}
          {demoItems.length > 0 && (
            <section className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-3">ملخص الطلب</h3>
              <div className="space-y-2">
                {demoItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.title || `منتج ${idx + 1}`}</span>
                    <span>x{item.quantity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Warning for empty cart */}
          {demoItems.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 text-sm">السلة فارغة. يرجى إضافة منتجات أولاً.</p>
              <Button variant="link" onClick={() => router.push('/products')} className="text-amber-700 mt-1">
                تصفح المنتجات
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={loading || demoItems.length === 0}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري تأكيد الطلب...</>
            ) : (
              'تأكيد الطلب'
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            لديك حساب؟{' '}
            <a href="/auth/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
