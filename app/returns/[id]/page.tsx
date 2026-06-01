"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from "sonner";
import { format } from 'date-fns';
import { returnService } from '@/lib/api';
import { MirvoryPageLoader } from '@/components/MirvoryLoader';

interface ReturnRequest {
    _id: string;
    user?: { _id: string; firstName: string; lastName: string; email: string; };
    order?: { _id: string; orderNumber: string; totalPrice: number; };
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'processed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'قيد المراجعة';
            case 'approved': return 'تم الموافقة';
            case 'processing': return 'جاري التنفيذ';
            case 'processed': return 'تمت المعالجة (مكتمل)';
            case 'rejected': return 'مرفوض';
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '⏳';
            case 'approved': return '✅';
            case 'processing': return '🔄';
            case 'processed': return '💸';
            case 'rejected': return '❌';
            default: return '📋';
        }
    };

    const handleContactSupport = () => {
        router.push('/contact');
    };

    const handleDeleteReturn = async () => {
        if (!returnRequest) return;
        if (confirm('هل أنت متأكد من حذف طلب الإرجاع هذا؟')) {
            try {
                await returnService.deleteReturnRequest(returnRequest._id);
                toast.success('تم حذف طلب الإرجاع بنجاح');
                router.push('/returns');
            } catch (error) {
                console.error('Error deleting return request:', error);
                toast.error('فشل في حذف طلب الإرجاع');
            }
        }
    };

    if (loading) return <MirvoryPageLoader text={"جاري تحميل تفاصيل طلب الإرجاع..."} />;
    if (!returnRequest) return null;

    const productImage = returnRequest.product?.image || (returnRequest.product?.images && returnRequest.product.images[0]) || '/placeholder-product.jpg';
    const productName = returnRequest.product?.title || returnRequest.product?.name || 'منتج غير متوفر';

    return (
        <div className="container mx-auto px-4 py-8" dir="rtl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div>
                    <button onClick={() => router.push('/returns')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors">
                        <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        العودة إلى طلبات الإرجاع
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">تفاصيل طلب الإرجاع</h1>
                    <p className="text-gray-600 mt-2">
                        رقم الطلب الأصلي: {returnRequest.order?.orderNumber ? `#${returnRequest.order.orderNumber}` : 'غير متوفر'}
                    </p>
                </div>
                <div className="flex gap-3 mt-4 lg:mt-0">
                    <button onClick={handleContactSupport} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        الاتصال بالدعم
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">حالة طلب الإرجاع</h2>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(returnRequest.status)}`}>
                                {getStatusText(returnRequest.status)}
                            </span>
                        </div>

                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {statusHistory.map((historyItem, index) => (
                                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${getStatusColor(historyItem.status)}`}>
                                        {getStatusIcon(historyItem.status)}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-slate-900">{getStatusText(historyItem.status)}</h3>
                                            <time className="text-xs font-medium text-slate-500" dir="ltr">
                                                {format(new Date(historyItem.date), 'yyyy/MM/dd - hh:mm a')}
                                            </time>
                                        </div>
                                        <div className="text-sm text-slate-600">{historyItem.note}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">معلومات المنتج المرتجع</h2>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                                <img
                                    src={productImage}
                                    alt={productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.jpg'; }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{productName}</h3>
                                <div className="grid sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <span className="text-gray-500 block mb-1">سعر المنتج</span>
                                        <p className="font-semibold text-gray-900">{returnRequest.product?.price || 0} ج.م</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block mb-1">الكمية المسترجعة</span>
                                        <p className="font-semibold text-gray-900">{returnRequest.quantity || 1}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">تفاصيل الإرجاع</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">سبب الإرجاع المذكور:</h3>
                                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg text-gray-800 leading-relaxed">
                                    {returnRequest.reason}
                                </div>
                            </div>
                            
                            {returnRequest.images && returnRequest.images.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-700 mb-3">الصور المرفقة:</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {returnRequest.images.map((img, idx) => (
                                            <a href={img} target="_blank" rel="noreferrer" key={idx} className="block w-24 h-24 border rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                                                <img src={img} alt={`مرفق ${idx + 1}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {returnRequest.rejectionReason && returnRequest.status === 'rejected' && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-red-700 mb-2">سبب الرفض (من الإدارة):</h3>
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-800 leading-relaxed">
                                        {returnRequest.rejectionReason}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-4 border-b">معلومات الطلب</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">رقم الطلب:</span>
                                <span className="font-medium text-gray-900">{returnRequest.order?.orderNumber ? `#${returnRequest.order.orderNumber}` : 'غير متوفر'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">تاريخ الطلب:</span>
                                <span className="font-medium text-gray-900 text-sm" dir="ltr">{format(new Date(returnRequest.createdAt), 'yyyy/MM/dd')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-4 border-b">إجراءات</h2>
                        <div className="space-y-3">
                            <button onClick={handleContactSupport} className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                تواصل مع خدمة العملاء
                            </button>
                            
                            {(returnRequest.status === 'pending' || returnRequest.status === 'approved') && (
                                <button onClick={handleDeleteReturn} className="w-full py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium border border-transparent hover:border-red-200">
                                    إلغاء طلب الإرجاع
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}