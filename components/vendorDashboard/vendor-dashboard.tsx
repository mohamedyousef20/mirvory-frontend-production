"use client"

import { SetStateAction, useEffect, useMemo, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  apiServices, authService, categoryService, orderService,
  productService, returnService, userService
} from "@/lib/api"

import { VendorTabBar } from "./VendorTabBar"
import { OverviewTab } from "./tabs/OverviewTab"
import { AnalyticsTab } from "./tabs/AnalyticsTab"
import { TransactionsTab } from "./tabs/TransactionsTab"
import { ProductsTab } from "./tabs/ProductsTab"
import { OrdersTab } from "./tabs/OrdersTab"
import { ReturnsTab } from "./tabs/ReturnsTab"
import { VendorHeader } from "./VendorHeader"
import { MirvoryPageLoader } from "../MirvoryLoader"


export function VendorDashboard() {
  const { language, t } = useLanguage()
  const { sellerDashboardService } = apiServices

  // ── all state unchanged ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview")
  const [products, setProducts] = useState<Product[]>([])
  const [balance, setBalance] = useState({})
  const [user, setUser] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [preparingOrderId, setPreparingOrderId] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProductData, setEditingProductData] = useState<EditingProductData>({})
  const [updatingProductId, setUpdatingProductId] = useState(null)
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortOption, setSortOption] = useState("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [totalProducts, setTotalProducts] = useState(0)
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('recent')
  const [filteredOrders, setFilteredOrders] = useState([])
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([])
  const [dashboardCounters, setDashboardCounters] = useState({ newOrders: 0, ongoingOrders: 0, returns: 0, reviews: 0 })
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [transactionPage, setTransactionPage] = useState(1)
  const [transactionTotalPages, setTransactionTotalPages] = useState(1)
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'credit' | 'debit'>('all')
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [activityLogs, setActivityLogs] = useState<OrderActivityLogEntry[]>([])
  const [activityPage, setActivityPage] = useState(1)
  const [activityTotalPages, setActivityTotalPages] = useState(1)
  const [selectedOrderForActivity, setSelectedOrderForActivity] = useState<string | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [returnTab, setReturnTab] = useState("adminPending")
  const [returnTabMeta, setCurrentReturnTabMeta] = useState({})
  const [currentReturnList, setCurrentReturnList] = useState([])

  // ── useEffects and handlers ────────────────────────────────────────────────

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard counters
        const res = await sellerDashboardService.getCounters();
        setDashboardCounters(res.data?.data || res.data || {});
        // Fetch user data
        const userRes = await authService.getMe();
        setUser(userRes.data);

        // Fetch seller balance
        const balanceRes = await userService.getSellerBalance();
        setBalance(balanceRes.data?.data || balanceRes.data || {});

        // Fetch seller products for overview
        const productsRes = await productService.getSellerProducts({ limit: 4 });
        setProducts(productsRes.data?.data || productsRes.data?.products || productsRes.data || []);

        const categoriesRes = await categoryService.getCategories();

        setCategories(categoriesRes.data ||[]);
        // Fetch seller orders for overview (recent orders)
        const ordersRes = await orderService.getSellerOrders();
        setOrders(ordersRes.data || []);
        setFilteredOrders(ordersRes.data || []);

      } catch (error: any) {
        console.error('Failed to fetch initial data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Force loading to false after 3 seconds as fallback
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Fetch seller orders using getSellerOrders
  const fetchOrders = async () => {
    try {
      const response = await orderService.getSellerOrders();
      console.log(response, 'seller order ')
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error(language === 'ar' ? 'فشل جلب الطلبات' : 'Failed to fetch orders');
    }
  };
  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);

      const res = await sellerDashboardService.getTransactions({
        page: transactionPage,
        limit: 10,
        type: transactionTypeFilter,
      });

      setTransactions(res.data?.data || res.data || []);
      setTransactionTotalPages(res.data?.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      // toast.error(language === "ar" ? "فشل جلب المعاملات" : "Failed to fetch transactions");
    } finally {
      setTransactionsLoading(false);
    }
  };
  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch transaction  when transaction tab is active

  useEffect(() => {
    if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [activeTab, transactionPage, transactionTypeFilter]);
  // Fetch return requests when returns tab is active
  useEffect(() => {
    if (activeTab === 'returns') {
      fetchReturnRequests();
    }
  }, [activeTab, returnTab]);

  const tabs = [
    { value: 'overview', label: language === "ar" ? "نظرة عامة" : "Overview" },
    // { value: 'analytics', label: language === 'ar' ? 'التحليلات' : 'Analytics' },
    // { value: 'transactions', label: language === 'ar' ? 'المعاملات' : 'Transactions' },
    { value: 'orders', label: t("orders") },
    { value: 'products', label: t("products") },
    { value: 'returns', label: language === "ar" ? "طلبات الإرجاع" : "Returns" },
    // { value: 'activity', label: language === 'ar' ? 'سجل الطلبات' : 'Order Activity' },
  ]

  if (loading) {
    return <MirvoryPageLoader text={language === "ar" ? "جارى التحميل..." : "Loading..."} />
  }

  if (error) {
    return (
      <div className="container px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">{error}</div>
      </div>
    )
  }

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await sellerDashboardService.getAnalytics();
      setAnalytics(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      setAnalyticsError(language === 'ar' ? 'تعذر تحميل التحليلات' : 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };
  const handleEditProduct = (product: any) => {
  setEditingProductId(product._id);

  setEditingProductData({
    title: product.title,
    price: product.price,
    discountPercentage: product.discountPercentage,
    quantity: product.quantity,
    status: product.status,
    category: product.category,
  });
};

  const handleUpdateProduct = async (productId: string) => {
    try {
      setUpdatingProductId(productId);

      await productService.updateProduct(
        productId,
        editingProductData
      );

      setProducts(prev =>
        prev.map(product =>
          product._id === productId
            ? {
              ...product,
              ...editingProductData,
            }
            : product
        )
      );

      setEditingProductId(null);
      setEditingProductData({});

      toast.success(
        language === "ar"
          ? "تم تحديث المنتج بنجاح"
          : "Product updated successfully"
      );
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
        (language === "ar"
          ? "فشل تحديث المنتج"
          : "Failed to update product")
      );
    } finally {
      setUpdatingProductId(null);
    }
  };


const handleDeleteProduct = async (productId: string) => {
  try {
    setDeletingProductId(productId);

    await productService.deleteProduct(productId);

    setProducts(prev =>
      prev.filter(product => product._id !== productId)
    );

    toast.success(
      language === "ar"
        ? "تم حذف المنتج"
        : "Product deleted successfully"
    );
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      (language === "ar"
        ? "فشل حذف المنتج"
        : "Failed to delete product")
    );
  } finally {
    setDeletingProductId(null);
  }
};

  const clearProductFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortOption("newest");
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
  };

  const handleSearch = () => {
    // Implementation for search
  };

  const handleFilterChange = (filterType: string, value: string) => {
    // Implementation for filter change
  };

  const clearOrderFilters = () => {
    // Implementation for clearing order filters
  };

  const handleConfirmPreparation = async (orderId: string, itemId: string) => {
    try {
      const preparingKey = `${orderId}-${itemId}`;
      setPreparingOrderId(preparingKey);

      // Call API to prepare specific item
      const response = await orderService.confirmItemPreparation(orderId, itemId);

      // Update only the specific item
      setOrders(prev =>
        prev.map(order => {
          if (order._id !== orderId) return order;

          const newItems = order.items.map((item: any) => {
            if (item._id === itemId) {
              return { ...item, isPrepared: true };
            }
            return item;
          });

          // Check if all items are prepared
          const allPrepared = newItems.every((i: any) => i.isPrepared);

          return {
            ...order,
            items: newItems,
            isPrepared: allPrepared
          };
        })
      );

      setFilteredOrders(prev =>
        prev.map(order => {
          if (order._id !== orderId) return order;

          const newItems = order.items.map((item: any) => {
            if (item._id === itemId) {
              return { ...item, isPrepared: true };
            }
            return item;
          });

          return {
            ...order,
            items: newItems,
            isPrepared: newItems.every((i: any) => i.isPrepared)
          };
        })
      );

      toast.success(
        language === 'ar'
          ? 'تم تجهيز المنتج بنجاح'
          : 'Item prepared successfully'
      );

    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        (language === 'ar' ? 'فشل تجهيز المنتج' : 'Failed to prepare item')
      );
    } finally {
      setPreparingOrderId(null);
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancellingOrderId(orderId);
      await orderService.cancelOrder(orderId);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setFilteredOrders(prev => prev.filter(o => o._id !== orderId));
      toast.success(language === 'ar' ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error?.response?.data?.message || (language === 'ar' ? 'فشل إلغاء الطلب' : 'Failed to cancel order'));
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleViewDetails = (order: any) => {
    // Navigate to order details page
    window.open(`/vendor/orders/${order._id}`, '_blank');
  };

  const handlePrintInvoice = async (order: any) => {
    try {
      const response = await orderService.printInvoice(order._id);
      const invoiceData = response.data;

      // Generate printable HTML invoice
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(language === 'ar' ? 'تم حظر النافذة المنبثقة' : 'Popup blocked');
        return;
      }

      const isRTL = language === 'ar';
      const itemsRows = invoiceData.items?.map((item: any) => {
        const colorSize = [];
        if (item.color) colorSize.push(`${isRTL ? 'لون' : 'Color'}: ${item.color}`);
        if (item.size) colorSize.push(`${isRTL ? 'مقاس' : 'Size'}: ${item.size}`);
        const colorSizeText = colorSize.length > 0 ? `<br/><small style="color: #666;">${colorSize.join(' | ')}</small>` : '';

        return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.product}${colorSizeText}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.price} EGP</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.total} EGP</td>
        </tr>
      `}).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
          <title>${isRTL ? 'فاتورة' : 'Invoice'} #${invoiceData.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { text-align: center; color: #333; }
            .header { margin-bottom: 30px; }
            .header p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 10px; border: 1px solid #ddd; }
            .totals { margin-top: 20px; text-align: ${isRTL ? 'left' : 'right'}; }
            .totals p { margin: 5px 0; }
            .total { font-weight: bold; font-size: 18px; color: #333; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>${isRTL ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice'}</h1>
          ${invoiceData.isSellerInvoice ? `<p style="text-align: center; color: #666; font-size: 14px; margin-top: -10px;">${isRTL ? '(فاتورة بائع - منتجاتي فقط)' : '(Seller Invoice - My Products Only)'}</p>` : ''}
          <div class="header">
            <p><strong>${isRTL ? 'رقم الفاتورة:' : 'Invoice Number:'}</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>${isRTL ? 'رقم الطلب:' : 'Order Number:'}</strong> ${invoiceData.orderNumber}</p>
            <p><strong>${isRTL ? 'التاريخ:' : 'Date:'}</strong> ${new Date(invoiceData.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</p>
            <hr/>
            <p><strong>${isRTL ? 'العميل:' : 'Customer:'}</strong> ${invoiceData.buyer?.name || '-'}</p>
            <p><strong>${isRTL ? 'البريد:' : 'Email:'}</strong> ${invoiceData.buyer?.email || '-'}</p>
            <p><strong>${isRTL ? 'الهاتف:' : 'Phone:'}</strong> ${invoiceData.buyer?.phone || '-'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>${isRTL ? 'المنتج' : 'Product'}</th>
                <th>${isRTL ? 'الكمية' : 'Quantity'}</th>
                <th>${isRTL ? 'السعر' : 'Price'}</th>
                <th>${isRTL ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div class="totals">
            <p><strong>${isRTL ? 'المجموع الفرعي:' : 'Subtotal:'}</strong> ${invoiceData.subtotal} EGP</p>
            ${!invoiceData.isSellerInvoice && invoiceData.discount > 0 ? `<p><strong>${isRTL ? 'الخصم:' : 'Discount:'}</strong> -${invoiceData.discount} EGP</p>` : ''}
            ${!invoiceData.isSellerInvoice ? `<p><strong>${isRTL ? 'الشحن:' : 'Shipping:'}</strong> ${invoiceData.shippingFee} EGP</p>` : ''}
            <p class="total"><strong>${isRTL ? 'الإجمالي:' : 'Total:'}</strong> ${invoiceData.total} EGP</p>
            <p><strong>${isRTL ? 'طريقة الدفع:' : 'Payment Method:'}</strong> ${invoiceData.paymentMethod}</p>
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error: any) {
      console.error('Failed to print invoice:', error);
      toast.error(error?.response?.data?.message || (language === 'ar' ? 'فشل طباعة الفاتورة' : 'Failed to print invoice'));
    }
  };

  const handleContactBuyer = (order: any) => {
    // TODO: Open chat or contact form with buyer
    console.log('Contact buyer for order:', order);
    toast.info(language === 'ar' ? 'التواصل مع العميل' : 'Contact buyer');
  };

  const handleViewShipping = (order: any) => {
    // TODO: Show shipping info modal
    console.log('View shipping for order:', order);
    toast.info(language === 'ar' ? 'معلومات الشحن' : 'Shipping information');
  };

  const getReturnStatusLabel = (status: string) => {
    const labels: { [key: string]: { en: string; ar: string } } = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      approved: { en: 'Approved', ar: 'مقبول' },
      rejected: { en: 'Rejected', ar: 'مرفوض' },
      processing: { en: 'Processing', ar: 'قيد المعالجة' },
      processed: { en: 'Processed', ar: 'مكتمل' }
    };
    const label = labels[status] || { en: status, ar: status };
    return language === 'ar' ? label.ar : label.en;
  };

  const fetchReturnRequests = async () => {
    try {
      const response = await returnService.getReturnRequests();
      setReturnRequests(response.data || []);
      
      // Set up tab metadata
      const meta = [
        { key: 'adminPending', title: language === 'ar' ? 'قيد المراجعة' : 'Admin Review', description: language === 'ar' ? 'بانتظار موافقة الإدارة' : 'Waiting for admin approval', count: (response.data || []).filter((r: any) => r.status === 'pending').length },
        { key: 'approved', title: language === 'ar' ? 'مقبول' : 'Approved', description: language === 'ar' ? 'تمت الموافقة على الإرجاع' : 'Return approved', count: (response.data || []).filter((r: any) => r.status === 'approved').length },
        { key: 'processing', title: language === 'ar' ? 'قيد المعالجة' : 'Processing', description: language === 'ar' ? 'جاري معالجة الإرجاع' : 'Processing return', count: (response.data || []).filter((r: any) => r.status === 'processing').length },
        { key: 'processed', title: language === 'ar' ? 'مكتمل' : 'Processed', description: language === 'ar' ? 'تم إكمال الإرجاع' : 'Return completed', count: (response.data || []).filter((r: any) => r.status === 'processed').length },
        { key: 'rejected', title: language === 'ar' ? 'مرفوض' : 'Rejected', description: language === 'ar' ? 'تم رفض الإرجاع' : 'Return rejected', count: (response.data || []).filter((r: any) => r.status === 'rejected').length }
      ];
      setCurrentReturnTabMeta(meta);
      
      // Set current list based on active tab
      const filtered = (response.data || []).filter((r: any) => {
        if (returnTab === 'adminPending') return r.status === 'pending';
        if (returnTab === 'approved') return r.status === 'approved';
        if (returnTab === 'processing') return r.status === 'processing';
        if (returnTab === 'processed') return r.status === 'processed';
        if (returnTab === 'rejected') return r.status === 'rejected';
        return true;
      });
      setCurrentReturnList(filtered);
    } catch (error: any) {
      console.error('Failed to fetch return requests:', error);
      toast.error(language === 'ar' ? 'فشل جلب طلبات الإرجاع' : 'Failed to fetch return requests');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container px-4 py-8 md:py-10 max-w-screen-xl mx-auto">

        <VendorHeader
          title={t("vendorDashboard")}
          description={language === "ar" ? "مرحبًا بك في لوحة تحكم البائع، يمكنك إدارة منتجاتك وطلباتك من هنا." : "Welcome to your vendor dashboard, manage your products and orders from here."}
          addLabel={language === "ar" ? "إضافة منتج جديد" : "Add New Product"}
        />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <VendorTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <TabsContent value="overview">
            <OverviewTab language={language} t={t} dashboardCounters={dashboardCounters} balance={balance} orders={orders} products={products} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab language={language} analytics={analytics} analyticsLoading={analyticsLoading} analyticsError={analyticsError} onRefresh={fetchAnalyticsData} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab
              language={language} transactions={transactions} transactionsLoading={transactionsLoading}
              transactionPage={transactionPage} transactionTotalPages={transactionTotalPages}
              transactionTypeFilter={transactionTypeFilter}
              onTypeFilterChange={(val) => { setTransactionPage(1); setTransactionTypeFilter(val) }}
              onPageChange={setTransactionPage}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab
              language={language} products={products} categories={categories}
              searchTerm={searchTerm} statusFilter={statusFilter} sortOption={sortOption}
              selectedCategories={selectedCategories} priceRange={priceRange}
              page={page} pageSize={pageSize} totalProducts={totalProducts}
              editingProductId={editingProductId} editingProductData={editingProductData}
              updatingProductId={updatingProductId}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onSortChange={setSortOption}
              onCategoryChange={(v) => v === "all" ? setSelectedCategories([]) : setSelectedCategories([v])}
              onClearFilters={clearProductFilters}
              onEdit={handleEditProduct}
              onUpdate={handleUpdateProduct}
              onDelete={handleDeleteProduct} onCancelEdit={() => { setEditingProductId(null); setEditingProductData({}) }}
              onEditDataChange={setEditingProductData}
              onPageChange={setPage}
              setPriceRange={setPriceRange} setStatusFilter={setStatusFilter}
              setSelectedCategories={setSelectedCategories} setSearchTerm={setSearchTerm}
            />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab
              language={language} filteredOrders={filteredOrders}
              searchTerm={searchTerm} filters={filters} sortBy={sortBy}
              preparingOrderId={preparingOrderId}
              cancellingOrderId={cancellingOrderId}
              onSearchChange={setSearchTerm} onSearchSubmit={handleSearch}
              onFilterChange={handleFilterChange} onSortChange={setSortBy}
              onClearFilters={clearOrderFilters}
              onConfirmPreparation={handleConfirmPreparation}
              onViewDetails={handleViewDetails}
              onPrintInvoice={handlePrintInvoice}
              onContactBuyer={handleContactBuyer}
              onCancelOrder={handleCancelOrder}
              onViewShipping={handleViewShipping}
            />
          </TabsContent>

          <TabsContent value="returns">
            <ReturnsTab
              language={language} returnTab={returnTab} onReturnTabChange={setReturnTab}
              returnTabMeta={returnTabMeta} currentReturnList={currentReturnList}
              getReturnStatusLabel={getReturnStatusLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}