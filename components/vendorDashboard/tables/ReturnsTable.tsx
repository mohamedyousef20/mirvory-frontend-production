import { Package, Clock, Check, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";

import { SafeImage } from "@/components/SafeImage";

interface ReturnsTableProps {
    data: any[];
    language: string;
    getReturnStatusLabel: (status: string) => string;
    emptyTitle: string;
    emptyDescription: string;
}

export function ReturnsTable({
    data,
    language,
    getReturnStatusLabel,
    emptyTitle,
    emptyDescription
}: ReturnsTableProps) {

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Package className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-700">
                    {emptyTitle}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    {emptyDescription}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">

            <div className="overflow-x-auto">

                <Table>

                    {/* HEADER */}
                    <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">

                            <TableHead>
                                {language === "ar" ? "الطلب" : "Order"}
                            </TableHead>

                            <TableHead className="hidden md:table-cell">
                                {language === "ar" ? "المنتج" : "Product"}
                            </TableHead>

                            <TableHead className="hidden md:table-cell">
                                {language === "ar" ? "السبب" : "Reason"}
                            </TableHead>

                            <TableHead>
                                {language === "ar" ? "الحالة" : "Status"}
                            </TableHead>

                            <TableHead className="hidden md:table-cell">
                                {language === "ar" ? "آخر تحديث" : "Updated"}
                            </TableHead>

                        </TableRow>
                    </TableHeader>

                    {/* BODY */}
                    <TableBody>

                        {data.map((request) => (
                            <TableRow
                                key={request._id}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                            >

                                {/* ORDER ID */}
                                <TableCell>

                                    <div className="flex flex-col">

                                        <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                            #{request.order?._id?.slice(-6) || request._id.slice(-6)}
                                        </span>

                                        {/* mobile reason preview */}
                                        <span className="text-xs text-slate-400 md:hidden truncate max-w-[140px]">
                                            {request.reason}
                                        </span>

                                    </div>

                                </TableCell>

                                {/* PRODUCT */}
                                <TableCell className="hidden md:table-cell">

                                    <div className="flex items-center gap-2">

                                        <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-200">

                                            <SafeImage
                                                src={request.images?.[0] || "/placeholder.svg"}
                                                alt="product"
                                                width={36}
                                                height={36}
                                                className="object-cover"
                                            />

                                        </div>

                                        <div className="flex flex-col">

                                            <span className="text-sm font-medium text-slate-800">
                                                {language === "ar"
                                                    ? request.product?.title
                                                    : request.product?.titleEn || request.product?.title || "—"}
                                            </span>

                                        </div>

                                    </div>

                                </TableCell>

                                {/* REASON */}
                                <TableCell className="hidden md:table-cell">
                                    <span className="text-sm text-slate-600 max-w-[200px] truncate block">
                                        {request.reason}
                                    </span>
                                </TableCell>

                                {/* STATUS */}
                                <TableCell>

                                    <Badge
                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full w-fit border"
                                    >

                                        {request.status === "pending" && (
                                            <Clock className="h-3 w-3 text-amber-500" />
                                        )}

                                        {(request.status === "approved" ||
                                            request.status === "processing") && (
                                                <Check className="h-3 w-3 text-green-500" />
                                            )}

                                        {request.status === "rejected" && (
                                            <XCircle className="h-3 w-3 text-red-500" />
                                        )}

                                        {getReturnStatusLabel(request.status)}

                                    </Badge>

                                </TableCell>

                                {/* UPDATED */}
                                <TableCell className="hidden md:table-cell text-sm text-slate-500">
                                    {new Date(request.updatedAt).toLocaleDateString(
                                        language === "ar" ? "ar-EG" : "en-US",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}
                                </TableCell>

                            </TableRow>
                        ))}

                    </TableBody>

                </Table>

            </div>

        </div>
    );
}