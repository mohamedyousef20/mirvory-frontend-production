"use client";
import { ControlPanelNav } from "@/components/dashboard/ControlPanelNav";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { OverviewTab } from "./OverviewTab";
import { OrdersTab } from "./OrdersTab";
import { ProductsTab } from "./ProductsTab";
import { CategoriesTab } from "./CategoriesTab";
import { VendorsTab } from "./VendorsTab";
// import { BrandsTab } from "./BrandsTab";
import { UsersTab } from "./UsersTab";
import { AnnouncementsTab } from "./AnnouncementsTab";
import { PickupPointsTab } from "./PickupPointsTab";
import { ReturnsTab } from "./ReturnsTab";
import { ComplaintsTab } from "./ComplaintsTab";
import { CouponsTab } from "./CouponsTab";
import { OffersTab } from "./OffersTab";
import { PromotionsTab } from "./PromotionsTab";
import { ProductRequestsTab } from "./ProductRequestsTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { ShippingSettingsTab } from "./ShippingSettingsTab";
import { TransactionsTab } from "./TransactionsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { InventoryTab } from "./InventoryTab";
import { BehaviorTab } from "./BehaviorTab";
import { OrderNotificationBell } from "@/components/admin/OrderNotificationBell";
import { PushNotificationToggle } from "@/components/admin/PushNotificationToggle";
import Link from "next/link";

type Offer = {
  _id: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number | null;
  usageCount: number;
  image: string;
  createdAt: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
};

// نفس التابات في مكان واحد — تستخدمها كل من نسخة الـ Select (موبايل) ونسخة الـ TabsList (ديسكتوب)
type TranslateFunction = ReturnType<typeof useAdminDashboard>["t"];

const TAB_ITEMS = (isArabic: boolean, t: TranslateFunction) => [{ value: "overview", label: isArabic ? "نظرة عامة" : "Overview" },
{ value: "vendors", label: isArabic ? "البائعين" : "Vendors" },
{ value: "users", label: isArabic ? "المستخدمين" : "Users" },
{ value: "products", label: t("products") },
{ value: "orders", label: t("orders") },
{ value: "categories", label: isArabic ? "التصنيفات" : "Categories" },
{ value: "coupons", label: isArabic ? "الكوبونات" : "Coupons" },
{ value: "offers", label: isArabic ? "العروض" : "Offers" },
{ value: "promotions", label: isArabic ? "العروض الترويجية" : "Promotions" },
{ value: "shipping-settings", label: isArabic ? "إعدادات الشحن" : "Shipping" },
{ value: "announcements", label: isArabic ? "الإعلانات" : "Announcements" },
{ value: "pickup", label: isArabic ? "نقاط الاستلام" : "Pickup" },
{ value: "complaints", label: isArabic ? "الشكاوى" : "Complaints" },
{ value: "returns", label: isArabic ? "طلبات الإرجاع" : "Returns" },
{ value: "product-requests", label: isArabic ? "طلبات المنتجات" : "Product Requests" },
{ value: "loyalty", label: isArabic ? "برنامج الولاء" : "Loyalty" },
{ value: "analytics", label: isArabic ? "التحليلات" : "Analytics" },
{ value: "behavior", label: isArabic ? "سلوك المشترين" : "Buyer Behavior" },
{ value: "inventory", label: isArabic ? "المخزون" : "Inventory" },
{ value: "transactions", label: isArabic ? "المعاملات" : "Transactions" },
];

export function AdminDashboard() {
  const {
    // State
    activeTab,
    setActiveTab,
    updatingUser,
    handleDeleteUser,
    // handleSoftDeleteUser,
    handleRestoreUser,
    // handleToggleTrustSeller,
    products,
    productsPage,
    productsPages,
    setProductsPage,
    coupons,
    loadingProducts,
    errorProducts,
    categories,
    // brands,
    // loadingBrands,
    // errorBrands,
    loading,
    error,
    announcementImage,
    imageUrl,
    setImageUrl,
    isAuthenticated,
    isAdmin,
    sellers,
    sellersPage,
    sellersPages,
    setSellersPage,
    orders,
    ordersPage,
    ordersPages,
    setOrdersPage,
    loadingOrders,
    errorOrders,
    pickupPoints,
    users,
    usersPage,
    usersPages,
    setUsersPage,
    returnsPage,
    returnsPages,
    setReturnsPage,
    loadingPickupPoints,
    announcements,
    loadingAnnouncements,
    errorAnnouncements,
    returnRequests,
    loadingReturns,
    errorReturns,
    platformEarnings,
    loadingEarnings,
    errorEarnings,
    dashboardCounters,
    transactions,
    transactionsLoading,
    transactionFilters,
    setTransactionFilters,
    transactionsPage,
    setTransactionsPage,
    transactionsPages,
    analytics,
    analyticsLoading,
    analyticsError,

    // Offers state
    offers,
    loadingOffers,
    errorOffers,
    offersPage,
    offersPages,
    setOffersPage,

    // Coupon states
    showAddCoupon,
    setShowAddCoupon,
    editingCoupon,
    setEditingCoupon,
    newCoupon,
    setNewCoupon,

    // Form states
    newCategory,
    setNewCategory,
    isCreating,
    setIsCreating,
    showSpinner,
    editingCategory,
    setEditingCategory,
    showAddPickupPoint,
    setShowAddPickupPoint,
    selectedPickupPoint,
    setSelectedPickupPoint,
    showAddAnnouncement,
    setShowAddAnnouncement,
    selectedAnnouncement,
    setSelectedAnnouncement,
    newAnnouncement,
    setNewAnnouncement,

    // Functions
    handleCreateCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleApproveProduct,
    handleRejectProduct,
    handleTrustProduct,
    handleSaveAnnouncement,
    handleDeleteAnnouncement,
    handleSubmitPickupPoint,
    handleDeletePickupPoint,
    handleImageUpload,
    handleRemoveImage,
    // handleDeleteBrand,
    handleApproveReturn,
    handleDeleteReturn,
    handleRejectReturn,
    handleProcessReturn,
    handleFinishedReturn,
    handleToggleCouponStatus,
    updateDeliveryStatus,
    updatePaymentStatus,
    orderComplete,
    handleDeleteOrder,

    // Coupon functions
    handleCreateCoupon,
    handleUpdateCoupon,
    handleGetCoupon,
    handleGetCouponStats,
    handleCouponInputChange,
    handleEditCoupon,
    handleAddCoupon,
    handleCloseCouponForm,
    handleDeleteCoupon,

    // Data fetching functions
    fetchProducts,
    fetchCategories,
    // fetchBrands,
    fetchCoupons,
    fetchOrders,
    fetchPickupPoints,
    fetchAnnouncements,
    fetchReturnRequests,
    // fetchPlatformEarnings,
    fetchDashboardCounters,
    // fetchAdminTransactions,
    fetchAdminAnalytics,
    handleUpdateVendorBalance,
    handleUpdateVendorStatus,
    handleToggleUserActive,
    // Offer functions
    fetchOffers,

    // Delete a product from the admin table — works for ANY seller's product.
    // The permission itself is enforced on the backend (admin/super_admin only).
    handleDeleteProduct,
    handleToggleOffer,
    handleDeleteOffer,

    // Loyalty state (كانت ناقصة من هنا خالص، وده سبب باج "برنامج الولاء مش بيشتغل")
    loyaltyUsers,
    loadingLoyalty,
    errorLoyalty,
    loyaltyPage,
    loyaltyPages,
    setLoyaltyPage,
    loyaltyTierFilter,
    setLoyaltyTierFilter,
    loyaltySearchQuery,
    setLoyaltySearchQuery,
    selectedLoyaltyUser,
    setSelectedLoyaltyUser,
    adjustDialogOpen,
    setAdjustDialogOpen,
    adjustPoints,
    setAdjustPoints,
    adjustNotes,
    setAdjustNotes,
    adjusting,
    handleLoyaltySearch,
    handleAdjustPoints,

    // Language
    language,
    t,
    isArabic
  } = useAdminDashboard();

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold text-destructive mb-4">
            {isArabic ? "غير مصرح بالوصول" : "Access Denied"}
          </div>
          <p className="text-muted-foreground mb-4">
            {isArabic
              ? "ليس لديك الصلاحيات اللازمة للوصول إلى لوحة التحكم الإدارية."
              : "You don't have permission to access the admin dashboard."}
          </p>
          <Button onClick={() => window.history.back()}>
            {isArabic ? "العودة" : "Go Back"}
          </Button>
        </div>
      </div>
    );
  }

  const tabItems = TAB_ITEMS(isArabic, t);

  return (
    <div className="mv-admin cp-dashboard w-full" dir={isArabic ? "rtl" : "ltr"}>
      <header className="cp-page-header">
        <div><p className="cp-eyebrow">MIRVORY / {isArabic ? "الإدارة" : "ADMIN"}</p><h1>{isArabic ? "متجرك تحت السيطرة" : "Your store, in focus"}</h1><p className="cp-header-description">{isArabic ? "تابع الطلبات، جهّز المنتجات، وخد خطوتك الجاية." : "Follow orders, manage your catalog, and plan your next move."}</p></div>
        <div className="cp-header-actions"><Link href="/" className="cp-store-link">{isArabic ? "فتح المتجر ↗" : "View store ↗"}</Link><OrderNotificationBell /></div>
      </header>
      {/* Main Tabs */}
      <Tabs dir={isArabic ? "rtl" : "ltr"}
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="cp-layout"
      >
        <ControlPanelNav items={tabItems} active={activeTab} onChange={setActiveTab} ar={isArabic} />
        <main className="cp-main" id="dashboard-content">
          <div className="cp-section-bar"><div><p className="cp-eyebrow">{isArabic ? "لوحة التحكم" : "CONTROL PANEL"}</p><h2>{tabItems.find(item => item.value === activeTab)?.label}</h2></div><div className="cp-section-tools"><PushNotificationToggle /><Link href="/admin/notifications" className="cp-notify-link">{isArabic ? "إرسال إشعار" : "Send notification"}</Link></div></div>
        {/* Tab Contents — من غير أي تغيير */}
        <TabsContent value="overview">
          <OverviewTab
            orders={orders}
            products={products}
            sellers={sellers}
            users={users}
            platformEarnings={platformEarnings}
            loadingEarnings={loadingEarnings}
            errorEarnings={errorEarnings}
            isArabic={isArabic}
            dashboardCounters={dashboardCounters || undefined}
            fetchDashboardCounters={fetchDashboardCounters}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab
            orders={orders}
            loadingOrders={loadingOrders}
            errorOrders={errorOrders}
            isArabic={isArabic}
            pagination={{ currentPage: ordersPage, totalPages: ordersPages }}
            onPageChange={setOrdersPage}
            updateDeliveryStatus={updateDeliveryStatus}
            updatePaymentStatus={updatePaymentStatus}
            orderComplete={orderComplete}
            onDeleteOrder={handleDeleteOrder}
          />
        </TabsContent>

        <TabsContent value="products">
          <ProductsTab
            products={products}
            loadingProducts={loadingProducts}
            errorProducts={errorProducts}
            isArabic={isArabic}
            pagination={{ currentPage: productsPage, totalPages: productsPages }}
            onPageChange={setProductsPage}
            handleApproveProduct={handleApproveProduct}
            handleRejectProduct={handleRejectProduct}
            handleTrustProduct={handleTrustProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTab
            categories={categories}
            loading={loading}
            error={error}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            editingCategory={editingCategory}
            setEditingCategory={setEditingCategory}
            handleCreateCategory={handleCreateCategory}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleDeleteCategory}
            isArabic={isArabic}
            showSpinner={showSpinner}
            fetchCategories={fetchCategories}
          />
        </TabsContent>

        <TabsContent value="vendors">
          <VendorsTab
            sellers={sellers}
            isArabic={isArabic}
            updatingUserId={updatingUser}
            pagination={{
              currentPage: sellersPage,
              totalPages: sellersPages,
            }}
            onPageChange={setSellersPage}
            onDelete={handleDeleteUser}
            onUpdateBalance={handleUpdateVendorBalance}
            onUpdateStatus={handleUpdateVendorStatus}
            onToggleActive={handleToggleUserActive}
            loadingSellers={loading}
            errorSellers={error}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab
            users={users}
            isArabic={isArabic}
            updatingUserId={updatingUser}
            pagination={{ currentPage: usersPage, totalPages: usersPages }}
            onPageChange={setUsersPage}
            onDelete={handleDeleteUser}
            toggleUserActive={handleToggleUserActive}
            onRestore={handleRestoreUser}
          />
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsTab
            coupons={coupons}
            isArabic={isArabic}
            handleDeleteCoupon={handleDeleteCoupon}
            onToggleStatus={handleToggleCouponStatus}
            showAddCoupon={showAddCoupon}
            setShowAddCoupon={setShowAddCoupon}
            editingCoupon={editingCoupon}
            setEditingCoupon={setEditingCoupon}
            newCoupon={newCoupon}
            setNewCoupon={setNewCoupon}
            handleCreateCoupon={handleCreateCoupon}
            handleUpdateCoupon={handleUpdateCoupon}
            handleCouponInputChange={handleCouponInputChange}
            handleEditCoupon={handleEditCoupon}
            handleAddCoupon={handleAddCoupon}
            handleCloseCouponForm={handleCloseCouponForm}
            fetchCoupons={fetchCoupons}
          />
        </TabsContent>

        <TabsContent value="offers">
          <OffersTab
            offers={offers}
            loadingOffers={loadingOffers}
            errorOffers={errorOffers}
            isArabic={isArabic}
            pagination={{ currentPage: offersPage, totalPages: offersPages }}
            onPageChange={setOffersPage}
            handleToggleOffer={handleToggleOffer}
            handleDeleteOffer={handleDeleteOffer}
            fetchOffers={fetchOffers}
          />
        </TabsContent>

        <TabsContent value="promotions">
          <PromotionsTab isArabic={isArabic} />
        </TabsContent>

        <TabsContent value="shipping-settings">
          <ShippingSettingsTab isArabic={isArabic} />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsTab
            announcements={announcements}
            loadingAnnouncements={loadingAnnouncements}
            errorAnnouncements={errorAnnouncements}
            showAddAnnouncement={showAddAnnouncement}
            setShowAddAnnouncement={setShowAddAnnouncement}
            selectedAnnouncement={selectedAnnouncement}
            setSelectedAnnouncement={setSelectedAnnouncement}
            newAnnouncement={newAnnouncement}
            setNewAnnouncement={setNewAnnouncement}
            announcementImage={announcementImage}
            handleSaveAnnouncement={handleSaveAnnouncement}
            handleDeleteAnnouncement={handleDeleteAnnouncement}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            isArabic={isArabic}
            fetchAnnouncements={fetchAnnouncements}
          />
        </TabsContent>

        <TabsContent value="pickup">
          <PickupPointsTab
            sellers={sellers}
            pickupPoints={pickupPoints}
            loadingPickupPoints={loadingPickupPoints}
            showAddPickupPoint={showAddPickupPoint}
            setShowAddPickupPoint={setShowAddPickupPoint}
            selectedPickupPoint={selectedPickupPoint}
            setSelectedPickupPoint={setSelectedPickupPoint}
            handleSubmitPickupPoint={handleSubmitPickupPoint}
            handleDeletePickupPoint={handleDeletePickupPoint}
            isArabic={isArabic}
            fetchPickupPoints={fetchPickupPoints}
          />
        </TabsContent>

        <TabsContent value="complaints">
          <ComplaintsTab />
        </TabsContent>

        <TabsContent value="returns">
          <ReturnsTab
            returnRequests={returnRequests}
            loadingReturns={loadingReturns}
            errorReturns={errorReturns}
            pagination={{ currentPage: returnsPage, totalPages: returnsPages }}
            onPageChange={setReturnsPage}
            isArabic={isArabic}
            handleApproveReturn={handleApproveReturn}
            handleDeleteReturn={handleDeleteReturn}
            handleRejectReturn={handleRejectReturn}
            handleProcessReturn={handleProcessReturn}
            handleFinishedReturn={handleFinishedReturn}
            fetchReturnRequests={fetchReturnRequests}
          />
        </TabsContent>

        <TabsContent value="product-requests">
          <ProductRequestsTab />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltyTab
            loyaltyUsers={loyaltyUsers}
            loadingLoyalty={loadingLoyalty}
            errorLoyalty={errorLoyalty}
            loyaltyPage={loyaltyPage}
            loyaltyPages={loyaltyPages}
            setLoyaltyPage={setLoyaltyPage}
            loyaltyTierFilter={loyaltyTierFilter}
            setLoyaltyTierFilter={setLoyaltyTierFilter}
            loyaltySearchQuery={loyaltySearchQuery}
            setLoyaltySearchQuery={setLoyaltySearchQuery}
            selectedLoyaltyUser={selectedLoyaltyUser}
            setSelectedLoyaltyUser={setSelectedLoyaltyUser}
            adjustDialogOpen={adjustDialogOpen}
            setAdjustDialogOpen={setAdjustDialogOpen}
            adjustPoints={adjustPoints}
            setAdjustPoints={setAdjustPoints}
            adjustNotes={adjustNotes}
            setAdjustNotes={setAdjustNotes}
            adjusting={adjusting}
            handleLoyaltySearch={handleLoyaltySearch}
            handleAdjustPoints={handleAdjustPoints}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab
            analytics={analytics}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            fetchAdminAnalytics={fetchAdminAnalytics}
            isArabic={isArabic}
          />
        </TabsContent>

        <TabsContent value="behavior">
          <BehaviorTab />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab
            transactions={transactions}
            sellers={sellers}
            isArabic={isArabic}
            transactionFilters={transactionFilters}
            setTransactionFilters={setTransactionFilters}
            transactionsLoading={transactionsLoading}
            transactionsPage={transactionsPage}
            setTransactionsPage={setTransactionsPage}
            transactionsPages={transactionsPages}
          />
        </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}