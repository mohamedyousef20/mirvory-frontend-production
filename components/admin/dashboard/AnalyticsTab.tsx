"use client";

/**
 * AnalyticsTab.tsx — MIRVORY Admin Analytics
 * Full analytics dashboard: KPIs, charts, tables, filters, export.
 * Recharts for all charts. RTL-first, Arabic UI.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  TrendingUp, TrendingDown, Minus,
  RefreshCw, Download, ChevronDown, ChevronUp,
  ShoppingBag, CheckCircle, Clock, Truck, XCircle,
  DollarSign, BarChart2, Users, AlertTriangle, Package,
  MapPin, CreditCard, Loader2, Tag, Star, Eye, EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiMetric { value: number; delta: number }

interface AnalyticsData {
  period: { current: any; previous: any };
  kpi: {
    totalOrders: KpiMetric;
    delivered: KpiMetric;
    pending: KpiMetric;
    shipped: KpiMetric;
    cancelled: KpiMetric;
    totalRevenue: KpiMetric;
    totalDiscount: KpiMetric;
    totalShipping: KpiMetric;
    netRevenue: KpiMetric;
    avgOrderValue: KpiMetric;
    uniqueCustomers: KpiMetric;
    completionRate: KpiMetric;
    cancellationRate: KpiMetric;
  };
  customerSummary: {
    total: number;
    repeat: number;
    newCount: number;
    avgOrdersPerCustomer: number;
    avgSpendPerCustomer: number;
  };
  salesOverTime: Array<{ _id: any; orders: number; revenue: number; avgOrderValue: number }>;
  statusDistribution: Array<{ _id: string; count: number }>;
  productPerformance: Array<{
    _id: string; title: string;
    ordersCount: number; qtySold: number; revenue: number; avgPrice: number;
    totalDiscount: number; cancelledCount: number; cancelRate: number;
  }>;
  sizeAnalysis: Array<{
    _id: string; ordersCount: number; qtySold: number; cancelledCount: number; cancelRate: number;
  }>;
  colorAnalysis: Array<{
    _id: string; ordersCount: number; qtySold: number; cancelledCount: number; cancelRate: number;
  }>;
  governorateAnalysis: Array<{
    _id: string; ordersCount: number; revenue: number; avgOrder: number;
    delivered: number; cancelled: number; customerCount: number;
    completionRate: number; rejectionRate: number;
  }>;
  paymentBreakdown: Array<{ _id: string; count: number; revenue: number }>;
  topCustomers: Array<{
    _id: string; name: string; phone?: string;
    ordersCount: number; totalSpent: number; lastOrder: string; avgOrder: number; isGuest?: boolean;
  }>;
  detailedOrders: Array<{
    _id?: string; orderNumber: string; createdAt: string; deliveredAt?: string;
    deliveryStatus: string; paymentMethod: string;
    customerName: string; customerPhone: string;
    productTitle: string; size?: string; colorName?: string;
    quantity: number; unitPrice: number; lineTotal: number;
    discount: number; shippingFee: number; orderTotal: number;
    address?: string; deliveryDays?: number;
  }>;
  shippingStats: {
    totalShippingCost: number; avgShipping: number;
    shippedOrders: number; deliveredOrders: number; cancelledOrders: number;
    totalOrders: number; rejectionRate: number; avgDeliveryDays?: number;
  } | null;
  alerts: {
    topSellers: any[];
    lowSellers: any[];
    topSizes: any[];
    topColors: any[];
    highCancelRate: any[];
    topGovernoratesBySales: any[];
    highRejectionGovernorateS: any[];
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  delivered:  "#22c55e",
  pending:    "#f59e0b",
  shipped:    "#3b82f6",
  cancelled:  "#ef4444",
  returned:   "#8b5cf6",
  rejected:   "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  delivered:  "مكتمل",
  pending:    "قيد التجهيز",
  shipped:    "قيد الشحن",
  cancelled:  "ملغي",
  returned:   "مرتجع",
  rejected:   "مرفوض",
};

const PIE_COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#f97316", "#06b6d4"];

const PERIOD_OPTIONS = [
  { value: "today",     label: "اليوم" },
  { value: "yesterday", label: "أمس" },
  { value: "last7",     label: "آخر 7 أيام" },
  { value: "last30",    label: "آخر 30 يوم" },
  { value: "thisMonth", label: "هذا الشهر" },
  { value: "lastMonth", label: "الشهر السابق" },
  { value: "custom",    label: "مخصص" },
];

const EGP = (n?: number | null) =>
  n == null ? "—" : `${n.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;

const PCT = (n?: number | null) =>
  n == null ? "—" : `${n.toFixed(1)}%`;

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG") : "—";

const fmtTimeLabel = (entry: any) => {
  if (entry._id?.day)   return `${entry._id.day}/${entry._id.month}`;
  if (entry._id?.week)  return `أ${entry._id.week}/${entry._id.year}`;
  if (entry._id?.month) return `${entry._id.month}/${entry._id.year}`;
  return "";
};

// ─── Delta Badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
  const pos = delta > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${pos ? "text-emerald-600" : "text-red-500"}`}>
      {pos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pos ? "+" : ""}{delta}%
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title, value, delta, icon: Icon, color = "bg-primary/10", format = "number"
}: {
  title: string;
  value: number;
  delta: number;
  icon: React.ElementType;
  color?: string;
  format?: "number" | "currency" | "percent";
}) {
  const display = format === "currency" ? EGP(value)
    : format === "percent" ? PCT(value)
    : value.toLocaleString("ar-EG");

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${color}`}>
            <Icon className="h-4 w-4 text-foreground/70" />
          </div>
          <DeltaBadge delta={delta} />
        </div>
        <div className="mt-3">
          <p className="text-xs text-muted-foreground leading-tight">{title}</p>
          <p className="text-xl font-bold mt-0.5 leading-tight">{display}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Section Wrapper (collapsible) ───────────────────────────────────────────

function Section({
  title, icon: Icon, children, defaultOpen = true
}: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between py-3 px-4 select-none"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      {open && <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>}
    </Card>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function Empty({ msg = "لا توجد بيانات كافية" }: { msg?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
      <BarChart2 className="h-8 w-8 opacity-30" />
      <p className="text-sm">{msg}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AnalyticsTabProps {
  // Legacy props kept for backward-compat with AdminDashboard (unused in new version)
  analytics?: any;
  analyticsLoading?: boolean;
  analyticsError?: string | null;
  fetchAdminAnalytics?: () => Promise<void>;
  isArabic: boolean;
}

export function AnalyticsTab({ isArabic }: AnalyticsTabProps) {
  // ── Filters ────────────────────────────────────────────────────────────────
  const [period, setPeriod]     = useState("last30");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [govFilter, setGovFilter]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [sizeFilter, setSizeFilter]   = useState("");
  const [colorFilter, setColorFilter] = useState("");
  const [groupBy, setGroupBy]   = useState("day");

  // ── Data State ─────────────────────────────────────────────────────────────
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // ── Charts State ──────────────────────────────────────────────────────────
  const [salesMetric, setSalesMetric] = useState<"revenue" | "orders" | "avgOrderValue">("revenue");
  const [productSort, setProductSort] = useState<"revenue" | "qtySold" | "ordersCount" | "cancelRate">("revenue");

  // ── Orders Table State ────────────────────────────────────────────────────
  const [orderSearch, setOrderSearch]   = useState("");
  const [orderPage, setOrderPage]       = useState(1);
  const [orderSortCol, setOrderSortCol] = useState<string>("createdAt");
  const [orderSortDir, setOrderSortDir] = useState<"asc" | "desc">("desc");
  const ORDER_PAGE_SIZE = 20;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ period, groupBy });
      if (period === "custom" && fromDate) params.append("from", fromDate);
      if (period === "custom" && toDate)   params.append("to",   toDate);
      if (govFilter)     params.append("governorate",   govFilter);
      if (statusFilter)  params.append("deliveryStatus", statusFilter);
      if (paymentFilter) params.append("paymentMethod",  paymentFilter);
      if (productFilter) params.append("productId",      productFilter);
      if (sizeFilter)    params.append("size",   sizeFilter);
      if (colorFilter)   params.append("color",  colorFilter);

      const res = await fetch(`/api/analytics/admin/full?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || "خطأ في جلب البيانات");
      }
    } catch (e: any) {
      setError("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }, [period, fromDate, toDate, govFilter, statusFilter, paymentFilter, productFilter, sizeFilter, colorFilter, groupBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived: sales chart data ──────────────────────────────────────────────
  const salesChartData = useMemo(() =>
    (data?.salesOverTime || []).map(e => ({
      label: fmtTimeLabel(e),
      revenue: Math.round(e.revenue),
      orders: e.orders,
      avgOrderValue: Math.round(e.avgOrderValue || 0),
    })), [data]);

  // ── Derived: status donut ──────────────────────────────────────────────────
  const statusChartData = useMemo(() => {
    const dist = data?.statusDistribution || [];
    const total = dist.reduce((s, d) => s + d.count, 0);
    return dist.map(d => ({
      name: STATUS_LABELS[d._id] || d._id,
      value: d.count,
      pct: total > 0 ? ((d.count / total) * 100).toFixed(1) : "0",
      color: STATUS_COLORS[d._id] || "#94a3b8",
    }));
  }, [data]);

  // ── Derived: sorted products ───────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    const p = [...(data?.productPerformance || [])];
    if (productSort === "revenue")    p.sort((a, b) => b.revenue - a.revenue);
    if (productSort === "qtySold")    p.sort((a, b) => b.qtySold - a.qtySold);
    if (productSort === "ordersCount") p.sort((a, b) => b.ordersCount - a.ordersCount);
    if (productSort === "cancelRate") p.sort((a, b) => b.cancelRate - a.cancelRate);
    return p;
  }, [data, productSort]);

  // ── Derived: filtered+sorted orders table ─────────────────────────────────
  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    let rows = data?.detailedOrders || [];
    if (q) {
      rows = rows.filter(o =>
        [o.orderNumber, o.customerName, o.customerPhone, o.productTitle, o.address]
          .some(f => (f || "").toLowerCase().includes(q))
      );
    }
    const col = orderSortCol as keyof typeof rows[0];
    rows = [...rows].sort((a, b) => {
      const av = (a as any)[col];
      const bv = (b as any)[col];
      if (av == null) return 1;
      if (bv == null) return -1;
      return orderSortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return rows;
  }, [data, orderSearch, orderSortCol, orderSortDir]);

  const pagedOrders = useMemo(() =>
    filteredOrders.slice((orderPage - 1) * ORDER_PAGE_SIZE, orderPage * ORDER_PAGE_SIZE),
  [filteredOrders, orderPage]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE));

  // ── Sort handler for orders table ─────────────────────────────────────────
  const handleOrderSort = (col: string) => {
    if (col === orderSortCol) setOrderSortDir(d => d === "asc" ? "desc" : "asc");
    else { setOrderSortCol(col); setOrderSortDir("desc"); }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = (rows: any[], filename: string, cols: { key: string; label: string }[]) => {
    const header = cols.map(c => c.label).join(",");
    const body   = rows.map(r => cols.map(c => {
      const v = r[c.key];
      const s = v == null ? "" : String(v);
      return s.includes(",") ? `"${s}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const exportOrders = () => exportCSV(filteredOrders, "orders", [
    { key: "orderNumber",    label: "رقم الطلب" },
    { key: "customerName",   label: "اسم العميل" },
    { key: "customerPhone",  label: "رقم الهاتف" },
    { key: "productTitle",   label: "المنتج" },
    { key: "size",           label: "المقاس" },
    { key: "colorName",      label: "اللون" },
    { key: "quantity",       label: "الكمية" },
    { key: "unitPrice",      label: "سعر الوحدة" },
    { key: "discount",       label: "الخصم" },
    { key: "shippingFee",    label: "الشحن" },
    { key: "orderTotal",     label: "إجمالي الطلب" },
    { key: "deliveryStatus", label: "الحالة" },
    { key: "address",        label: "العنوان" },
    { key: "paymentMethod",  label: "طريقة الدفع" },
    { key: "createdAt",      label: "تاريخ الطلب" },
    { key: "deliveredAt",    label: "تاريخ التسليم" },
    { key: "deliveryDays",   label: "مدة التوصيل (أيام)" },
  ]);

  const exportProducts = () => exportCSV(data?.productPerformance || [], "products", [
    { key: "title",         label: "المنتج" },
    { key: "ordersCount",   label: "عدد الطلبات" },
    { key: "qtySold",       label: "الكمية المباعة" },
    { key: "revenue",       label: "إجمالي المبيعات" },
    { key: "avgPrice",      label: "متوسط السعر" },
    { key: "totalDiscount", label: "الخصومات" },
    { key: "cancelledCount",label: "الملغي" },
    { key: "cancelRate",    label: "نسبة الإلغاء%" },
  ]);

  const exportCustomers = () => exportCSV(data?.topCustomers || [], "customers", [
    { key: "name",        label: "اسم العميل" },
    { key: "phone",       label: "رقم الهاتف" },
    { key: "ordersCount", label: "عدد الطلبات" },
    { key: "totalSpent",  label: "إجمالي الإنفاق" },
    { key: "lastOrder",   label: "آخر طلب" },
    { key: "avgOrder",    label: "متوسط الطلب" },
  ]);

  const exportGovernorateS = () => exportCSV(data?.governorateAnalysis || [], "governorates", [
    { key: "_id",           label: "المحافظة" },
    { key: "ordersCount",   label: "عدد الطلبات" },
    { key: "customerCount", label: "العملاء" },
    { key: "revenue",       label: "إجمالي المبيعات" },
    { key: "avgOrder",      label: "متوسط الطلب" },
    { key: "delivered",     label: "مكتمل" },
    { key: "cancelled",     label: "ملغي" },
    { key: "completionRate",label: "نسبة الإتمام%" },
    { key: "rejectionRate", label: "نسبة الرفض%" },
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div dir="rtl" className="space-y-5 pb-16">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">التحليلات</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            مركز البيانات الشامل لمتجر MIRVORY
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchData}
          disabled={loading}
          className="gap-1.5 w-fit"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
          تحديث
        </Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            الفلاتر
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* Period */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs text-muted-foreground mb-1 block">الفترة الزمنية</label>
              <Select value={period} onValueChange={v => { setPeriod(v); setOrderPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom date range */}
            {period === "custom" && (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">من</label>
                  <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">إلى</label>
                  <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="h-8 text-sm" />
                </div>
              </>
            )}

            {/* Delivery status */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">حالة الطلب</label>
              <Select value={statusFilter || "_all"} onValueChange={v => { setStatusFilter(v === "_all" ? "" : v); setOrderPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">الكل</SelectItem>
                  <SelectItem value="pending">قيد التجهيز</SelectItem>
                  <SelectItem value="shipped">قيد الشحن</SelectItem>
                  <SelectItem value="delivered">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">طريقة الدفع</label>
              <Select value={paymentFilter || "_all"} onValueChange={v => { setPaymentFilter(v === "_all" ? "" : v); setOrderPage(1); }}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">الكل</SelectItem>
                  <SelectItem value="cash">نقداً</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Governorate */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المحافظة</label>
              <Input
                placeholder="مثال: القاهرة"
                value={govFilter}
                onChange={e => { setGovFilter(e.target.value); setOrderPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Size */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المقاس</label>
              <Input
                placeholder="مثال: 42"
                value={sizeFilter}
                onChange={e => { setSizeFilter(e.target.value); setOrderPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">اللون</label>
              <Input
                placeholder="مثال: أسود"
                value={colorFilter}
                onChange={e => { setColorFilter(e.target.value); setOrderPage(1); }}
                className="h-8 text-sm"
              />
            </div>

            {/* Group by */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">تجميع البيانات</label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">يومي</SelectItem>
                  <SelectItem value="week">أسبوعي</SelectItem>
                  <SelectItem value="month">شهري</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Loading / Error ──────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-3 text-muted-foreground">جاري تحميل البيانات…</span>
        </div>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={fetchData}>إعادة المحاولة</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !data && (
        <Empty msg="لا توجد بيانات في هذه الفترة" />
      )}

      {!loading && data && (
        <>
          {/* ══ 1. KPI Cards ════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            <KpiCard title="إجمالي الطلبات"      value={data.kpi.totalOrders.value}      delta={data.kpi.totalOrders.delta}      icon={ShoppingBag}  color="bg-blue-100 dark:bg-blue-900/20" />
            <KpiCard title="مكتملة"              value={data.kpi.delivered.value}        delta={data.kpi.delivered.delta}        icon={CheckCircle}  color="bg-green-100 dark:bg-green-900/20" />
            <KpiCard title="قيد التجهيز"         value={data.kpi.pending.value}          delta={data.kpi.pending.delta}          icon={Clock}        color="bg-amber-100 dark:bg-amber-900/20" />
            <KpiCard title="قيد الشحن"           value={data.kpi.shipped.value}          delta={data.kpi.shipped.delta}          icon={Truck}        color="bg-sky-100 dark:bg-sky-900/20" />
            <KpiCard title="ملغية"               value={data.kpi.cancelled.value}        delta={data.kpi.cancelled.delta}        icon={XCircle}      color="bg-red-100 dark:bg-red-900/20" />
            <KpiCard title="إجمالي المبيعات"     value={data.kpi.totalRevenue.value}     delta={data.kpi.totalRevenue.delta}     icon={DollarSign}   color="bg-emerald-100 dark:bg-emerald-900/20" format="currency" />
            <KpiCard title="متوسط قيمة الطلب"   value={data.kpi.avgOrderValue.value}    delta={data.kpi.avgOrderValue.delta}    icon={BarChart2}    color="bg-violet-100 dark:bg-violet-900/20" format="currency" />
            <KpiCard title="إجمالي الخصومات"    value={data.kpi.totalDiscount.value}    delta={data.kpi.totalDiscount.delta}    icon={Tag}          color="bg-orange-100 dark:bg-orange-900/20" format="currency" />
            <KpiCard title="تكلفة الشحن"         value={data.kpi.totalShipping.value}    delta={data.kpi.totalShipping.delta}    icon={Truck}        color="bg-cyan-100 dark:bg-cyan-900/20" format="currency" />
            <KpiCard title="صافي المبيعات"       value={data.kpi.netRevenue.value}       delta={data.kpi.netRevenue.delta}       icon={DollarSign}   color="bg-teal-100 dark:bg-teal-900/20" format="currency" />
            <KpiCard title="عدد العملاء"         value={data.kpi.uniqueCustomers.value}  delta={data.kpi.uniqueCustomers.delta}  icon={Users}        color="bg-indigo-100 dark:bg-indigo-900/20" />
            <KpiCard title="عملاء جدد"           value={data.customerSummary.newCount}   delta={0}                               icon={Users}        color="bg-pink-100 dark:bg-pink-900/20" />
            <KpiCard title="عملاء متكررون"       value={data.customerSummary.repeat}     delta={0}                               icon={Users}        color="bg-rose-100 dark:bg-rose-900/20" />
            <KpiCard title="نسبة الإتمام"        value={data.kpi.completionRate.value}   delta={data.kpi.completionRate.delta}   icon={CheckCircle}  color="bg-lime-100 dark:bg-lime-900/20" format="percent" />
            <KpiCard title="نسبة الإلغاء"        value={data.kpi.cancellationRate.value} delta={data.kpi.cancellationRate.delta} icon={XCircle}      color="bg-red-100 dark:bg-red-900/20"  format="percent" />
          </div>

          {/* ══ 2. Sales Over Time ══════════════════════════════════════════ */}
          <Section title="تحليل المبيعات عبر الزمن" icon={BarChart2}>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["revenue", "orders", "avgOrderValue"] as const).map(m => (
                <Button
                  key={m}
                  size="sm"
                  variant={salesMetric === m ? "default" : "outline"}
                  onClick={() => setSalesMetric(m)}
                  className="text-xs h-7"
                >
                  {m === "revenue" ? "المبيعات" : m === "orders" ? "الطلبات" : "متوسط الطلب"}
                </Button>
              ))}
            </div>
            {salesChartData.length === 0 ? <Empty /> : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: any) =>
                        salesMetric === "orders" ? v : `${Number(v).toLocaleString("ar-EG")} ج.م`
                      }
                      labelFormatter={(l) => `التاريخ: ${l}`}
                    />
                    <Bar
                      dataKey={salesMetric}
                      name={salesMetric === "revenue" ? "المبيعات" : salesMetric === "orders" ? "الطلبات" : "متوسط الطلب"}
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Section>

          {/* ══ 3. Status Distribution + Shipping ════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Donut chart */}
            <Section title="توزيع الطلبات حسب الحالة" icon={Package}>
              {statusChartData.length === 0 ? <Empty /> : (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={45}
                          paddingAngle={2}
                          label={({ name, pct }) => `${name} ${pct}%`}
                          labelLine={false}
                        >
                          {statusChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => `${v} طلب`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {statusChartData.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-medium mr-auto">{s.value} ({s.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>

            {/* Shipping Stats */}
            <Section title="تحليل الشحن والتوصيل" icon={Truck}>
              {!data.shippingStats ? <Empty /> : (() => {
                const s = data.shippingStats!;
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "إجمالي تكلفة الشحن", value: EGP(s.totalShippingCost) },
                      { label: "متوسط تكلفة الشحن", value: EGP(s.avgShipping) },
                      { label: "طلبات تم شحنها",    value: s.shippedOrders.toLocaleString("ar-EG") },
                      { label: "طلبات مسلمة",       value: s.deliveredOrders.toLocaleString("ar-EG") },
                      { label: "نسبة الرفض",        value: PCT(s.rejectionRate) },
                      {
                        label: "متوسط مدة التوصيل",
                        value: s.avgDeliveryDays != null
                          ? `${s.avgDeliveryDays.toFixed(1)} يوم`
                          : "غير متاح"
                      },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg border bg-muted/30 px-3 py-2">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-semibold text-sm mt-0.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Section>
          </div>

          {/* ══ 4. Products ════════════════════════════════════════════════ */}
          <Section title="تحليل أداء المنتجات" icon={Package}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground">ترتيب حسب:</span>
              {([
                { v: "revenue",    l: "الأعلى إيرادًا" },
                { v: "qtySold",    l: "الأكثر مبيعًا" },
                { v: "ordersCount",l: "الأكثر طلبًا" },
                { v: "cancelRate", l: "الأكثر إلغاءً" },
              ] as { v: "revenue" | "qtySold" | "ordersCount" | "cancelRate"; l: string }[]).map(o => (
                <Button
                  key={o.v}
                  size="sm"
                  variant={productSort === o.v ? "default" : "outline"}
                  onClick={() => setProductSort(o.v)}
                  className="text-xs h-7"
                >
                  {o.l}
                </Button>
              ))}
              <Button size="sm" variant="outline" className="text-xs h-7 mr-auto gap-1" onClick={exportProducts}>
                <Download className="h-3 w-3" /> تصدير
              </Button>
            </div>
            {sortedProducts.length === 0 ? <Empty /> : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right whitespace-nowrap">#</TableHead>
                      <TableHead className="text-right whitespace-nowrap">المنتج</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الطلبات</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الكمية</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الإيرادات</TableHead>
                      <TableHead className="text-right whitespace-nowrap">متوسط السعر</TableHead>
                      <TableHead className="text-right whitespace-nowrap">الخصومات</TableHead>
                      <TableHead className="text-right whitespace-nowrap">نسبة الإلغاء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.slice(0, 50).map((p, i) => (
                      <TableRow key={p._id}>
                        <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm max-w-[180px] truncate">{p.title || "—"}</TableCell>
                        <TableCell>{p.ordersCount}</TableCell>
                        <TableCell>{p.qtySold}</TableCell>
                        <TableCell className="font-medium">{EGP(p.revenue)}</TableCell>
                        <TableCell>{EGP(p.avgPrice)}</TableCell>
                        <TableCell>{EGP(p.totalDiscount)}</TableCell>
                        <TableCell>
                          <Badge variant={p.cancelRate > 30 ? "destructive" : "secondary"} className="text-xs">
                            {PCT(p.cancelRate)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>

          {/* ══ 5. Sizes + Colors ════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Size analysis */}
            <Section title="تحليل المقاسات" icon={Star}>
              {data.sizeAnalysis.length === 0 ? <Empty msg="لا توجد بيانات مقاسات" /> : (
                <>
                  <div className="h-44 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.sizeAnalysis.slice(0, 15)}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="_id" tick={{ fontSize: 10 }} width={30} />
                        <Tooltip formatter={(v: any) => `${v} طلب`} />
                        <Bar dataKey="ordersCount" name="الطلبات" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">المقاس</TableHead>
                          <TableHead className="text-right">الطلبات</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">نسبة الإلغاء</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.sizeAnalysis.map((s) => (
                          <TableRow key={s._id}>
                            <TableCell className="font-medium">{s._id}</TableCell>
                            <TableCell>{s.ordersCount}</TableCell>
                            <TableCell>{s.qtySold}</TableCell>
                            <TableCell>
                              <Badge variant={s.cancelRate > 30 ? "destructive" : "secondary"} className="text-xs">
                                {PCT(s.cancelRate)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Section>

            {/* Color analysis */}
            <Section title="تحليل الألوان" icon={Star}>
              {data.colorAnalysis.length === 0 ? <Empty msg="لا توجد بيانات ألوان" /> : (
                <>
                  <div className="h-44 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.colorAnalysis.slice(0, 15)}
                        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="_id" tick={{ fontSize: 10 }} width={50} />
                        <Tooltip formatter={(v: any) => `${v} طلب`} />
                        <Bar dataKey="ordersCount" name="الطلبات" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">اللون</TableHead>
                          <TableHead className="text-right">الطلبات</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">نسبة الإلغاء</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.colorAnalysis.map((c) => (
                          <TableRow key={c._id}>
                            <TableCell className="font-medium">{c._id}</TableCell>
                            <TableCell>{c.ordersCount}</TableCell>
                            <TableCell>{c.qtySold}</TableCell>
                            <TableCell>
                              <Badge variant={c.cancelRate > 30 ? "destructive" : "secondary"} className="text-xs">
                                {PCT(c.cancelRate)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </Section>
          </div>

          {/* ══ 6. Customers ═══════════════════════════════════════════════ */}
          <Section title="تحليل العملاء" icon={Users}>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "إجمالي العملاء",        value: data.customerSummary.total.toLocaleString("ar-EG") },
                { label: "عملاء جدد",             value: data.customerSummary.newCount.toLocaleString("ar-EG") },
                { label: "عملاء متكررون",         value: data.customerSummary.repeat.toLocaleString("ar-EG") },
                { label: "متوسط الطلبات/عميل",   value: data.customerSummary.avgOrdersPerCustomer.toLocaleString("ar-EG") },
                { label: "متوسط إنفاق العميل",   value: EGP(data.customerSummary.avgSpendPerCustomer) },
              ].map((item, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Top customers table */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">أعلى العملاء إنفاقًا</h4>
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={exportCustomers}>
                <Download className="h-3 w-3" /> تصدير
              </Button>
            </div>
            {data.topCustomers.length === 0 ? <Empty /> : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">#</TableHead>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">الطلبات</TableHead>
                      <TableHead className="text-right">إجمالي الإنفاق</TableHead>
                      <TableHead className="text-right">متوسط الطلب</TableHead>
                      <TableHead className="text-right">آخر طلب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topCustomers.slice(0, 30).map((c, i) => (
                      <TableRow key={c._id}>
                        <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="font-medium text-sm">
                          {c.name}
                          {c.isGuest && <Badge variant="outline" className="text-xs mr-1">ضيف</Badge>}
                        </TableCell>
                        <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                        <TableCell>{c.ordersCount}</TableCell>
                        <TableCell className="font-medium">{EGP(c.totalSpent)}</TableCell>
                        <TableCell>{EGP(c.avgOrder)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{fmtDate(c.lastOrder)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Section>

          {/* ══ 7. Governorates ════════════════════════════════════════════ */}
          <Section title="تحليل المحافظات والمناطق" icon={MapPin}>
            <div className="flex justify-end mb-2">
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={exportGovernorateS}>
                <Download className="h-3 w-3" /> تصدير
              </Button>
            </div>
            {data.governorateAnalysis.length === 0 ? <Empty msg="لا توجد بيانات محافظات — تأكد من صيغة العنوان" /> : (
              <>
                <div className="h-52 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.governorateAnalysis.slice(0, 12)}
                      margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => `${Number(v).toLocaleString("ar-EG")} ج.م`} />
                      <Bar dataKey="revenue" name="الإيرادات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right whitespace-nowrap">المحافظة</TableHead>
                        <TableHead className="text-right whitespace-nowrap">العملاء</TableHead>
                        <TableHead className="text-right whitespace-nowrap">الطلبات</TableHead>
                        <TableHead className="text-right whitespace-nowrap">الإيرادات</TableHead>
                        <TableHead className="text-right whitespace-nowrap">متوسط الطلب</TableHead>
                        <TableHead className="text-right whitespace-nowrap">مكتمل</TableHead>
                        <TableHead className="text-right whitespace-nowrap">ملغي</TableHead>
                        <TableHead className="text-right whitespace-nowrap">نسبة الإتمام</TableHead>
                        <TableHead className="text-right whitespace-nowrap">نسبة الرفض</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.governorateAnalysis.map((g) => (
                        <TableRow key={g._id}>
                          <TableCell className="font-medium">{g._id}</TableCell>
                          <TableCell>{g.customerCount}</TableCell>
                          <TableCell>{g.ordersCount}</TableCell>
                          <TableCell className="font-medium">{EGP(g.revenue)}</TableCell>
                          <TableCell>{EGP(g.avgOrder)}</TableCell>
                          <TableCell className="text-emerald-600">{g.delivered}</TableCell>
                          <TableCell className="text-red-500">{g.cancelled}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{PCT(g.completionRate)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={g.rejectionRate > 30 ? "destructive" : "secondary"} className="text-xs">
                              {PCT(g.rejectionRate)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Section>

          {/* ══ 8. Payment Breakdown ═══════════════════════════════════════ */}
          <Section title="تحليل طرق الدفع" icon={CreditCard}>
            {data.paymentBreakdown.length === 0 ? <Empty /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.paymentBreakdown}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={30}
                        paddingAngle={4}
                      >
                        {data.paymentBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        formatter={(v) => v === "cash" ? "نقداً" : "بطاقة"}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {data.paymentBreakdown.map((p, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                      <span className="font-medium">{p._id === "cash" ? "نقداً" : p._id === "card" ? "بطاقة" : p._id}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{p.count} طلب</span>
                        <span className="font-bold">{EGP(p.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ══ 9. Alerts ══════════════════════════════════════════════════ */}
          <Section title="تنبيهات وتحليلات مهمة" icon={AlertTriangle}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Top sellers */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> الأكثر مبيعًا
                </h4>
                {data.alerts.topSellers.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
                  <ul className="space-y-1">
                    {data.alerts.topSellers.map((p, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[120px]">{p.title || "—"}</span>
                        <Badge variant="secondary">{p.qtySold} قطعة</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* High cancel rate */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> إلغاء مرتفع
                </h4>
                {data.alerts.highCancelRate.length === 0
                  ? <p className="text-xs text-muted-foreground">لا توجد منتجات مشكوك فيها ✓</p>
                  : (
                    <ul className="space-y-1">
                      {data.alerts.highCancelRate.map((p, i) => (
                        <li key={i} className="flex items-center justify-between text-xs">
                          <span className="truncate max-w-[120px]">{p.title || "—"}</span>
                          <Badge variant="destructive">{PCT(p.cancelRate)}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>

              {/* Top sizes */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" /> أكثر المقاسات طلبًا
                </h4>
                {data.alerts.topSizes.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
                  <ul className="space-y-1">
                    {data.alerts.topSizes.map((s, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span>{s._id}</span>
                        <Badge variant="secondary">{s.ordersCount} طلب</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top colors */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-violet-500" /> أكثر الألوان طلبًا
                </h4>
                {data.alerts.topColors.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
                  <ul className="space-y-1">
                    {data.alerts.topColors.map((c, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span>{c._id}</span>
                        <Badge variant="secondary">{c.ordersCount} طلب</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Top governorates by sales */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" /> أعلى المحافظات مبيعًا
                </h4>
                {data.alerts.topGovernoratesBySales.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
                  <ul className="space-y-1">
                    {data.alerts.topGovernoratesBySales.map((g, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span>{g._id}</span>
                        <Badge variant="secondary">{EGP(g.revenue)}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* High rejection governorates */}
              <div className="rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-500" /> أعلى نسبة رفض
                </h4>
                {data.alerts.highRejectionGovernorateS.length === 0
                  ? <p className="text-xs text-muted-foreground">لا توجد بيانات ✓</p>
                  : (
                    <ul className="space-y-1">
                      {data.alerts.highRejectionGovernorateS.map((g, i) => (
                        <li key={i} className="flex items-center justify-between text-xs">
                          <span>{g._id}</span>
                          <Badge variant="destructive">{PCT(g.rejectionRate)}</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>
          </Section>

          {/* ══ 10. Detailed Orders Table ══════════════════════════════════ */}
          <Section title="جدول الطلبات التفصيلي" icon={ShoppingBag} defaultOpen={false}>
            {/* Search + export */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Input
                placeholder="بحث: رقم الطلب، الاسم، الهاتف، المنتج…"
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                className="h-8 text-sm flex-1"
              />
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs whitespace-nowrap" onClick={exportOrders}>
                <Download className="h-3 w-3" /> تصدير CSV
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mb-2">
              {filteredOrders.length.toLocaleString("ar-EG")} طلب • الصفحة {orderPage} من {totalOrderPages}
            </p>

            {pagedOrders.length === 0 ? <Empty /> : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {[
                        { key: "orderNumber",    label: "رقم الطلب" },
                        { key: "createdAt",      label: "التاريخ" },
                        { key: "customerName",   label: "العميل" },
                        { key: "customerPhone",  label: "الهاتف" },
                        { key: "productTitle",   label: "المنتج" },
                        { key: "size",           label: "المقاس" },
                        { key: "colorName",      label: "اللون" },
                        { key: "quantity",       label: "الكمية" },
                        { key: "unitPrice",      label: "السعر" },
                        { key: "discount",       label: "خصم" },
                        { key: "shippingFee",    label: "شحن" },
                        { key: "orderTotal",     label: "الإجمالي" },
                        { key: "deliveryStatus", label: "الحالة" },
                        { key: "address",        label: "العنوان" },
                        { key: "paymentMethod",  label: "الدفع" },
                        { key: "deliveryDays",   label: "أيام التوصيل" },
                      ].map(col => (
                        <TableHead
                          key={col.key}
                          className="text-right whitespace-nowrap cursor-pointer select-none hover:bg-muted/50 text-xs"
                          onClick={() => handleOrderSort(col.key)}
                        >
                          <span className="flex items-center gap-0.5">
                            {col.label}
                            {orderSortCol === col.key && (
                              orderSortDir === "asc"
                                ? <ChevronUp className="h-3 w-3" />
                                : <ChevronDown className="h-3 w-3" />
                            )}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedOrders.map((o, i) => (
                      <TableRow key={`${o.orderNumber}-${i}`}>
                        <TableCell className="text-xs font-mono">{o.orderNumber}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(o.createdAt)}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{o.customerName}</TableCell>
                        <TableCell className="text-xs">{o.customerPhone}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">{o.productTitle}</TableCell>
                        <TableCell className="text-xs">{o.size || "—"}</TableCell>
                        <TableCell className="text-xs">{o.colorName || "—"}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell className="text-xs whitespace-nowrap">{EGP(o.unitPrice)}</TableCell>
                        <TableCell className="text-xs text-orange-600">{o.discount > 0 ? EGP(o.discount) : "—"}</TableCell>
                        <TableCell className="text-xs">{EGP(o.shippingFee)}</TableCell>
                        <TableCell className="font-medium text-xs whitespace-nowrap">{EGP(o.orderTotal)}</TableCell>
                        <TableCell>
                          <Badge
                            className="text-xs"
                            style={{ background: STATUS_COLORS[o.deliveryStatus] + "20", color: STATUS_COLORS[o.deliveryStatus], border: `1px solid ${STATUS_COLORS[o.deliveryStatus]}40` }}
                          >
                            {STATUS_LABELS[o.deliveryStatus] || o.deliveryStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate text-muted-foreground">{o.address || "—"}</TableCell>
                        <TableCell className="text-xs">{o.paymentMethod === "cash" ? "نقداً" : "بطاقة"}</TableCell>
                        <TableCell className="text-xs">
                          {o.deliveryDays != null ? `${o.deliveryDays.toFixed(1)} ي` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalOrderPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={orderPage <= 1}
                  onClick={() => setOrderPage(p => p - 1)}
                  className="h-7 text-xs"
                >
                  السابق
                </Button>
                <span className="text-xs text-muted-foreground">
                  {orderPage} / {totalOrderPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={orderPage >= totalOrderPages}
                  onClick={() => setOrderPage(p => p + 1)}
                  className="h-7 text-xs"
                >
                  التالي
                </Button>
              </div>
            )}
          </Section>

          {/* ══ 11. Export All ═════════════════════════════════════════════ */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" /> تصدير التقارير
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={exportOrders}>
                  <Download className="h-3 w-3" /> تقرير الطلبات
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={exportProducts}>
                  <Download className="h-3 w-3" /> تقرير المنتجات
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={exportCustomers}>
                  <Download className="h-3 w-3" /> تقرير العملاء
                </Button>
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={exportGovernorateS}>
                  <Download className="h-3 w-3" /> تقرير المحافظات
                </Button>
              </div>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  );
}
