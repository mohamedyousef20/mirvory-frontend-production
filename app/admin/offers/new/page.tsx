"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";
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
import { ArrowRight, Package, DollarSign, Percent, Calendar, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { offerService } from '@/lib/api';
import Image from 'next/image';

export default function NewOfferPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('value', formData.value);
            formDataToSend.append('minPurchaseAmount', formData.minPurchaseAmount || '0');
            if (formData.maxDiscountAmount) {
                formDataToSend.append('maxDiscountAmount', formData.maxDiscountAmount);
            }
            formDataToSend.append('startDate', formData.startDate);
            formDataToSend.append('endDate', formData.endDate);
            if (formData.usageLimit) {
                formDataToSend.append('usageLimit', formData.usageLimit);
            }
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            await offerService.createOffer(formDataToSend);
            toast.success('تم إنشاء العرض بنجاح');
            router.push('/admin/dashboard');
        } catch (error: any) {
            console.error('Error creating offer:', error);
            toast.error(error.response?.data?.message || 'فشل في إنشاء العرض');
        } finally {
            setLoading(false);
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
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                                <h1 className="text-base font-bold text-slate-800 leading-tight">عرض جديد</h1>
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

                            {/* Value */}
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
                                    placeholder="الحد الأقصى للخصم بالجنيه"
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
                                    disabled={loading}
                                    className="bg-[#1a4fba] hover:bg-[#1640a0] flex-1"
                                >
                                    {loading ? 'جاري...' : (
                                        <>
                                            <Save className="w-4 h-4 ml-2" />
                                            حفظ العرض
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/dashboard')}
                                    disabled={loading}
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