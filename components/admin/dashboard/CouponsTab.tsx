import { MirvoryPageLoader } from "@/components/MirvoryLoader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Calendar, Percent, DollarSign, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscountAmount?: number;
    minPurchaseAmount: number;
    validFrom: string;
    validUntil: string;
    maxUses: number;
    currentUses: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CouponsTabProps {
    coupons: Coupon[];
    isArabic: boolean;
    loading?: boolean;
    error?: string | null;
    language?: string;

    // Coupon form visibility states
    showAddCoupon: boolean;
    setShowAddCoupon: (show: boolean) => void;
    editingCoupon: any;
    setEditingCoupon: (coupon: any) => void;
    newCoupon: any;
    setNewCoupon: (coupon: any) => void;

    // Action functions passed from useAdminDashboard hook
    handleCreateCoupon: () => Promise<void>;
    handleUpdateCoupon: () => Promise<void>;
    handleCouponInputChange: (field: any, value: any) => void;
    handleEditCoupon: (coupon: Coupon) => void;
    handleAddCoupon: () => void;
    handleCloseCouponForm: () => void;
    handleDeleteCoupon: (couponId: string) => void;
    onToggleStatus: (couponId: string, isActive: boolean) => void;
    fetchCoupons?: () => void;
}

export function CouponsTab({
    coupons,
    isArabic,
    loading = false,
    error = null,
    language = "en",
    showAddCoupon,
    editingCoupon,
    newCoupon,
    handleCreateCoupon,
    handleUpdateCoupon,
    handleCouponInputChange,
    handleEditCoupon,
    handleAddCoupon,
    handleCloseCouponForm,
    handleDeleteCoupon,
    onToggleStatus
}: CouponsTabProps) {

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'N/A';
        }
    };

    const getInputValueDate = (dateVal: any) => {
        if (!dateVal) return "";
        if (typeof dateVal === "string") return dateVal.split("T")[0];
        return "";
    };

    const handleToggleStatus = (couponId: string, currentStatus: boolean) => {
        if (onToggleStatus) {
            onToggleStatus(couponId, currentStatus);
        }
    };

    const isExpired = (validUntil: string) => {
        return new Date(validUntil) < new Date();
    };

    const isNotStarted = (validFrom: string) => {
        return new Date(validFrom) > new Date();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCoupon) {
            await handleUpdateCoupon();
        } else {
            await handleCreateCoupon();
        }
    };

    const getStatusBadge = (coupon: Coupon) => {
        if (!coupon.isActive) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "غير نشط" : "Inactive",
                className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            };
        }

        if (isExpired(coupon.validUntil)) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "منتهي" : "Expired",
                className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
            };
        }

        if (isNotStarted(coupon.validFrom)) {
            return {
                variant: "secondary" as const,
                text: isArabic ? "قادم" : "Upcoming",
                className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            };
        }

        if (coupon.currentUses >= coupon.maxUses) {
            return {
                variant: "destructive" as const,
                text: isArabic ? "مستنفذ" : "Used Up",
                className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
            };
        }

        return {
            variant: "default" as const,
            text: isArabic ? "نشط" : "Active",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        };
    };

    if (loading) {
        return <MirvoryPageLoader text={language === "ar" ? "جاري التحميل..." : "Loading..."} />;
    }

    if (error) {
        return (
            <div className="text-center py-8 text-destructive">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{isArabic ? "كوبونات الخصم" : "Discount Coupons"}</h2>
                <Badge variant="secondary">
                    {coupons.length} {isArabic ? "كوبون" : "coupons"}
                </Badge>
                <Button onClick={handleAddCoupon}>
                    {isArabic ? "إضافة كوبون" : "Add Coupon"}
                </Button>
            </div>

            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">{isArabic ? "الكود" : "Code"}</TableHead>
                                <TableHead>{isArabic ? "نوع الخصم" : "Discount Type"}</TableHead>
                                <TableHead>{isArabic ? "قيمة الخصم" : "Discount Value"}</TableHead>
                                <TableHead>{isArabic ? "الحد الأدنى" : "Min Purchase"}</TableHead>
                                <TableHead>{isArabic ? "الفترة" : "Validity Period"}</TableHead>
                                <TableHead>{isArabic ? "الاستخدام" : "Usage"}</TableHead>
                                <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                                <TableHead className="w-[100px] text-center">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {coupons && coupons.length > 0 ? (
                                coupons.map((coupon: Coupon) => {
                                    const statusBadge = getStatusBadge(coupon);
                                    const expired = isExpired(coupon.validUntil);
                                    const notStarted = isNotStarted(coupon.validFrom);

                                    return (
                                        <TableRow key={coupon._id} className={expired ? "opacity-60" : ""}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-lg">{coupon.code}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDate(coupon.createdAt)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center">
                                                    {coupon.discountType === "percentage" ? (
                                                        <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    ) : (
                                                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                                    )}
                                                    {coupon.discountType === "percentage"
                                                        ? (isArabic ? "نسبة مئوية" : "Percentage")
                                                        : (isArabic ? "قيمة ثابتة" : "Fixed Amount")}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {coupon.discountType === "percentage"
                                                            ? `${coupon.discountValue}%`
                                                            : `$${coupon.discountValue?.toFixed(2)}`}
                                                    </span>
                                                    {coupon.maxDiscountAmount && coupon.discountType === "percentage" && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {isArabic ? "بحد أقصى" : "Max"} ${coupon.maxDiscountAmount.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                ${coupon.minPurchaseAmount?.toFixed(2) || "0.00"}
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        {formatDate(coupon.validFrom)}
                                                    </div>
                                                    <div className="flex items-center text-sm">
                                                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                                        {formatDate(coupon.validUntil)}
                                                    </div>
                                                    {notStarted && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {isArabic ? "قادم" : "Upcoming"}
                                                        </Badge>
                                                    )}
                                                    {expired && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {isArabic ? "منتهي" : "Expired"}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {coupon.currentUses} / {coupon.maxUses || "∞"}
                                                    </span>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                                        <div
                                                            className="bg-blue-600 h-1.5 rounded-full"
                                                            style={{
                                                                width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                                    {statusBadge.text}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            {isArabic ? "تعديل" : "Edit"}
                                                        </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                                                        className={coupon.isActive ? "text-orange-600" : "text-green-600"}
                                                    >
                                                        {coupon.isActive ? (
                                                            <>
                                                                <span>🚫</span>
                                                                <span className="mr-2">{isArabic ? "إلغاء التفعيل" : "Deactivate"}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>✅</span>
                                                                <span className="mr-2">{isArabic ? "تفعيل" : "Activate"}</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteCoupon(coupon._id)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {isArabic ? "حذف" : "Delete"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Gift className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "لا توجد كوبونات حتى الآن" : "No coupons available yet"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                </div>
            </div>

            {/* Built-in Add / Edit Form Modal Overlay */}
            {showAddCoupon && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" dir={isArabic ? "rtl" : "ltr"}>
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <h3 className="text-xl font-semibold">
                                {editingCoupon
                                    ? (isArabic ? "تعديل كوبون" : "Edit Coupon")
                                    : (isArabic ? "إضافة كوبون جديد" : "Add New Coupon")}
                            </h3>
                            <button onClick={handleCloseCouponForm} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    {isArabic ? "كود الكوبون" : "Coupon Code"}
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border p-2 bg-transparent uppercase font-bold"
                                    required
                                    value={editingCoupon ? editingCoupon.code : newCoupon.code}
                                    onChange={(e) => handleCouponInputChange('code', e.target.value.toUpperCase())}
                                    placeholder="SUMMER2026"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Discount Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "نوع الخصم" : "Discount Type"}
                                    </label>
                                    <select
                                        className="w-full rounded-md border p-2 bg-transparent dark:bg-slate-900"
                                        value={editingCoupon ? editingCoupon.discountType : newCoupon.discountType}
                                        onChange={(e) => handleCouponInputChange('discountType', e.target.value)}
                                    >
                                        <option value="percentage">{isArabic ? "نسبة مئوية (%)" : "Percentage (%)"}</option>
                                        <option value="fixed">{isArabic ? "قيمة ثابتة ($)" : "Fixed Amount ($)"}</option>
                                    </select>
                                </div>

                                {/* Discount Value */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "قيمة الخصم" : "Discount Value"}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        required
                                        value={editingCoupon ? editingCoupon.discountValue : newCoupon.discountValue}
                                        onChange={(e) => handleCouponInputChange('discountValue', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Min Purchase Amount */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "الحد الأدنى للشراء" : "Min Purchase Amount"}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        required
                                        value={editingCoupon ? editingCoupon.minPurchaseAmount : newCoupon.minPurchaseAmount}
                                        onChange={(e) => handleCouponInputChange('minPurchaseAmount', Number(e.target.value))}
                                    />
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "الحد الأقصى للاستخدام" : "Max Uses"}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        required
                                        value={editingCoupon ? editingCoupon.maxUses : newCoupon.maxUses}
                                        onChange={(e) => handleCouponInputChange('maxUses', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Max Discount Amount (Only for percentage types) */}
                            {((editingCoupon ? editingCoupon.discountType : newCoupon.discountType) === 'percentage') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "الحد الأقصى لقيمة الخصم (اختياري)" : "Max Discount Amount (Optional)"}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        value={editingCoupon ? (editingCoupon.maxDiscountAmount || '') : (newCoupon.maxDiscountAmount || '')}
                                        onChange={(e) => handleCouponInputChange('maxDiscountAmount', e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Valid From */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "تاريخ البدء" : "Valid From"}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        required
                                        value={getInputValueDate(editingCoupon ? editingCoupon.validFrom : newCoupon.validFrom)}
                                        onChange={(e) => handleCouponInputChange('validFrom', e.target.value)}
                                    />
                                </div>

                                {/* Valid Until */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        {isArabic ? "تاريخ الانتهاء" : "Valid Until"}
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full rounded-md border p-2 bg-transparent"
                                        required
                                        value={getInputValueDate(editingCoupon ? editingCoupon.validUntil : newCoupon.validUntil)}
                                        onChange={(e) => handleCouponInputChange('validUntil', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={handleCloseCouponForm}>
                                    {isArabic ? "إلغاء" : "Cancel"}
                                </Button>
                                <Button type="submit">
                                    {isArabic ? "حفظ" : "Save"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}