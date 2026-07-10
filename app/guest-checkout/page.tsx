'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, User, Phone, Mail, MapPin, Package, Store } from 'lucide-react';
import { guestCartService, pickupPointService } from '@/lib/api';
import { getGuestCart, clearGuestCart } from '@/lib/guestCart';

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
  pickupPoint: string;
}

interface PickupPoint {
  _id?: string;
  id?: string;
  name: string;
  address?: string;
}

export default function GuestCheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [form, setForm] = useState<GuestCheckoutForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    deliveryMethod: 'home',
    paymentMethod: 'cash',
    address: '',
    pickupPoint: '',
  });
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [cartItems] = useState<GuestItem[]>(() => getGuestCart() as GuestItem[]);

  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const response = await pickupPointService.getPickupPoints();
        // Adjust the data path based on your API response structure (e.g., response.data.data or response.data)
        const points = response.data?.data || response.data || [];
        setPickupPoints(points);
      } catch (error) {
        console.error('Error fetching pickup points:', error);
      }
    };
    fetchPickupPoints();
  }, []);

  const handleChange = (field: keyof GuestCheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
  const shippingFee = (subtotal > 4000 || form.deliveryMethod === 'pickup') ? 0 : 70;
  const totalAmount = subtotal + shippingFee;

  const validate = (): string | null => {
    if (!form.guestName.trim()) return 'الاسم مطلوب';
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      return 'البريد الإلكتروني غير صالح';
    if (!/^01[0125][0-9]{8}$/.test(form.guestPhone))
      return 'رقم الهاتف غير صالح. يجب أن يكون رقمًا مصريًا صحيحًا';
    if (form.deliveryMethod === 'home' && !form.address.trim())
      return 'عنوان التوصيل مطلوب';
    if (form.deliveryMethod === 'pickup' && !form.pickupPoint)
      return 'نقطة الاستلام مطلوبة';
    if (cartItems.length === 0)
      return 'السلة فارغة. أضف منتجات قبل إتمام الطلب';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const response = await guestCartService.createOrder({
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.toLowerCase().trim(),
        guestPhone: form.guestPhone.trim(),
        deliveryMethod: form.deliveryMethod,
        paymentMethod: 'cash',
        deliveryInfo: {
          address: form.deliveryMethod === 'home' ? form.address.trim() : undefined,
          pickupPoint: form.deliveryMethod === 'pickup' ? form.pickupPoint : undefined,
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
        })),
      });

      const data = response.data;
      clearGuestCart();
      setTrackingToken(data.trackingToken);
      setOrderNumber(data.orderNumber);
      toast.success('تم إنشاء طلبك بنجاح!');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
              <MapPin className="h-5 w-5 text-primary" /> طريقة التوصيل
            </h2>

            <div className="flex gap-4 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${form.deliveryMethod === 'home' ? 'border-primary bg-primary/5 text-primary font-medium' : 'bg-gray-50 text-gray-600'}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="home"
                  checked={form.deliveryMethod === 'home'}
                  onChange={() => handleChange('deliveryMethod', 'home')}
                  className="hidden"
                />
                <MapPin className="h-4 w-4" /> توصيل للمنزل
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${form.deliveryMethod === 'pickup' ? 'border-primary bg-primary/5 text-primary font-medium' : 'bg-gray-50 text-gray-600'}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={form.deliveryMethod === 'pickup'}
                  onChange={() => handleChange('deliveryMethod', 'pickup')}
                  className="hidden"
                />
                <Store className="h-4 w-4" /> استلام من نقطة
              </label>
            </div>

            {form.deliveryMethod === 'home' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="address">العنوان التفصيلي *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="المحافظة، المدينة، الشارع، رقم المبنى"
                  required={form.deliveryMethod === 'home'}
                  className="mt-1"
                />
                {subtotal > 4000 ? (
                  <p className="text-sm text-green-600">الشحن مجاني لطلبك الحالي لتجاوزه 4000 ج.م</p>
                ) : (
                  <p className="text-sm text-blue-600">
                    أضف منتجات بقيمة {(4000 - subtotal).toLocaleString()} ج.م للحصول على شحن مجاني
                  </p>
                )}
              </div>
            )}

            {form.deliveryMethod === 'pickup' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="pickupPoint">اختر نقطة الاستلام *</Label>
                <select
                  id="pickupPoint"
                  value={form.pickupPoint}
                  onChange={(e) => handleChange('pickupPoint', e.target.value)}
                  required={form.deliveryMethod === 'pickup'}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>اختر الفرع الأقرب إليك</option>
                  {pickupPoints.map((point) => (
                    <option key={point._id || point.id} value={point._id || point.id}>
                      {point.name} {point.address ? `- ${point.address}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-green-600">الاستلام من نقاط البيع مجاني دائمًا</p>
              </div>
            )}
          </section>

          {/* Summary */}
          {cartItems.length > 0 && (
            <section className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-3">ملخص الطلب</h3>
              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.title || `منتج ${idx + 1}`}</span>
                    <span className="font-medium">
                      x{item.quantity}
                      {item.price ? ` · ${(item.price * item.quantity).toLocaleString()} ج.م` : ''}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>المجموع الفرعي</span>
                    <span>{subtotal.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>رسوم الشحن</span>
                    <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                      {shippingFee === 0 ? 'مجاني' : `${shippingFee.toLocaleString()} ج.م`}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span>{totalAmount.toLocaleString()} ج.م</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Warning for empty cart */}
          {cartItems.length === 0 && (
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
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري تأكيد الطلب...</>
            ) : (
              'تأكيد الطلب'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}