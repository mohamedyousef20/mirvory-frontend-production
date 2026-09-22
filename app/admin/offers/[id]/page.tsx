"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { offerService } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Package, DollarSign, Percent, Calendar, Edit, Trash2, Download } from "lucide-react";

interface Offer {
    _id: string;
    title: string;
    description: string;
    type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'free_shipping';
    value: number;
    minPurchaseAmount: number;
    maxDiscountAmount: number | null;
    startDate: string;
    endDate: string;
    isActive: boolean;
    usageLimit: number | null;
    usageCount: number;
    image: string;
    createdAt: string;
    createdBy?: {
        firstName: string;
        lastName: string;
    };
    updatedBy?: {
        firstName: string;
        lastName: string;
    };
}

export default function OfferDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await offerService.getOfferById(id as string);
                const data = response.data || response;
                setOffer(data);
            } catch (error: any) {
                console.error('Error fetching offer:', error);
                toast.error('فشل في تحميل تفاصيل العرض');
                router.push('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchOffer();
    }, [id, router]);

    const handleEdit = () => {
        router.push(`/admin/offers/${id}/edit`);
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

        try {
            await offerService.deleteOffer(id as string);
            toast.success('تم حذف العرض بنجاح');
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error('Error deleting offer:', error);
            toast.error('فشل في حذف العرض');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await offerService.toggleOfferStatus(id as string);
            toast.success('تم تحديث حالة العرض');
            const response = await offerService.getOfferById(id as string);
            setOffer(response.data || response);
        } catch (error: any) {
            console.error('Error toggling offer status:', error);
            toast.error('فشل في تحديث حالة العرض');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#1a4fba] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">جاري تحميل تفاصيل العرض...</p>
                </div>
            </div>
        );
    }

    if (!offer) return null;

    return (
        <>
            {/* ── Google Fonts (Cairo) ─────────────────────────────────────── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
                * { font-family: 'Cairo', sans-serif !important; }
            `}</style>

            <div className="min-h-screen bg-[#f4f6fb]" dir="rtl">
                {/* ── Top bar ────────────────────────────────────────────── */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1a4fba] flex items-center justify-center shadow-md shadow-blue-200">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 leading-none">لوحة تحكم المشرف</p>
                                <h1 className="text-base font-bold text-slate-800 leading-tight">تفاصيل العرض</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/admin/dashboard')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-sm">العودة للوحة التحكم</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-800">{offer.title}</h2>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEdit}
                                    >
                                        <Edit className="w-4 h-4 ml-2" />
                                        تعديل
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="w-4 h-4 ml-2" />
                                        حذف
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6">
                                <p className="text-slate-700">{offer.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">النوع</p>
                                    <p className="font-semibold text-slate-800">
                                        {offer.type === 'percentage' ? 'نسبة مئوية' : 
                                         offer.type === 'fixed' ? 'مبلغ ثابت' : 
                                         offer.type === 'buy_x_get_y' ? 'اشترِ واحصل' : 'شحن مجاني'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">القيمة</p>
                                    <p className="font-semibold text-slate-800">
                                        {offer.type === 'percentage' ? `${offer.value}%` : `${offer.value} ج.م`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">الحد الأدنى للشراء</p>
                                    <p className="font-semibold text-slate-800">{offer.minPurchaseAmount} ج.م</p>
                                </div>
                                <div>
                                        <p className="text-sm text-slate-500 mb-1">الحد الأقصى للخصم</p>
                                        <p className="font-semibold text-slate-800">
                                            {offer.maxDiscountAmount ? `${offer.maxDiscountAmount} ج.م` : 'غير محدود'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ البداية</p>
                                        <p className="font-semibold text-slate-800">{formatDate(offer.startDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">تاريخ النهاية</p>
                                        <p className="font-semibold text-slate-800">{formatDate(offer.endDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">الاستخدام</p>
                                        <p className="font-semibold text-slate-800">
                                            {offer.usageCount}
                                            {offer.usageLimit && ` / ${offer.usageLimit}`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1">الحالة</p>
                                        <p className={`font-semibold ${offer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {offer.isActive ? 'نشط' : 'غير نشط'}
                                        </p>
                                    </div>
                                </div>

                                {offer.image && (
                                    <div>
                                        <p className="text-sm text-slate-500 mb-2">صورة العرض</p>
                                        <img 
                                            src={offer.image} 
                                            alt={offer.title}
                                            className="w-full max-w-md rounded-lg border border-slate-200"
                                        />
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-200">
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.print()}
                                        >
                                            <Download className="w-4 h-4 ml-2" />
                                            طباعة
                                        </Button>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </div>
        </>
    );
}