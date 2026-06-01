"use client";

import { useEffect, useMemo, useState } from "react";
import { complaintService } from "@/lib/api";
import { useLanguage } from "@/components/language-provider";
import { Loader2, Trash2, X, Eye } from "lucide-react";
import PaginationControls from "@/components/pagination-controls";
import { toast } from "sonner";
import ImageSlider from "@/components/ui/ImageSlider";

interface Complaint {
  _id: string;
  title: string;
  message?: string;
  status: "open" | "in_progress" | "resolved" | string;
  priority?: "low" | "medium" | "high" | string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  user?: {
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  adminReplies?: Array<any>;
}

export function ComplaintsTab() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const limit = 10;

  const statusOptions = useMemo(
    () => [
      { value: "open", labelAr: "مفتوحة", labelEn: "Open" },
      { value: "in_progress", labelAr: "قيد المعالجة", labelEn: "In Progress" },
      { value: "resolved", labelAr: "مغلقة", labelEn: "Resolved" },
    ],
    []
  );

  const getStatusLabel = (status: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      open: { ar: "مفتوحة", en: "Open" },
      in_progress: { ar: "قيد المعالجة", en: "In Progress" },
      resolved: { ar: "مغلقة", en: "Resolved" },
    };
    return map[status]?.[isArabic ? "ar" : "en"] || status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await complaintService.getAllComplaintsAdmin({ page, limit });

      const payload = res?.data;

      const list: Complaint[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setComplaints(list);

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
        (isArabic ? "فشل جلب الشكاوى" : "Failed to fetch complaints");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? "هل تريد حذف الشكوى؟" : "Delete complaint?")) return;

    try {
      await complaintService.deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success(isArabic ? "تم الحذف" : "Deleted");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || (isArabic ? "فشل الحذف" : "Delete failed");
      toast.error(msg);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "open" | "in_progress" | "resolved"
  ) => {
    try {
      await complaintService.updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      toast.success(isArabic ? "تم تحديث الحالة" : "Status updated");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || (isArabic ? "فشل التحديث" : "Update failed");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-destructive text-center py-6">{error}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted text-muted-foreground text-right">
                <th className="p-2">{isArabic ? "العنوان" : "Title"}</th>
                <th className="p-2">{isArabic ? "الحالة" : "Status"}</th>
                <th className="p-2">{isArabic ? "المستخدم" : "User"}</th>
                <th className="p-2">{isArabic ? "الصور" : "Images"}</th>
                <th className="p-2">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="p-2">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>

            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c._id} className="border-b text-right align-top">
                    <td className="p-2 max-w-xs">
                      <div className="font-medium truncate" title={c.title}>
                        {c.title}
                      </div>
                      {c.message && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {c.message}
                        </div>
                      )}
                    </td>

                    <td className="p-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                          c.status
                        )}`}
                      >
                        {getStatusLabel(c.status)}
                      </span>

                      <div className="mt-2">
                        <select
                          className="bg-transparent border rounded p-1 text-sm w-full max-w-[160px]"
                          value={c.status}
                          onChange={(e) =>
                            handleStatusChange(
                              c._id,
                              e.target.value as "open" | "in_progress" | "resolved"
                            )
                          }
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {isArabic ? s.labelAr : s.labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="p-2">
                      {c.user?.email ||
                        `${c.user?.firstName || ""} ${c.user?.lastName || ""}`.trim() ||
                        (isArabic ? "غير متوفر" : "N/A")}
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        <Eye className="h-4 w-4" />
                        {isArabic ? `عرض (${c.images?.length || 0})` : `View (${c.images?.length || 0})`}
                      </button>
                    </td>

                    <td className="p-2 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-destructive hover:opacity-80"
                        aria-label={isArabic ? "حذف الشكوى" : "Delete complaint"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {isArabic ? "لا توجد شكاوى" : "No complaints found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {complaints.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="justify-end pt-4"
        />
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {isArabic ? "تفاصيل الشكوى" : "Complaint Details"}
                </h3>
                <p className="text-sm text-muted-foreground">{selectedComplaint.title}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="rounded-full p-2 hover:bg-muted"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isArabic ? "الحالة" : "Status"}
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusClass(
                      selectedComplaint.status
                    )}`}
                  >
                    {getStatusLabel(selectedComplaint.status)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isArabic ? "الرسالة" : "Message"}
                  </p>
                  <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm">
                    {selectedComplaint.message || (isArabic ? "لا توجد رسالة" : "No message")}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isArabic ? "المستخدم" : "User"}
                  </p>
                  <p className="mt-2 text-sm">
                    {selectedComplaint.user?.email ||
                      `${selectedComplaint.user?.firstName || ""} ${selectedComplaint.user?.lastName || ""}`.trim() ||
                      (isArabic ? "غير متوفر" : "N/A")}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isArabic ? "تاريخ الإنشاء" : "Created At"}
                  </p>
                  <p className="mt-2 text-sm">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {isArabic ? "الصور المرفقة" : "Attached Images"}
                </p>

                {selectedComplaint.images && selectedComplaint.images.length > 0 ? (
                  <ImageSlider
                    images={selectedComplaint.images}
                    alt={selectedComplaint.title}
                    variant="modal"
                    autoplay={selectedComplaint.images.length > 1}
                    className="rounded-2xl border"
                    priority
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-2xl border bg-muted/30 text-sm text-muted-foreground">
                    {isArabic ? "لا توجد صور مرفقة" : "No images attached"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}