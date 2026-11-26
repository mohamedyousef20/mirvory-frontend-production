'use client';

import { PREPAID_DISCOUNT, prepaidDiscountFor } from "@/lib/prepaid"
import { ManualPaymentCard, ReceiptUpload } from '@/components/stitch/ManualPayment';
import { zoneFor } from "@/lib/delivery-times";
import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, ShoppingBag, User, Phone, Mail, MapPin, Package, Store, Home } from 'lucide-react';
import { guestCartService, pickupPointService, shippingSettingsService } from '@/lib/api';
import { getGuestCart, clearGuestCart } from '@/lib/guestCart';
import { track } from '@/lib/track';
import { saveGuestOrder, trackUrl, whatsappToSelf } from '@/lib/guestOrders';
import { GREATER_CAIRO_AREA, getCitiesByGovernorate } from '@/lib/data/greater-cairo-area';
declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      parameters?: Record<string, any>
    ) => void;
  }
}
interface BuyNowSelection {
  color?: string;
  colorName?: string;
  colorImage?: string | null;
  size?: string;
  quantity: number;
  image?: string | null;
}

interface GuestItem {
  productId: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  colorName?: string | null;
  colorImage?: string | null;
  image?: string | null;
  title?: string;
  price?: number;
}

/**
 * Parse sessionStorage buyNowItem into GuestItem[].
 * Supports both new { selections[] } and legacy { quantity, color, size } formats.
 */
function parseBuyNowToGuestItems(raw: string): GuestItem[] {
  try {
    const parsed = JSON.parse(raw);
    // New format: { productId, title, price, selections[] }
    if (Array.isArray(parsed.selections) && parsed.selections.length > 0) {
      return parsed.selections.map((sel: BuyNowSelection) => ({
        productId: parsed.productId,
        quantity: sel.quantity,
        color: sel.color ?? null,
        colorName: sel.colorName ?? null,
        colorImage: sel.colorImage ?? null,
        size: sel.size ?? null,
        title: parsed.title,
        price: parsed.price ?? 0,
        image: sel.colorImage || sel.image || null,
      }));
    }
    // Legacy format: { productId, quantity, color, size, image, title, price }
    return [{
      productId: parsed.productId,
      quantity: parsed.quantity ?? 1,
      color: parsed.color ?? null,
      colorName: parsed.colorName ?? null,
      colorImage: parsed.colorImage ?? null,
      size: parsed.size ?? null,
      title: parsed.title,
      price: parsed.price ?? 0,
      image: parsed.colorImage || parsed.image || null,
    }];
  } catch {
    return [];
  }
}

interface GuestCheckoutForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryMethod: 'home' | 'pickup';
  paymentMethod: 'cash' | 'instapay' | 'wallet';
  // structured address fields — match the registered user checkout
  governorate: string;
  city: string;
  addressLine: string;
  pickupPoint: string;
}

interface PickupPoint {
  _id?: string;
  id?: string;
  name: string;
  address?: string;
  stationName?: string;
  workingHours?: string;
}

function GuestCheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buyNow';
  const [loading, setLoading] = useState(false);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [form, setForm] = useState<GuestCheckoutForm>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    deliveryMethod: 'home',
    paymentMethod: 'cash',
    governorate: '',
    city: '',
    addressLine: '',
    pickupPoint: '',
  });
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [shippingSettings, setShippingSettings] = useState<any>(null);

  // In Buy Now mode, read the single item from sessionStorage; otherwise use guest cart
  const [cartItems] = useState<GuestItem[]>(() => {
    if (typeof window === 'undefined') return []
    if (isBuyNow) {
      try {
        const raw = sessionStorage.getItem('buyNowItem')
        if (!raw) return []
        return parseBuyNowToGuestItems(raw)
      } catch { return [] }
    }
    return getGuestCart() as GuestItem[]
  });

  useEffect(() => {
    const fetchPickupPoints = async () => {
      try {
        const response = await pickupPointService.getPickupPoints();
        const points = response?.data || [];
        setPickupPoints(Array.isArray(points) ? points : []);
      } catch (error) {
        setPickupPoints([]);
      }
    };

    const fetchShippingSettings = async () => {
      try {
        const response = await shippingSettingsService.getShippingSettings();
        setShippingSettings(response.data || response);
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
      }
    };

    fetchPickupPoints();
    fetchShippingSettings();
  }, []);

  const handleChange = (field: keyof GuestCheckoutForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // reset city when governorate changes
      if (field === 'governorate') next.city = '';
      return next;
    });
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);

  // Cities available for selected governorate
  const availableCities = useMemo(() => {
    if (!form.governorate) return [];
    return getCitiesByGovernorate(form.governorate);
  }, [form.governorate]);
  
  const shippingFee = useMemo(() => {
    if (!shippingSettings) return 70;
    let fee = shippingSettings.shippingFee ?? 70;
    if (shippingSettings.freeShippingEnabled && subtotal >= shippingSettings.freeShippingMinimum) fee = 0;
    if (shippingSettings.freePickupShipping && form.deliveryMethod === 'pickup') fee = 0;
    return fee;
  }, [subtotal, form.deliveryMethod, shippingSettings]);
  
  const prepaidDiscount = prepaidDiscountFor(form.paymentMethod, subtotal);
  const totalAmount = subtotal + shippingFee - prepaidDiscount;

  const selectedPickupPoint = pickupPoints.find(
    (p) => (p._id || p.id) === form.pickupPoint
  );

  const validate = (): string | null => {
    if (!form.guestName.trim()) return 'الاسم مطلوب';
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail))
      return 'البريد الإلكتروني غير صالح';
    if (!/^01[0125][0-9]{8}$/.test(form.guestPhone))
      return 'رقم الهاتف غير صالح. يجب أن يكون رقمًا مصريًا صحيحًا';
    if (form.deliveryMethod === 'home') {
      if (!form.governorate) return 'المحافظة مطلوبة';
      if (!form.city) return 'المدينة مطلوبة';
      if (!form.addressLine.trim()) return 'تفاصيل العنوان مطلوبة';
    }
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
        paymentMethod: form.paymentMethod,
        deliveryInfo: {
          address: form.deliveryMethod === 'home'
            ? `${form.addressLine.trim()}, ${form.city}, ${form.governorate}`
            : undefined,
          pickupPoint: form.deliveryMethod === 'pickup' ? form.pickupPoint : undefined,
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size ?? null,
          color: item.color ?? null,
          colorName: item.colorName ?? null,
          colorImage: item.colorImage ?? null,
          image: item.colorImage || item.image || null,
        })),
      });

      const data = response.data;

      // Clean up after successful order
      if (isBuyNow) {
        try { sessionStorage.removeItem('buyNowItem') } catch { /* ignore */ }
      } else {
        clearGuestCart();
      }

      saveGuestOrder({ token: data.trackingToken, orderNumber: data.orderNumber, phone: form.guestPhone.trim() });
      track('purchase');
      setTrackingToken(data.trackingToken);
      setOrderNumber(data.orderNumber);

      window.history.replaceState(
        null,
        '',
        `/guest-checkout/success`
      );

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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 font-[Cairo,sans-serif]" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-6 text-center space-y-5">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"><Package className="h-10 w-10 text-emerald-600" /></div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">تم تأكيد طلبك 🎉</h1>
          {orderNumber && (
            <p className="text-gray-600">رقم الطلب: <span className="font-mono font-bold">{orderNumber}</span></p>
          )}
          {form.paymentMethod !== 'cash' && orderNumber && (
            <div className="space-y-3 text-start">
              <ManualPaymentCard method={form.paymentMethod} amount={totalAmount} />
              <ReceiptUpload orderNumber={orderNumber} phone={form.guestPhone.trim()} />
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-600">رمز التتبع الخاص بك:</p>
            <p className="font-mono text-sm bg-white border rounded-lg p-3 break-all select-all">
              {trackingToken}
            </p>
            <p className="text-xs text-gray-500">اتحفظ تلقائياً على جهازك في صفحة "تتبع طلبك"، بس ابعته لنفسك على واتساب عشان ميضيعش.</p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={whatsappToSelf(form.guestPhone, orderNumber || undefined, trackingToken)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebe5b] text-white font-bold flex items-center justify-center"
            >
              ابعت تأكيد الطلب ورابط التتبع لنفسي على واتساب
            </a>
            <Button
              variant="outline"
              onClick={() => { navigator.clipboard?.writeText(trackUrl(trackingToken)).then(() => toast.success('اتنسخ رابط التتبع')).catch(() => {}) }}
              className="w-full h-12 rounded-xl font-bold"
            >
              نسخ رابط التتبع
            </Button>
            <Button
              onClick={() => router.push(`/track-order?token=${trackingToken}`)}
              className="w-full h-12 rounded-xl bg-[#004ac6] hover:bg-[#003da5] font-bold"
            >
              تتبع طلبي
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full h-12 rounded-xl font-bold"
            >
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] py-5 px-4 pb-24 font-[Cairo,sans-serif]" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#dbe1ff]">
            <ShoppingBag className="h-7 w-7 text-[#004ac6]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">إتمام الطلب</h1>
          <p className="text-sm text-slate-500 mt-1">من غير حساب، كمّل بياناتك وهتوصلك الطلبية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary */}
          {cartItems.length > 0 && (
            <section className="bg-white rounded-[1.25rem] border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] p-4">
              <h3 className="font-semibold mb-3">ملخص الطلب</h3>
              <div className="space-y-2">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-700 font-medium">{item.title || `منتج ${idx + 1}`}</span>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {item.color && (
                          <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-500">{item.colorName || item.color}</span>
                          </span>
                        )}
                        {item.size && (
                          <span className="inline-flex items-center bg-blue-50 border border-blue-100 text-[#1640a0] rounded-full px-1.5 py-0.5 text-xs font-medium">
                            م {item.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium shrink-0">
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
                  {prepaidDiscount > 0 && (
                    <div className="flex justify-between text-sm font-medium text-emerald-700">
                      <span>خصم الدفع المسبق</span>
                      <span>-{prepaidDiscount.toLocaleString()} ج.م</span>
                    </div>
                  )}
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

          {/* Personal Info */}
          <section className="bg-white rounded-[1.25rem] border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] p-4">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#004ac6]" /> بياناتك الشخصية
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="guestName">الاسم الكامل *</Label>
                <Input
                  id="guestName"
                  value={form.guestName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('guestName', e.target.value)}
                  placeholder="مثال: محمد أحمد"
                  required
                  className="mt-1 h-12 bg-slate-50 rounded-xl border-slate-200"
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('guestEmail', e.target.value)}
                  placeholder="example@email.com"
                  required
                  className="mt-1 h-12 bg-slate-50 rounded-xl border-slate-200"
                />
                
              </div>
              <div>
                <Label htmlFor="guestPhone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> رقم الهاتف *
                </Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={form.guestPhone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('guestPhone', e.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                  className="mt-1 h-12 bg-slate-50 rounded-xl border-slate-200"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500 mt-1">هنبعتلك رسالة تأكيد الطلب على واتساب على الرقم ده</p>
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-white rounded-[1.25rem] border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] p-4">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#004ac6]" /> طريقة التوصيل
            </h2>

            <div className="flex gap-3 mb-4">
              <label className={`flex-1 flex items-center justify-center gap-2 h-14 border-2 rounded-xl cursor-pointer transition-colors ${form.deliveryMethod === 'home' ? 'border-[#004ac6] bg-[#eef3ff] text-[#004ac6] font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
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
              <label className={`flex-1 flex items-center justify-center gap-2 h-14 border-2 rounded-xl cursor-pointer transition-colors ${form.deliveryMethod === 'pickup' ? 'border-[#004ac6] bg-[#eef3ff] text-[#004ac6] font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
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
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-[#004ac6]" /> عنوان التوصيل
                </h3>

                {/* Governorate */}
                <div>
                  <Label htmlFor="governorate" className="text-xs text-slate-500">المحافظة *</Label>
                  <select
                    id="governorate"
                    value={form.governorate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('governorate', e.target.value)}
                    className="mt-1 w-full h-12 bg-white rounded-xl px-3 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
                    required={form.deliveryMethod === 'home'}
                  >
                    <option value="">اختر المحافظة</option>
                    {GREATER_CAIRO_AREA.map((gov) => (
                      <option key={gov.id} value={gov.id}>{gov.nameAr}</option>
                    ))}
                  </select>
                  {zoneFor(form.governorate) && (
                    <p className="mt-1.5 text-xs font-bold text-[#004ac6]">التوصيل المتوقع خلال {zoneFor(form.governorate)!.hours} (تقديري من شركة الشحن)</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city" className="text-xs text-slate-500">المدينة / الحي *</Label>
                  <select
                    id="city"
                    value={form.city}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('city', e.target.value)}
                    className="mt-1 w-full h-12 bg-white rounded-xl px-3 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6] disabled:opacity-50"
                    required={form.deliveryMethod === 'home'}
                    disabled={!form.governorate}
                  >
                    <option value="">اختر المدينة / الحي</option>
                    {availableCities.map((city) => (
                      <option key={city.id} value={city.id}>{city.nameAr}</option>
                    ))}
                  </select>
                </div>

                {/* Address line */}
                <div>
                  <Label htmlFor="addressLine" className="text-xs text-slate-500">تفاصيل العنوان *</Label>
                  <Input
                    id="addressLine"
                    value={form.addressLine}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('addressLine', e.target.value)}
                    placeholder="الشارع، رقم المبنى، الطابق..."
                    required={form.deliveryMethod === 'home'}
                    className="mt-1 h-12 bg-white rounded-xl border-slate-200"
                  />
                </div>

                {shippingSettings?.freeShippingEnabled && shippingFee > 0 && (
                  subtotal >= shippingSettings.freeShippingMinimum ? (
                    <p className="text-sm text-green-600">✓ الشحن مجاني لطلبك الحالي</p>
                  ) : (
                    <p className="text-sm text-[#1a4fba]">
                      أضف منتجات بقيمة {(shippingSettings.freeShippingMinimum - subtotal).toLocaleString()} ج.م للحصول على شحن مجاني
                    </p>
                  )
                )}
              </div>
            )}

            {form.deliveryMethod === 'pickup' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="pickupPoint">اختر نقطة الاستلام *</Label>
                <select
                  id="pickupPoint"
                  value={form.pickupPoint}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('pickupPoint', e.target.value)}
                  required={form.deliveryMethod === 'pickup'}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>اختر الفرع الأقرب إليك</option>
                  {pickupPoints.map((point) => (
                    <option key={point._id || point.id} value={point._id || point.id}>
                      {point.name}
                      {point.address ? ` - ${point.address}` : ''}
                      {point.stationName ? ` (بجوار ${point.stationName})` : ''}
                    </option>
                  ))}
                </select>

                {/* Selected pickup point details */}
                {selectedPickupPoint && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1 text-sm">
                    <p className="font-medium text-blue-900">{selectedPickupPoint.name}</p>
                    {selectedPickupPoint.address && (
                      <p className="text-[#1640a0] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {selectedPickupPoint.address}
                      </p>
                    )}
                    {selectedPickupPoint.stationName && (
                      <p className="text-[#1640a0] flex items-center gap-1">
                        <Store className="h-3.5 w-3.5 shrink-0" />
                        أقرب محطة مترو: {selectedPickupPoint.stationName}
                      </p>
                    )}
                    {selectedPickupPoint.workingHours && (
                      <p className="text-[#1640a0] flex items-center gap-1">
                        🕒 مواعيد العمل: {selectedPickupPoint.workingHours}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-green-600">الاستلام من نقاط البيع مجاني دائمًا</p>
              </div>
            )}
          </section>

          {/* Warning for empty cart */}
          {cartItems.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-amber-700 text-sm">السلة فارغة. يرجى إضافة منتجات أولاً.</p>
              <Button variant="link" onClick={() => router.push('/products')} className="text-amber-700 mt-1">
                تصفح المنتجات
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <p className="text-sm font-extrabold text-slate-900">طريقة الدفع</p>
            <div className="grid grid-cols-3 gap-2">
              {([['cash', 'عند الاستلام'], ['instapay', 'إنستا باي'], ['wallet', 'فودافون كاش']] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, paymentMethod: v }))}
                  className={`h-12 rounded-xl border text-[13px] font-bold transition ${form.paymentMethod === v ? 'border-[#004ac6] bg-[#dae2fd]/40 text-[#004ac6] ring-1 ring-[#004ac6]' : 'border-slate-200 text-slate-700'}`}
                >
                  {label}
                  {v !== 'cash' && <span className="block text-[10px] font-bold text-emerald-700">وفّر {PREPAID_DISCOUNT} ج.م</span>}
                </button>
              ))}
            </div>
            {form.paymentMethod === 'cash' && <p className="text-[12px] font-bold text-emerald-700">ادفع مقدمًا بإنستا باي أو فودافون كاش واوفّر {PREPAID_DISCOUNT} ج.م.</p>}
            {prepaidDiscount > 0 && <p className="text-[12px] font-bold text-emerald-700">تم خصم {PREPAID_DISCOUNT} ج.م لأنك هتدفع مقدمًا.</p>}
            {form.paymentMethod !== 'cash' && <ManualPaymentCard method={form.paymentMethod} amount={totalAmount} />}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-[#004ac6] hover:bg-[#003da5] text-base font-extrabold shadow-md"
            disabled={loading || cartItems.length === 0}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin ml-2" /> جاري تأكيد الطلب...</>
            ) : (
              `تأكيد الطلب${cartItems.length > 0 ? ` · ${totalAmount.toLocaleString()} ج.م` : ''}`
            )}
          </Button>
          {cartItems.length > 0 && <p className="text-center text-xs text-gray-500">{form.paymentMethod === 'cash' ? 'الدفع عند الاستلام · معاينة قبل الدفع' : 'ارفع إيصال التحويل بعد تأكيد الطلب · معاينة قبل الدفع'}</p>}
        </form>
      </div>
    </div>
  );
}

export default function GuestCheckoutPage() {
  return (
    <Suspense>
      <GuestCheckoutInner />
    </Suspense>
  )
}
