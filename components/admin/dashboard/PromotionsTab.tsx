"use client";

/**
 * PromotionsTab.tsx — MIRVORY admin · إدارة العروض الترويجية
 * Talks to /api/promotions (create / update / toggle / delete / preview).
 * Every promotion type the backend supports is editable here; the backend
 * re-validates each setting before a promotion can be activated.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, RefreshCw, Trash2, Play, Pause, AlertCircle, CheckCircle2, X, Eye } from "lucide-react";
import apiServices from "@/lib/api";
import { productService } from "@/lib/api/services/productService";
import { promotionService, type Promotion, type PromotionKind } from "@/lib/api/services/promotionService";

const KIND_LABELS: Record<PromotionKind, { ar: string; en: string }> = {
  free_shipping: { ar: "شحن مجاني", en: "Free shipping" },
  limited_time: { ar: "عرض لفترة محدودة", en: "Limited time" },
  quantity: { ar: "عرض كمية", en: "Quantity" },
  gift: { ar: "هدية", en: "Gift" },
  bundle: { ar: "باقة", en: "Bundle" },
};

const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  draft: { ar: "مسودة", en: "Draft" },
  scheduled: { ar: "مجدول", en: "Scheduled" },
  active: { ar: "فعال", en: "Active" },
  paused: { ar: "متوقف", en: "Paused" },
  expired: { ar: "منتهي", en: "Expired" },
};

const isoLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = () => {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 86400000);
  return {
    name: "",
    description: "",
    kind: "free_shipping" as PromotionKind,
    status: "draft",
    startsAt: isoLocal(now),
    endsAt: isoLocal(end),
    minOrderAmount: "2000",
    freeShippingBasis: "after_discounts",
    freeShippingAreas: "",
    discountType: "percentage",
    discountValue: "10",
    maxDiscountAmount: "",
    minQuantity: "1",
    bundlePrice: "",
    giftProduct: "",
    giftQuantity: "1",
    usageLimit: "",
    priority: "0",
    scopeAll: true,
    products: [] as string[],
    categories: [] as string[],
  };
};

type Form = ReturnType<typeof emptyForm>;

export function PromotionsTab({ isArabic }: { isArabic: boolean }) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; message: string; errors?: string[] } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await promotionService.getPromotions({ limit: 100 });
      const list = res.data?.data || res.data?.promotions || [];
      setPromotions(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setFeedback({ type: "err", message: err?.response?.data?.message || (isArabic ? "فشل تحميل العروض" : "Failed to load promotions") });
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  useEffect(() => {
    (async () => {
      try {
        const [p, c] = await Promise.all([
          productService.getProductsForAdmin().catch(() => null),
          apiServices.categoryService.getCategories().catch(() => null),
        ]);
        const pl = (p as any)?.data?.data || (p as any)?.data?.products || [];
        setProducts(Array.isArray(pl) ? pl : []);
        const cl = (c as any)?.data?.data || (c as any)?.data || [];
        setCategories(Array.isArray(cl) ? cl : []);
      } catch { /* the form still works without the pickers */ }
    })();
  }, []);

  const set = (key: keyof Form, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const buildPayload = () => {
    const config: any = {
      freeShippingBasis: form.freeShippingBasis,
      freeShippingAreas: form.freeShippingAreas.split(",").map((s) => s.trim()).filter(Boolean),
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      minQuantity: Number(form.minQuantity || 1),
      giftQuantity: Number(form.giftQuantity || 1),
      stackableWithCoupons: true,
      stackableWithShipping: true,
    };
    if (form.kind === "free_shipping") config.minOrderAmount = Number(form.minOrderAmount || 0);
    if (form.maxDiscountAmount !== "") config.maxDiscountAmount = Number(form.maxDiscountAmount);
    if (form.kind === "gift" && form.giftProduct) config.giftProduct = form.giftProduct;
    if (form.kind === "bundle" && form.bundlePrice !== "") config.bundlePrice = Number(form.bundlePrice);

    return {
      name: form.name.trim(),
      description: form.description.trim(),
      kind: form.kind,
      status: form.status,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
      priority: Number(form.priority || 0),
      scope: {
        all: form.scopeAll,
        products: form.scopeAll ? [] : form.products,
        categories: form.scopeAll ? [] : form.categories,
      },
      config,
    };
  };

  const startCreate = () => { setEditingId(null); setForm(emptyForm()); setShowForm(true); setPreview(null); setFeedback(null); };

  const startEdit = (p: Promotion) => {
    const c = p.config || {};
    setEditingId(p._id);
    setForm({
      ...emptyForm(),
      name: p.name || "",
      description: p.description || "",
      kind: p.kind,
      status: p.status,
      startsAt: isoLocal(new Date(p.startsAt)),
      endsAt: isoLocal(new Date(p.endsAt)),
      minOrderAmount: String(c.minOrderAmount ?? 0),
      freeShippingBasis: c.freeShippingBasis || "after_discounts",
      freeShippingAreas: (c.freeShippingAreas || []).join(", "),
      discountType: c.discountType || "percentage",
      discountValue: String(c.discountValue ?? 0),
      maxDiscountAmount: c.maxDiscountAmount === null || c.maxDiscountAmount === undefined ? "" : String(c.maxDiscountAmount),
      minQuantity: String(c.minQuantity ?? 1),
      bundlePrice: c.bundlePrice === null || c.bundlePrice === undefined ? "" : String(c.bundlePrice),
      giftProduct: c.giftProduct?._id || c.giftProduct || "",
      giftQuantity: String(c.giftQuantity ?? 1),
      usageLimit: p.usageLimit === null || p.usageLimit === undefined ? "" : String(p.usageLimit),
      priority: String(p.priority ?? 0),
      scopeAll: Boolean(p.scope?.all) || ((p.scope?.products || []).length === 0 && (p.scope?.categories || []).length === 0),
      products: (p.scope?.products || []).map((x: any) => x?._id || x),
      categories: (p.scope?.categories || []).map((x: any) => x?._id || x),
    });
    setShowForm(true);
    setPreview(null);
    setFeedback(null);
  };

  const save = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      setFeedback({ type: "err", message: isArabic ? "اسم العرض مطلوب" : "Name is required" });
      return;
    }
    try {
      setSaving(true);
      setFeedback(null);
      const payload = buildPayload();
      if (editingId) await promotionService.updatePromotion(editingId, payload);
      else await promotionService.createPromotion(payload);
      setFeedback({ type: "ok", message: isArabic ? "تم حفظ العرض بنجاح" : "Promotion saved" });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await fetchPromotions();
    } catch (err: any) {
      const data = err?.response?.data;
      setFeedback({ type: "err", message: data?.message || (isArabic ? "فشل حفظ العرض" : "Save failed"), errors: data?.errors });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p: Promotion) => {
    if (busyId) return;
    try {
      setBusyId(p._id);
      setFeedback(null);
      const nextStatus = p.status === "active" ? "paused" : "active";
      const res = await promotionService.togglePromotion(p._id, nextStatus as any);
      setFeedback({ type: "ok", message: res.data?.message || (isArabic ? "تم تحديث حالة العرض" : "Status updated") });
      await fetchPromotions();
    } catch (err: any) {
      const data = err?.response?.data;
      setFeedback({ type: "err", message: data?.message || (isArabic ? "تعذر تفعيل العرض" : "Could not activate"), errors: data?.errors });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (p: Promotion) => {
    if (busyId) return;
    const ok = window.confirm(isArabic ? `تأكيد حذف العرض: ${p.name}؟` : `Delete promotion: ${p.name}?`);
    if (!ok) return;
    try {
      setBusyId(p._id);
      const res = await promotionService.deletePromotion(p._id);
      setFeedback({ type: "ok", message: res.data?.message || (isArabic ? "تم حذف العرض" : "Deleted") });
      await fetchPromotions();
    } catch (err: any) {
      setFeedback({ type: "err", message: err?.response?.data?.message || (isArabic ? "فشل حذف العرض" : "Delete failed") });
    } finally {
      setBusyId(null);
    }
  };

  const runPreview = async (p: Promotion) => {
    const ids: string[] = [];
    (p.scope?.products || []).forEach((x: any) => ids.push(String(x?._id || x)));
    const sample = ids.length ? ids : products.slice(0, 1).map((x) => x._id);
    if (!sample.length) {
      setFeedback({ type: "err", message: isArabic ? "اختر منتجات أولاً لمعاينة العرض" : "Select products first to preview" });
      return;
    }
    try {
      setPreview(null);
      const res = await promotionService.previewPromotion({
        promotionId: p._id,
        items: sample.slice(0, 3).map((id) => ({ productId: id, quantity: Math.max(1, Number(p.config?.minQuantity) || 1) })),
      });
      const ev = res.data?.data?.evaluation;
      const pricing = res.data?.data?.pricing;
      const lines = [
        `${isArabic ? "المجموع الفرعي" : "Subtotal"}: ${ev?.subtotal ?? 0} EGP`,
        `${isArabic ? "خصم العروض" : "Promotion discount"}: ${ev?.totalDiscount ?? 0} EGP`,
        `${isArabic ? "شحن مجاني" : "Free shipping"}: ${ev?.freeShipping ? (isArabic ? "نعم" : "Yes") : (isArabic ? "لا" : "No")}`,
        `${isArabic ? "الشحن المحتسب" : "Shipping fee"}: ${pricing?.shippingFee ?? "-"} EGP`,
        `${isArabic ? "المبلغ النهائي" : "Final total"}: ${pricing?.total ?? "-"} EGP`,
      ];
      if (ev?.skipped?.length) lines.push(`${isArabic ? "ملاحظات" : "Notes"}: ${ev.skipped.map((s: any) => s.reason).join(", ")}`);
      setPreview(lines);
    } catch (err: any) {
      setFeedback({ type: "err", message: err?.response?.data?.message || (isArabic ? "تعذرت معاينة العرض" : "Preview failed") });
    }
  };

  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter((p) => p.status === "active").length;
    const live = promotions.filter((p) => p.isLive).length;
    return { total, active, live };
  }, [promotions]);

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isArabic ? "إدارة العروض الترويجية" : "Promotions management"}</h2>
          <p className="text-muted-foreground">
            {isArabic
              ? "الشحن المجاني، العروض محدودة الوقت، عروض الكمية، الهدايا والباقات — كل الأسعار تُحسب في الـ Backend."
              : "Free shipping, limited-time offers, quantity offers, gifts and bundles — all priced server-side."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPromotions} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ms-2">{isArabic ? "تحديث" : "Refresh"}</span>
          </Button>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 me-2" />
            {isArabic ? "عرض جديد" : "New promotion"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">{isArabic ? "إجمالي العروض" : "Total"}</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">{isArabic ? "عروض فعالة" : "Active"}</div><div className="text-2xl font-bold">{stats.active}</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground">{isArabic ? "تعمل الآن" : "Live now"}</div><div className="text-2xl font-bold">{stats.live}</div></CardContent></Card>
      </div>

      {feedback && (
        <div className={`rounded-lg border p-3 text-sm ${feedback.type === "ok" ? "border-green-300 bg-green-50 text-green-800" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
          <div className="flex items-start gap-2">
            {feedback.type === "ok" ? <CheckCircle2 className="h-4 w-4 mt-0.5" /> : <AlertCircle className="h-4 w-4 mt-0.5" />}
            <div className="flex-1">
              <div>{feedback.message}</div>
              {feedback.errors?.length ? (
                <ul className="mt-1 list-disc ps-5">{feedback.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              ) : null}
            </div>
            <button onClick={() => setFeedback(null)} aria-label="close"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? (isArabic ? "تعديل العرض" : "Edit promotion") : (isArabic ? "عرض جديد" : "New promotion")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{isArabic ? "اسم العرض" : "Name"}</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={isArabic ? "شحن مجاني للطلبات فوق 2000 جنيه" : "Free shipping over 2000 EGP"} />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "نوع العرض" : "Type"}</Label>
                <Select value={form.kind} onValueChange={(v) => set("kind", v as PromotionKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_LABELS) as PromotionKind[]).map((k) => (
                      <SelectItem key={k} value={k}>{isArabic ? KIND_LABELS[k].ar : KIND_LABELS[k].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{isArabic ? "الوصف" : "Description"}</Label>
                <Input value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "يبدأ" : "Starts"}</Label>
                <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "ينتهي" : "Ends"}</Label>
                <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "الحالة" : "Status"}</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_LABELS).map((s) => (
                      <SelectItem key={s} value={s}>{isArabic ? STATUS_LABELS[s].ar : STATUS_LABELS[s].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isArabic ? "حد الاستخدام (اختياري)" : "Usage limit (optional)"}</Label>
                <Input type="number" min={0} value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} />
              </div>
            </div>

            {form.kind === "free_shipping" && (
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? "الحد الأدنى للطلب (ج.م)" : "Minimum order (EGP)"}</Label>
                  <Input type="number" min={0} value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "يُحسب الحد قبل أم بعد الخصومات" : "Threshold basis"}</Label>
                  <Select value={form.freeShippingBasis} onValueChange={(v) => set("freeShippingBasis", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before_discounts">{isArabic ? "قبل الخصومات" : "Before discounts"}</SelectItem>
                      <SelectItem value="after_discounts">{isArabic ? "بعد الخصومات" : "After discounts"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "المحافظات المشمولة (فارغ = الكل)" : "Areas (empty = all)"}</Label>
                  <Input value={form.freeShippingAreas} onChange={(e) => set("freeShippingAreas", e.target.value)} placeholder="القاهرة, الجيزة" />
                </div>
              </div>
            )}

            {(form.kind === "limited_time" || form.kind === "quantity" || form.kind === "bundle") && (
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "نوع الخصم" : "Discount type"}</Label>
                  <Select value={form.discountType} onValueChange={(v) => set("discountType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{isArabic ? "نسبة %" : "Percentage"}</SelectItem>
                      <SelectItem value="fixed">{isArabic ? "مبلغ ثابت" : "Fixed"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "قيمة الخصم" : "Value"}</Label>
                  <Input type="number" min={0} value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "أقصى خصم (اختياري)" : "Max discount"}</Label>
                  <Input type="number" min={0} value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)} />
                </div>
                {form.kind === "bundle" ? (
                  <div className="space-y-2">
                    <Label>{isArabic ? "سعر الباقة" : "Bundle price"}</Label>
                    <Input type="number" min={0} value={form.bundlePrice} onChange={(e) => set("bundlePrice", e.target.value)} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>{isArabic ? "أقل كمية" : "Min quantity"}</Label>
                    <Input type="number" min={1} value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {form.kind === "gift" && (
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? "منتج الهدية" : "Gift product"}</Label>
                  <Select value={form.giftProduct} onValueChange={(v) => set("giftProduct", v)}>
                    <SelectTrigger><SelectValue placeholder={isArabic ? "اختر منتج" : "Choose product"} /></SelectTrigger>
                    <SelectContent>
                      {products.slice(0, 60).map((p) => (
                        <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "كمية الهدية" : "Gift quantity"}</Label>
                  <Input type="number" min={1} value={form.giftQuantity} onChange={(e) => set("giftQuantity", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? "أقل كمية للشراء" : "Min quantity to buy"}</Label>
                  <Input type="number" min={1} value={form.minQuantity} onChange={(e) => set("minQuantity", e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <input id="scopeAll" type="checkbox" checked={form.scopeAll} onChange={(e) => set("scopeAll", e.target.checked)} />
                <Label htmlFor="scopeAll">{isArabic ? "ينطبق على كل المنتجات" : "Applies to all products"}</Label>
              </div>
              {!form.scopeAll && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isArabic ? "تصنيفات" : "Categories"}</Label>
                    <div className="max-h-40 space-y-1 overflow-auto rounded border p-2">
                      {categories.map((c) => (
                        <label key={c._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.categories.includes(c._id)}
                            onChange={(e) => set("categories", e.target.checked ? [...form.categories, c._id] : form.categories.filter((x) => x !== c._id))}
                          />
                          {isArabic ? c.name : c.nameEn || c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "منتجات" : "Products"}</Label>
                    <div className="max-h-40 space-y-1 overflow-auto rounded border p-2">
                      {products.slice(0, 80).map((p) => (
                        <label key={p._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.products.includes(p._id)}
                            onChange={(e) => set("products", e.target.checked ? [...form.products, p._id] : form.products.filter((x) => x !== p._id))}
                          />
                          {p.title}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {preview && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <div className="mb-1 font-medium">{isArabic ? "معاينة الحساب" : "Preview"}</div>
                <ul className="space-y-0.5">{preview.map((l, i) => <li key={i}>{l}</li>)}</ul>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span className={saving ? "ms-2" : ""}>{isArabic ? "حفظ" : "Save"}</span>
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setPreview(null); }}>{isArabic ? "إلغاء" : "Cancel"}</Button>
              <Button variant="ghost" onClick={() => runPreview({ ...(buildPayload() as any), _id: editingId } as any)}>
                <Eye className="h-4 w-4 me-2" />
                {isArabic ? "معاينة" : "Preview"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> {isArabic ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : promotions.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">{isArabic ? "لا توجد عروض حتى الآن" : "No promotions yet"}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? "العرض" : "Promotion"}</TableHead>
                    <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
                    <TableHead>{isArabic ? "الفترة" : "Period"}</TableHead>
                    <TableHead>{isArabic ? "الاستخدام" : "Usage"}</TableHead>
                    <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-end">{isArabic ? "إجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                        {p.description ? <div className="text-xs text-muted-foreground line-clamp-2">{p.description}</div> : null}
                      </TableCell>
                      <TableCell>{isArabic ? KIND_LABELS[p.kind]?.ar : KIND_LABELS[p.kind]?.en}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {new Date(p.startsAt).toLocaleDateString("ar-EG")} — {new Date(p.endsAt).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell className="text-xs">
                        {p.usageCount || 0}{p.usageLimit !== null && p.usageLimit !== undefined ? ` / ${p.usageLimit}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.status === "active" ? "default" : "secondary"}>
                          {isArabic ? STATUS_LABELS[p.status]?.ar : STATUS_LABELS[p.status]?.en}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(p)}>{isArabic ? "تعديل" : "Edit"}</Button>
                          <Button size="sm" variant="outline" onClick={() => toggle(p)} disabled={busyId === p._id}>
                            {busyId === p._id ? <Loader2 className="h-4 w-4 animate-spin" /> : p.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => runPreview(p)}><Eye className="h-4 w-4" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => remove(p)} disabled={busyId === p._id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PromotionsTab;
