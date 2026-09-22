"use client"

// app/admin/offers/[id]/edit/page.tsx

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
import { ArrowRight, Package, DollarSign, Percent, Calendar, Save, X, Image as ImageIcon } from "lucide-react";
import Image from 'next/image';

export default function EditOfferPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [deleteImage, setDeleteImage] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'percentage',
        value: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        startDate: '',
        endDate: '',
        usageLimit: ''
    });

    const isFreeShipping = formData.type === 'free_shipping';

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                const response = await offerService.getOfferById(id as string);
                const data = response.data || response;
                setFormData({
                    title: data.title ?? '',
                    description: data.description ?? '',
                    type: data.type ?? 'percentage',
                    value: data.value != null ? String(data.value) : '',
                    minPurchaseAmount: data.minPurchaseAmount != null ? String(data.minPurchaseAmount) : '',
                    maxDiscountAmount: data.maxDiscountAmount != null ? String(data.maxDiscountAmount) : '',
                    startDate: data.startDate.split('T')[0],
                    endDate: data.endDate.split('T')[0],
                    usageLimit: data.usageLimit != null ? String(data.usageLimit) : ''
                });
                if (data.image) {
                    setImagePreview(data.image);
                }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side checks (the backend re-validates, but this saves a round trip)
        if (formData.endDate < formData.startDate) {
            toast.error('تاريخ النهاية يجب ألا يكون قبل تاريخ البداية');
            return;
        }

        const value = isFreeShipping ? 0 : Number(formData.value);

        if (formData.type === 'percentage' && (value < 0 || value > 100)) {
            toast.error('قيمة النسبة المئوية يجب أن تكون بين 0 و 100');
            return;
        }

        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('value', String(value));
            formDataToSend.append('minPurchaseAmount', String(Number(formData.minPurchaseAmount) || 0));
            if (formData.maxDiscountAmount !== '') {
                formDataToSend.append('maxDiscountAmount', formData.maxDiscountAmount);
            }
            if (formData.usageLimit !== '') {
                formDataToSend.append('usageLimit', formData.usageLimit);
            }
            formDataToSend.append('startDate', formData.startDate);
            formDataToSend.append('endDate', new Date(`${formData.endDate}T23:59:59.999`).toISOString());
            if (deleteImage) {
                formDataToSend.append('deleteImage', 'true');
            }
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            await offerService.updateOffer(id as string, formDataToSend);
            toast.success('تم تحديث العرض بنجاح');
            router.push(`/admin/offers/${id}`);
        } catch (error: any) {
            console.error('Error updating offer:', error);
            toast.error(error.response?.data?.message || 'فشل في تحديث العرض');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('يجب أن تكون الصورة بصيغة صورة');
                return;
            }
            setImageFile(file);
            setDeleteImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setDeleteImage(true);
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                                <h1 className="text-base font-bold text-slate-800 leading-tight">تعديل العرض</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push(`/admin/offers/${id}`)}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-sm">العودة</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">عنوان العرض *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    placeholder="أدخل عنوان العرض"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">وصف العرض *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="اكتب وصف العرض"
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">نوع العرض *</Label>
                                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                                        <SelectItem value="buy_x_get_y">اشترِ واحصل</SelectItem>
                                        <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value (not needed for free shipping) */}
                            {isFreeShipping ? (
                                <p className="text-xs text-slate-400">
                                    الشحن المجاني لا يحتاج إلى قيمة.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="value" className="flex items-center gap-2">
                                        {formData.type === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                        القيمة *
                                    </Label>
                                    <Input
                                        id="value"
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => handleChange('value', e.target.value)}
                                        placeholder={formData.type === 'percentage' ? 'نسبة مئوية (0-100)' : 'المبلغ بالجنيه'}
                                        required
                                        min="0"
                                        max={formData.type === 'percentage' ? 100 : undefined}
                                    />
                                </div>
                            )}

                            {/* Min Purchase Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="minPurchaseAmount">الحد الأدنى للشراء</Label>
                                <Input
                                    id="minPurchaseAmount"
                                    type="number"
                                    value={formData.minPurchaseAmount}
                                    onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
                                    placeholder="الحد الأدنى للشراء بالجنيه"
                                    min="0"
                                />
                            </div>

                            {/* Max Discount Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="maxDiscountAmount">الحد الأقصى للخصم</Label>
                                <Input
                                    id="maxDiscountAmount"
                                    type="number"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) => handleChange('maxDiscountAmount', e.target.value)}
                                    placeholder="اتركه فارغاً بلا حد"
                                    min="0"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        تاريخ البداية *
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate" className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        تاريخ النهاية *
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        min={formData.startDate || undefined}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Usage Limit */}
                            <div className="space-y-2">
                                <Label htmlFor="usageLimit">حد الاستخدام</Label>
                                <Input
                                    id="usageLimit"
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => handleChange('usageLimit', e.target.value)}
                                    placeholder="اتركه فارغاً بلا حد"
                                    min="0"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">صورة العرض</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <Image
                                                src={imagePreview}
                                                alt="Offer preview"
                                                width={200}
                                                height={200}
                                                className="rounded-lg object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-8 w-8"
                                                onClick={handleRemoveImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                                            <p className="text-sm text-slate-600 mb-2">اسحب وأفلت صورة هنا أو</p>
                                            <label htmlFor="image-upload" className="cursor-pointer">
                                                <span className="text-[#1a4fba] font-medium hover:underline">
                                                    اختر ملف
                                                </span>
                                            </label>
                                            <input
                                                id="image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                            <p className="text-xs text-slate-400 mt-2">PNG, JPG حتى 5 ميجابايت</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#1a4fba] hover:bg-[#1640a0] flex-1"
                                >
                                    {submitting ? 'جاري...' : (
                                        <>
                                            <Save className="w-4 h-4 ml-2" />
                                            حفظ التغييرات
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/admin/offers/${id}`)}
                                    disabled={submitting}
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}