import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationControls from "@/components/pagination-controls";
import { Users, Mail, Calendar, Trash2 } from "lucide-react";

interface UsersTabProps {
    users: any[];
    isArabic: boolean;
    updatingUserId: string | null;
    pagination: { currentPage: number; totalPages: number };
    onPageChange: (page: number) => void;
    onDelete(id: string): void;
    toggleUserActive: (userId: string, isActive: boolean) => void;    onRestore(id: string): void;
}

export function UsersTab({ users, isArabic, updatingUserId, pagination, onPageChange, onDelete, toggleUserActive, onRestore }: UsersTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{isArabic ? "المعرف" : "ID"}</TableHead>
                            <TableHead>{isArabic ? "المستخدم" : "User"}</TableHead>
                            <TableHead>{isArabic ? "البريد الإلكتروني" : "Email"}</TableHead>
                            <TableHead>{isArabic ? "الهاتف" : "Phone"}</TableHead>
                            <TableHead>{isArabic ? "الدور" : "Role"}</TableHead>
                            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                            <TableHead>{isArabic ? "تاريخ التسجيل" : "Registration Date"}</TableHead>
                            <TableHead>{isArabic ? "إجراءات" : "Actions"}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users && users.length > 0 ? (
                            users.map((user: any) => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium">#{user._id?.substring(0, 6)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {user.address? `${user.address.governorate || ''}, ${user.address.city || ''}, ${user.address.addressLine || ''}`: 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                                            {isArabic
                                                ? user.role === "admin" ? "مدير"
                                                    : user.role === "seller" ? "بائع"
                                                        : "مستخدم"
                                                : user.role
                                            }
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isActive ? "default" : "destructive"}
                                            className={user.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                            }
                                        >
                                            {user.isActive ? (isArabic ? "نشط" : "Active") : (isArabic ? "غير نشط" : "Inactive")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {/* Disable / Restore */}
                                            {user.isDeleted ? (
                                                <button
                                                    onClick={() => onRestore(user._id)}
                                                    disabled={updatingUserId === user._id}
                                                    className="px-2 py-1 text-xs rounded font-medium bg-green-50 text-green-700 hover:bg-green-100 transition"
                                                >
                                                    {isArabic ? "استعادة" : "Restore"}
                                                </button>
                                            ) : (
                                                    <button
                                                        onClick={() => toggleUserActive(user._id, user.isActive)}
                                                        disabled={updatingUserId === user._id}
                                                        className={`px-2 py-1 text-xs rounded font-medium transition ${user.isActive
                                                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                                            }`}
                                                    >
                                                        {user.isActive
                                                            ? (isArabic ? "تعطيل" : "Disable")
                                                            : (isArabic ? "تفعيل" : "Activate")}
                                                    </button>
                                            )}

                                            {/* Permanent Delete */}
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            isArabic
                                                                ? "هل أنت متأكد من حذف هذا المستخدم نهائياً؟"
                                                                : "Are you sure you want to permanently delete this user?"
                                                        )
                                                    ) {
                                                        onDelete(user._id);
                                                    }
                                                }}
                                                disabled={updatingUserId === user._id}
                                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                                                title={isArabic ? "حذف المستخدم" : "Delete User"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <div className="flex flex-col items-center">
                                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {isArabic ? "لا توجد بيانات للمستخدمين بعد" : "No user data available yet"}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination */}
            {users.length > 0 && (
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