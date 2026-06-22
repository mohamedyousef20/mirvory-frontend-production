'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'قيد الانتظار', icon: <Clock className="h-5 w-5" />, color: 'text-yellow-500' },
  shipped: { label: 'تم الشحن', icon: <Truck className="h-5 w-5" />, color: 'text-blue-500' },
  delivered: { label: 'تم التسليم', icon: <CheckCircle className="h-5 w-5" />, color: 'text-green-500' },
  cancelled: { label: 'ملغي', icon: <Package className="h-5 w-5" />, color: 'text-red-500' },
};

interface OrderData {
  orderNumber?: string;
  deliveryStatus: string;
  paymentStatus: string;
  total: number;
  deliveryMethod: string;
  items: Array<{ product?: { title?: string; images?: string[] }; quantity: number; price: number }>;
  createdAt: string;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');

  const handleTrack = async (trackToken?: string) => {
    const t = trackToken || token;
    if (!t.trim()) { toast.error('يرجى إدخال رمز التتبع'); return; }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/guest-orders/track/${encodeURIComponent(t.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'لم يتم العثور على الطلب');
        return;
      }

      setOrder(data.order);
      setGuestName(data.guestName || '');
    } catch {
      setError('حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if token is in URL
  useEffect(() => {
    if (tokenFromUrl) handleTrack(tokenFromUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = order ? STATUS_MAP[order.deliveryStatus] || STATUS_MAP.pending : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Package className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-gray-800">تتبع طلبك</h1>
          <p className="text-gray-500 mt-1">أدخل رمز التتبع الذي استلمته عند الطلب</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="trackToken" className="sr-only">رمز التتبع</Label>
              <Input
                id="trackToken"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="أدخل رمز التتبع هنا..."
                className="h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                dir="ltr"
              />
            </div>
            <Button
              onClick={() => handleTrack()}
              disabled={loading}
              className="h-12 px-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {!loading && <span className="mr-2">بحث</span>}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Order Results */}
        {order && status && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">مرحباً، {guestName}</p>
                {order.orderNumber && (
                  <h2 className="text-xl font-bold">طلب رقم #{order.orderNumber}</h2>
                )}
              </div>
              <div className={`flex items-center gap-2 font-semibold ${status.color}`}>
                {status.icon}
                <span>{status.label}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">حالة الطلب</h3>
              <div className="flex items-center gap-0">
                {['pending', 'shipped', 'delivered'].map((s, idx) => {
                  const isActive = ['pending', 'shipped', 'delivered'].indexOf(order.deliveryStatus) >= idx;
                  const st = STATUS_MAP[s];
                  return (
                    <React.Fragment key={s}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {idx + 1}
                        </div>
                        <span className={`text-xs mt-1 text-center ${isActive ? 'text-primary font-medium' : 'text-gray-400'}`}>{st.label}</span>
                      </div>
                      {idx < 2 && <div className={`flex-1 h-0.5 mx-1 mb-5 ${isActive ? 'bg-primary' : 'bg-gray-200'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">المنتجات</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {item.product?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.title || 'منتج'}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.title || `منتج ${idx + 1}`}</p>
                        <p className="text-xs text-gray-500">الكمية: {item.quantity} | السعر: {item.price} ج.م</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-gray-600">الإجمالي</span>
              <span className="text-xl font-bold text-primary">{order.total} ج.م</span>
            </div>

            <div className="text-xs text-gray-400 text-center">
              تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => router.push('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    </div>
  );
}
