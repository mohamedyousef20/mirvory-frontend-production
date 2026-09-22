"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
import { format } from 'date-fns';
import { returnService } from '@/lib/api';
import {
    ArrowRight, Package, User, Calendar, DollarSign, AlertCircle,
    CheckCircle, Clock, XCircle, Phone, MessageSquare, RefreshCw
} from "lucide-react";

interface ReturnRequest {
    _id: string;
    user?: { _id: string; firstName: string; lastName: string; email: string; };
    order?: { _id: string; orderNumber: string; totalPrice: number; createdAt: string; };
    product?: { _id: string; title?: string; name?: string; image?: string; images?: string[]; price: number; };
    seller?: { _id: string; firstName: string; lastName: string; email: string; };
    item: string;
    reason: string;
    images: string[];
    status: 'pending' | 'approved' | 'rejected' | 'processed' | 'processing';
    refundAmount: number;
    refundStatus: string;
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
    quantity?: number;
}

interface StatusHistory {
    status: ReturnRequest['status'];
    date: string;
    note: string;
}

export default function ReturnDetailsPage() {
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchReturnDetails = async () => {
            try {
                if (!id) {
                    toast.error('معرف طلب الإرجاع غير موجود');
                    router.push('/returns');
                    return;
                }

                const response = await returnService.getReturnRequestById(id as string);
                if (response?.data || response) {
                    const data = response.data || response;
                    setReturnRequest(data);
                    generateStatusHistory(data);
                } else {
                    toast.error('لم يتم العثور على طلب الإرجاع');
                    router.push('/returns');
                }
            } catch (error) {
                console.error('Error fetching return details:', error);
                toast.error('فشل في تحميل تفاصيل طلب الإرجاع');
                router.push('/returns');
            } finally {
                setLoading(false);
            }
        };

        fetchReturnDetails();
    }, [id, router]);

    const generateStatusHistory = (returnData: ReturnRequest) => {
        const history: StatusHistory[] = [
            {
                status: 'pending',
                date: returnData.createdAt,
                note: 'تم إنشاء طلب الإرجاع وهو قيد المراجعة'
            }
        ];

        if (['approved', 'processing', 'processed'].includes(returnData.status)) {
            history.push({
                status: 'approved',
                date: returnData.updatedAt > returnData.createdAt ? returnData.updatedAt : returnData.createdAt,
                note: 'تمت الموافقة على طلب الإرجاع'
            });
        }

        if (returnData.status === 'processed') {
            history.push({
                status: 'processed',
                date: returnData.updatedAt,
                note: 'تم معالجة الإرجاع واسترداد المبلغ بنجاح'
            });
        }

        if (returnData.status === 'rejected') {
            history.push({
                status: 'rejected',
                date: returnData.updatedAt,
                note: 'تم رفض طلب الإرجاع'
            });
        }

        setStatusHistory(history);
    };

    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': 
                return { 
                    color: 'bg-amber-50 text-amber-700 border-amber-200', 
                    icon: Clock,
                    label: 'قيد المراجعة'
                };
            case 'approved': 
                return { 
                    color: 'bg-blue-50 text-blue-700 border-blue-200', 
                    icon: CheckCircle,
                    label: 'تم الموافقة'
                };
            case 'processing': 
                return { 
                    color: 'bg-indigo-50 text-indigo-700 border-indigo-200', 
                    icon: RefreshCw,
                    label: 'جاري التنفيذ'
                };
            case 'processed': 
                return { 
                    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
                    icon: CheckCircle,
                    label: 'تمت المعالجة (مكتمل)'
                };
            case 'rejected': 
                return { 
                    color: 'bg-rose-50 text-rose-700 border-rose-200', 
                    icon: XCircle,
                    label: 'مرفوض'
                };
            default: 
                return { 
                    color: 'bg-slate-50 text-slate-700 border-slate-200', 
                    icon: AlertCircle,
                    label: status
                };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleContactSupport = () => {
        router.push('/contact');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#1a4fba] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">جاري تحميل تفاصيل طلب الإرجاع...</p>
                </div>
            </div>
        );
    }

    if (!returnRequest) return null;

    const statusConfig = getStatusConfig(returnRequest.status);
    const StatusIcon = statusConfig.icon;
    const productImage = returnRequest.product?.image || (returnRequest.product?.images && returnRequest.product.images[0]) || '/placeholder-product.jpg';
    const productName = returnRequest.product?.title || returnRequest.product?.name || 'منتج غير متوفر';

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
                                <p className="text-xs text-slate-400 leading-none">إدارة المرتجعات</p>
                                <h1 className="text-base font-bold text-slate-800 leading-tight">تفاصيل طلب الإرجاع</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/returns')}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-sm">العودة</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                    {/* ── Status Card ─────────────────────────────────────── */}
                    <div className={`bg-white rounded-2xl border border-slate-100 p-6 shadow-sm ${statusConfig.color}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/50 rounded-xl">
                                    <StatusIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium opacity-80">حالة الطلب</p>
                                    <p className="text-2xl font-bold mt-1">{statusConfig.label}</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="text-sm opacity-70">رقم الطلب</p>
                                <p className="text-lg font-semibold">
                                    #{returnRequest.order?.orderNumber || returnRequest._id.slice(-8)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* ── Main Content ────────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* ── Product Information ───────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#1a4fba]" />
                                    معلومات المنتج
                                </h2>
                                <div className="flex gap-4">
                                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img 
                                            src={productImage} 
                                            alt={productName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 mb-2">{productName}</h3>
                                        <div className="space-y-1 text-sm text-slate-600">
                                            <p>السعر: {returnRequest.product?.price || 0} ج.م</p>
                                            {returnRequest.quantity && (
                                                <p>الكمية: {returnRequest.quantity}</p>
                                            )}
                                            <p>سبب الإرجاع: {returnRequest.reason}</p>
                                        </div>
                                    </div>
                                </div>

                                {returnRequest.images && returnRequest.images.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">صور الإرجاع:</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {returnRequest.images.map((img, idx) => (
                                                <img 
                                                    key={idx}
                                                    src={img} 
                                                    alt={`Return image ${idx + 1}`}
                                                    className="w-20 h-20 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                                                    onClick={() => window.open(img, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Order Information ─────────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#1a4fba]" />
                                    معلومات الطلب
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">رقم الطلب</p>
                                        <p className="font-semibold text-slate-800">
                                            #{returnRequest.order?.orderNumber || 'غير متوفر'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">تاريخ الطلب</p>
                                        <p className="font-semibold text-slate-800">
                                            {returnRequest.order?.createdAt ? formatDate(returnRequest.order.createdAt) : 'غير متوفر'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">إجمالي الطلب</p>
                                        <p className="font-semibold text-slate-800">
                                            {returnRequest.order?.totalPrice || 0} ج.م
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">تاريخ طلب الإرجاع</p>
                                        <p className="font-semibold text-slate-800">
                                            {formatDate(returnRequest.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Status History ─────────────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-[#1a4fba]" />
                                    سجل الحالة
                                </h2>
                                <div className="space-y-4">
                                    {statusHistory.map((history, idx) => {
                                        const config = getStatusConfig(history.status);
                                        const HistoryIcon = config.icon;
                                        return (
                                            <div key={idx} className="flex gap-4">
                                                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                                                    <HistoryIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800">{config.label}</p>
                                                    <p className="text-sm text-slate-600">{history.note}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{formatDate(history.date)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Rejection Reason ───────────────────────────── */}
                            {returnRequest.status === 'rejected' && returnRequest.rejectionReason && (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-rose-800 mb-2 flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        سبب الرفض
                                    </h2>
                                    <p className="text-rose-700">{returnRequest.rejectionReason}</p>
                                </div>
                            )}
                        </div>

                        {/* ── Sidebar ─────────────────────────────────────── */}
                        <div className="space-y-6">
                            
                            {/* ── Refund Information ───────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-[#1a4fba]" />
                                    معلومات الاسترداد
                                </h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">مبلغ الاسترداد</span>
                                        <span className="font-bold text-slate-800">
                                            {returnRequest.refundAmount || returnRequest.product?.price || 0} ج.م
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">حالة الاسترداد</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            returnRequest.refundStatus === 'refunded' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {returnRequest.refundStatus === 'refunded' ? 'تم الاسترداد' : 'قيد المعالجة'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Contact Information ───────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#1a4fba]" />
                                    معلومات التواصل
                                </h2>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">البائع</p>
                                        <p className="font-medium text-slate-800">
                                            {returnRequest.seller?.firstName} {returnRequest.seller?.lastName}
                                        </p>
                                        <p className="text-slate-600">{returnRequest.seller?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Actions ───────────────────────────────────── */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-800 mb-4">إجراءات</h2>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleContactSupport}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1a4fba] text-white rounded-xl hover:bg-[#1640a0] transition"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>الاتصال بالدعم</span>
                                    </button>
                                    <button
                                        onClick={() => router.push('/contact')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>مراسلة الدعم</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}