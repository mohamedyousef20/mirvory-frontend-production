import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldCheck, ShieldAlert, Ban, CheckCircle, Trash2, Edit3 } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";

interface VendorsTabProps {
    sellers: any[];
    isArabic: boolean;
    updatingUserId: string | null;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    onDelete(id: string): void;
    onSoftDelete(id: string): void;
    onRestore(id: string): void;
    // الدوال الجديدة المضافة والمعدلة
    onToggleTrust(id: string, trusted: boolean): void;
    onUpdateBalance(id: string, balance: number, pendingBalance?: number): void;
    onUpdateStatus(id: string, trustedSeller?: boolean, approvalStatus?: 'pending' | 'approved' | 'rejected'): void;
    onToggleActive(id: string, currentStatus: boolean): void;
}

export function VendorsTab({
    sellers, isArabic, updatingUserId, pagination, onPageChange,
    onDelete, onSoftDelete, onRestore, onToggleTrust,
    onUpdateBalance, onUpdateStatus, onToggleActive
}: VendorsTabProps) {

    // دالة مساعدة لطلب إدخال الرصيد الجديد عبر prompt بسيط (يمكن استبدالها بـ Modal لاحقاً)
    const promptUpdateBalance = (sellerId: string, currentBalance: number, currentPending: number) => {
        const newBalance = prompt(isArabic ? "أدخل الرصيد الأساسي الجديد:" : "Enter new main balance:", currentBalance.toString());
        if (newBalance === null || isNaN(Number(newBalance))) return;

        const newPending = prompt(isArabic ? "أدخل الرصيد المعلق الجديد:" : "Enter new pending balance:", currentPending.toString());
        if (newPending === null || isNaN(Number(newPending))) return;

        onUpdateBalance(sellerId, Number(newBalance), Number(newPending));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                            <TableHead>{isArabic ? "البائع" : "Vendor"}</TableHead>
                            <TableHead>{isArabic ? "البريد الإلكتروني" : "Email"}</TableHead>
                            <TableHead>{isArabic ? "الهاتف" : "Phone"}</TableHead>
                            <TableHead>{isArabic ? "العنوان" : "Address"}</TableHead>
                            <TableHead>{isArabic ? "الرصيد الأساسي" : "Main Balance"}</TableHead>
                            <TableHead>{isArabic ? "الرصيد المعلق" : "Pending Balance"}</TableHead>
                            <TableHead>{isArabic ? "الحالة والتوثيق" : "Status & Trust"}</TableHead>
                            <TableHead>{isArabic ? "إجراءات الحساب" : "Account Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers && sellers.length > 0 ? (
                            
                            sellers.map((seller) => (
                                <TableRow key={seller._id}>
                                    <TableCell className="font-mono text-xs">{seller._id.substring(0, 6)}</TableCell>
                                    <TableCell className="font-medium">{seller.vendorProfile?.storeName || `${seller.firstName} ${seller.lastName}`}</TableCell>
                                    <TableCell>{seller.email}</TableCell>
                                    <TableCell>{seller.phone}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{seller.address?.governorate}</span>
                                            <span>{seller.address?.city}</span>
                                            <span className="text-gray-500">
                                                {seller.address?.addressLine}
                                            </span>
                                        </div>
                                    </TableCell>
                                    {/* عرض الرصيد الأساسي وزر تعديله */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">

                                            <span className="font-medium">
                                                {Number(seller.wallet?.balance || 0).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 3
                                                })}
                                                {seller.wallet?.currency || ' EGP'}
                                            </span>                                          <button
                                                onClick={() => promptUpdateBalance(seller._id, seller.wallet?.balance || 0, seller.wallet?.pendingBalance || 0)}
                                                className="text-slate-500 hover:text-blue-600 p-1"
                                                title={isArabic ? "تعديل الرصيد" : "Edit Balance"}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </TableCell>

                                    {/* الرصيد المعلق */}
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground">
                                            {isArabic ? "معلق: " : "Pending: "}
                                            {Number(seller.wallet?.pendingBalance || 0).toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 3
                                            })}
                                        </span>                                    </TableCell>

                                    {/* حالة التوثيق والقبول الإداري */}
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5">
                                                {seller.vendorProfile?.trustedSeller ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                                        <ShieldCheck className="h-3 w-3 mr-1 inline" /> {isArabic ? "موثوق" : "Trusted"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-slate-400">
                                                        {isArabic ? "غير موثوق" : "Untrusted"}
                                                    </Badge>
                                                )}
                                            </div>

                                            {seller.isActive ? (
                                                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                                                    {isArabic ? "نشط" : "Active"}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-400 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-red-300"></span>
                                                    {isArabic ? "غير نشط" : "Inactive"}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* أزرار الإجراءات الإدارية الصارمة */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* زر التوثيق / إلغاء التوثيق */}
                                            <button
                                                onClick={() => onUpdateStatus(seller._id, !seller.vendorProfile?.trustedSeller)}
                                                disabled={updatingUserId === seller._id}
                                                className={`px-2 py-1 text-xs rounded font-medium ${seller.vendorProfile?.trustedSeller ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}
                                            >
                                                {seller.vendorProfile?.trustedSeller ? (isArabic ? "إلغاء التوثيق" : "Untrust") : (isArabic ? "توثيق الحساب" : "Trust")}
                                            </button>

                                            {/* زر التفعيل / التعطيل الـ isActive */}
                                            <button
                                                onClick={() => onToggleActive(seller._id, seller.isActive)}
                                                disabled={updatingUserId === seller._id}
                                                className={`px-2 py-1 text-xs rounded font-medium ${seller.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                            >
                                                {seller.isActive ? (isArabic ? "تعطيل" : "Deactivate") : (isArabic ? "تفعيل" : "Activate")}
                                            </button>

                                            {/* زر الحذف النهائي للحساب */}
                                            <button
                                                onClick={() => {
                                                    if (confirm(isArabic ? "هل أنت متأكد من حذف حساب هذا البائع تماماً؟" : "Confirm permanent delete?")) {
                                                        onDelete(seller._id);
                                                    }
                                                }}
                                                disabled={updatingUserId === seller._id}
                                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                                                title={isArabic ? "حذف الحساب" : "Delete Account"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "لا توجد بيانات للبائعين بعد" : "No vendor data available yet"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* التحكم بالصفحات */}
            {sellers.length > 0 && (
                <PaginationControls
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                    className="justify-end pt-4"
                />
            )}
        </div>
    );
}