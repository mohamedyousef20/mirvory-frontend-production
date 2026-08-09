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
import DashboardImageSlider from "@/components/ui/DashboardImageSlider";
import { normalizeImageUrl } from "@/src/lib/normalizeImageUrl";

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.map((request) => (
                <div
                    key={request._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition-all"
                >
                    <div className="flex gap-4">
                        {/* Bigger Image */}
                        <div className="w-28 h-28 flex-shrink-0">
                            <DashboardImageSlider
                                images={
                                    request.images?.length
                                        ? request.images.map((img: string) =>
                                            normalizeImageUrl(img)
                                        )
                                        : ["/placeholder.svg"]
                                }
                                alt="product"
                                layout="square"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {language === "ar"
                                            ? request.product?.title
                                            : request.product?.titleEn ||
                                            request.product?.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-1">
                                        #{request.order?._id?.slice(-6) ||
                                            request._id.slice(-6)}
                                    </p>
                                </div>

                                <Badge className="rounded-full">
                                    {request.status === "pending" && (
                                        <Clock className="h-3 w-3 mr-1" />
                                    )}

                                    {(request.status === "approved" ||
                                        request.status === "processing") && (
                                            <Check className="h-3 w-3 mr-1" />
                                        )}

                                    {request.status === "rejected" && (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}

                                    {getReturnStatusLabel(request.status)}
                                </Badge>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-medium text-slate-500 mb-1">
                                    {language === "ar" ? "سبب الإرجاع" : "Return Reason"}
                                </p>

                                <p className="text-sm text-slate-700 line-clamp-3">
                                    {request.reason}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t pt-3">
                                <span className="text-xs text-slate-500">
                                    {language === "ar"
                                        ? "آخر تحديث"
                                        : "Last Updated"}
                                </span>

                                <span className="text-sm font-medium">
                                    {new Date(request.updatedAt).toLocaleDateString(
                                        language === "ar" ? "ar-EG" : "en-US",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}