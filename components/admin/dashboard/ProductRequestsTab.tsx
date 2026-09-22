"use client";

import { useEffect, useMemo, useState } from "react";
import { apiServices } from "@/lib/api";
import { useLanguage } from "@/components/language-provider";
import { Loader2, Trash2, Search, Filter } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ProductRequest {
  _id: string;
  phone: string;
  size: string;
  image: string;
  status: "pending" | "contacted" | "sourcing" | "available" | "completed" | "rejected";
  adminNotes?: string;
  createdAt: string;
  user?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  guestName?: string;
  guestEmail?: string;
}

export function ProductRequestsTab() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const limit = 10;

  const statusOptions = useMemo(
    () => [
      { value: "", labelAr: "الكل", labelEn: "All" },
      { value: "pending", labelAr: "قيد الانتظار", labelEn: "Pending" },
      { value: "contacted", labelAr: "تم التواصل", labelEn: "Contacted" },
      { value: "sourcing", labelAr: "جاري البحث", labelEn: "Sourcing" },
      { value: "available", labelAr: "متوفر", labelEn: "Available" },
      { value: "completed", labelAr: "مكتمل", labelEn: "Completed" },
      { value: "rejected", labelAr: "مرفوض", labelEn: "Rejected" },
    ],
    []
  );

  const getStatusLabel = (status: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      pending: { ar: "قيد الانتظار", en: "Pending" },
      contacted: { ar: "تم التواصل", en: "Contacted" },
      sourcing: { ar: "جاري البحث", en: "Sourcing" },
      available: { ar: "متوفر", en: "Available" },
      completed: { ar: "مكتمل", en: "Completed" },
      rejected: { ar: "مرفوض", en: "Rejected" },
    };
    return map[status]?.[isArabic ? "ar" : "en"] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sourcing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiServices.unavailableProductRequestService.getAllRequests({
        page,
        limit,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });

      const payload = res?.data;

      const list: ProductRequest[] = Array.isArray(payload?.requests)
        ? payload.requests
        : Array.isArray(payload)
          ? payload
          : [];

      setRequests(list);

      const pagination = payload?.pagination;
      if (pagination) {
        setTotalPages(pagination.totalPages || 1);
        if (pagination.currentPage && pagination.currentPage !== page) {
          setPage(pagination.currentPage);
        }
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isArabic ? "فشل جلب الطلبات" : "Failed to fetch requests");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchRequests();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "هل تريد حذف هذا الطلب؟" : "Delete this request?")) return;

    try {
      await apiServices.unavailableProductRequestService.deleteRequest(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success(isArabic ? "تم الحذف" : "Deleted");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || (isArabic ? "فشل الحذف" : "Delete failed");
      toast.error(msg);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiServices.unavailableProductRequestService.updateStatus(id, { status: newStatus });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus as any } : r))
      );
      toast.success(isArabic ? "تم تحديث الحالة" : "Status updated");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || (isArabic ? "فشل التحديث" : "Update failed");
      toast.error(msg);
    }
  };

  const copy = {
    title: isArabic ? "طلبات المنتجات غير المتوفرة" : "Unavailable Product Requests",
    searchPlaceholder: isArabic ? "بحث بالهاتف أو الاسم..." : "Search by phone or name...",
    searchButton: isArabic ? "بحث" : "Search",
    image: isArabic ? "صورة المنتج" : "Product Image",
    phone: isArabic ? "رقم الهاتف" : "Phone",
    size: isArabic ? "المقاس" : "Size",
    customer: isArabic ? "العميل" : "Customer",
    date: isArabic ? "التاريخ" : "Date",
    status: isArabic ? "الحالة" : "Status",
    notes: isArabic ? "ملاحظات" : "Notes",
    delete: isArabic ? "حذف" : "Delete",
    noRequests: isArabic ? "لا توجد طلبات" : "No requests found",
    loading: isArabic ? "جاري التحميل..." : "Loading...",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{copy.title}</h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
            <Input
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full sm:w-64"
            />
            <Button onClick={handleSearch} size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={copy.status} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.slice(1).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {isArabic ? option.labelAr : option.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-10 text-destructive">
          {error}
        </div>
      )}

      {/* Requests Grid */}
      {!loading && !error && requests.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          {copy.noRequests}
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => {
            // Ensure status is never empty - fallback to 'pending' if invalid
            const safeStatus = request.status && request.status.trim() !== "" ? request.status : "pending";
            
            return (
              <Card key={request._id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Image */}
                  <div className="relative h-48 w-full rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={request.image}
                      alt="Product"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {request.user
                            ? `${request.user.firstName} ${request.user.lastName}`
                            : request.guestName || copy.customer}
                        </p>
                        {request.user?.email && (
                          <p className="text-xs text-muted-foreground">{request.user.email}</p>
                        )}
                        {request.guestEmail && (
                          <p className="text-xs text-muted-foreground">{request.guestEmail}</p>
                        )}
                      </div>
                      <Badge className={getStatusClass(safeStatus)}>
                        {getStatusLabel(safeStatus)}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{copy.phone}:</span>
                      <span className="font-medium">{request.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{copy.size}:</span>
                      <span className="font-medium">{request.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{copy.date}:</span>
                      <span className="font-medium">
                        {new Date(request.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                      </span>
                    </div>
                  </div>

                  {/* Status Change */}
                  <Select
                    value={safeStatus}
                    onValueChange={(value) => handleStatusChange(request._id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={copy.status} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.slice(1).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {isArabic ? option.labelAr : option.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Actions */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(request._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {copy.delete}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
