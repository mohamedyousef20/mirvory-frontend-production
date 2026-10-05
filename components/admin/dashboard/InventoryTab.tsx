"use client";

/**
 * InventoryTab.tsx — MIRVORY Admin Inventory
 * Displays Product → Color → Size → Quantity hierarchy.
 * Shows low-stock alerts, out-of-stock sizes, and total quantities.
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Package, AlertTriangle, RefreshCw, Search, ChevronDown, ChevronRight
} from "lucide-react";
import Image from "next/image";
import apiServices from "@/lib/api";

const { api } = apiServices;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ColorSizeEntry {
  size: string;
  quantity: number;
  sold?: number;
}

interface ColorEntry {
  name: string;
  value: string;
  image?: string;
  sizes: ColorSizeEntry[];
  totalQuantity: number;
}

interface ProductInventory {
  productId: string;
  productTitle: string;
  productImage?: string;
  colors: ColorEntry[];
  totalQuantity: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 3;

function sizeStatus(qty: number): "out" | "low" | "ok" {
  if (qty === 0) return "out";
  if (qty <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryTab() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/products/admin-products");
      const products: any[] = res.data?.data || res.data?.products || [];

      // Map API products to our inventory shape
      const mapped: ProductInventory[] = products.map((p: any) => {
        const colors: ColorEntry[] = (p.colors || []).map((c: any) => {
          const sizes: ColorSizeEntry[] = Array.isArray(c.sizes) && c.sizes.length > 0
            ? c.sizes.map((s: any) => ({ size: String(s.size), quantity: Number(s.quantity) || 0, sold: Number(s.sold) || 0 }))
            : (p.sizes || []).map((s: string) => ({ size: s, quantity: 0, sold: 0 }));
          return {
            name: c.name,
            value: c.value,
            image: c.image || undefined,
            sizes,
            totalQuantity: sizes.reduce((sum: number, s: ColorSizeEntry) => sum + s.quantity, 0),
          };
        });

        return {
          productId: p._id,
          productTitle: p.title,
          productImage: p.images?.[0],
          colors,
          totalQuantity: p.quantity ?? colors.reduce((s: number, c: ColorEntry) => s + c.totalQuantity, 0),
        };
      });

      setInventory(mapped);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("فشل في تحميل المخزون");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const toggleExpand = (productId: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const expandAll = () => setExpandedProducts(new Set(inventory.map(p => p.productId)));
  const collapseAll = () => setExpandedProducts(new Set());

  // ── Filter ─────────────────────────────────────────────────────────────────

  const filtered = inventory.filter(p =>
    p.productTitle.toLowerCase().includes(search.toLowerCase())
  );

  // ── Summary stats ──────────────────────────────────────────────────────────

  const allSizes = inventory.flatMap(p => p.colors.flatMap(c => c.sizes));
  const outOfStockCount = allSizes.filter(s => s.quantity === 0).length;
  const lowStockCount   = allSizes.filter(s => s.quantity > 0 && s.quantity <= LOW_STOCK_THRESHOLD).length;
  const totalQty        = inventory.reduce((s, p) => s + p.totalQuantity, 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">إجمالي المنتجات</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Package className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">إجمالي الكمية</p>
              <p className="text-2xl font-bold">{totalQty}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">مقاسات منخفضة</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">نفد المخزون</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="البحث في المنتجات..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button variant="outline" size="sm" onClick={expandAll}>توسيع الكل</Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>طي الكل</Button>
        <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading}>
          <RefreshCw className={`h-4 w-4 me-1 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
          <p>جاري تحميل المخزون...</p>
        </div>
      )}

      {/* Inventory List */}
      {!loading && filtered.map(product => {
        const isExpanded = expandedProducts.has(product.productId);
        const hasLowStock = product.colors.some(c => c.sizes.some(s => sizeStatus(s.quantity) === "low"));
        const hasOutStock  = product.colors.some(c => c.sizes.some(s => sizeStatus(s.quantity) === "out"));

        return (
          <Card key={product.productId} className={`overflow-hidden ${hasOutStock ? 'border-red-200' : hasLowStock ? 'border-orange-200' : ''}`}>
            {/* Product header */}
            <CardHeader
              className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
              onClick={() => toggleExpand(product.productId)}
            >
              <div className="flex items-center gap-4">
                {product.productImage && (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={product.productImage} alt={product.productTitle} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{product.productTitle}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {product.colors.length} {product.colors.length === 1 ? 'لون' : 'ألوان'}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">الكمية: {product.totalQuantity}</span>
                    {hasOutStock && <Badge variant="destructive" className="text-xs">نفد مخزون</Badge>}
                    {hasLowStock && !hasOutStock && <Badge className="bg-orange-100 text-orange-700 text-xs">مخزون منخفض</Badge>}
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
              </div>
            </CardHeader>

            {/* Expanded: colors + sizes */}
            {isExpanded && (
              <CardContent className="p-0">
                <div className="divide-y">
                  {product.colors.map((color, ci) => (
                    <div key={ci} className="p-4 space-y-3">
                      {/* Color header */}
                      <div className="flex items-center gap-3">
                        {color.image ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0">
                            <Image src={color.image} alt={color.name} fill className="object-cover" />
                          </div>
                        ) : null}
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow flex-shrink-0"
                          style={{ backgroundColor: color.value }}
                        />
                        <div>
                          <p className="font-semibold text-sm">{color.name}</p>
                          <p className="text-xs text-muted-foreground">إجمالي الكمية: {color.totalQuantity}</p>
                        </div>
                      </div>

                      {/* Sizes table */}
                      {color.sizes.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right text-xs">المقاس</TableHead>
                              <TableHead className="text-right text-xs">الكمية</TableHead>
                              <TableHead className="text-right text-xs">الحالة</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {color.sizes.map((entry, si) => {
                              const status = sizeStatus(entry.quantity);
                              return (
                                <TableRow key={si} className={status === "out" ? "bg-red-50" : status === "low" ? "bg-orange-50" : ""}>
                                  <TableCell className="font-medium">{entry.size}</TableCell>
                                  <TableCell className={`font-bold ${status === "out" ? "text-red-600" : status === "low" ? "text-orange-600" : "text-green-600"}`}>
                                    {entry.quantity}
                                  </TableCell>
                                  <TableCell>
                                    {status === "out" && <Badge variant="destructive" className="text-xs">نفد</Badge>}
                                    {status === "low" && <Badge className="bg-orange-100 text-orange-700 text-xs">منخفض ({entry.quantity})</Badge>}
                                    {status === "ok" && <Badge className="bg-green-100 text-green-700 text-xs">متوفر</Badge>}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">لا توجد مقاسات محددة لهذا اللون</p>
                      )}
                    </div>
                  ))}

                  {/* No colors */}
                  {product.colors.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">لا توجد ألوان</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Empty state */}
      {!loading && filtered.length === 0 && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3" />
          <p>{search ? "لا توجد نتائج" : "لا توجد منتجات"}</p>
        </div>
      )}
    </div>
  );
}
