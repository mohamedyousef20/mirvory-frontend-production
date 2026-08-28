import SellerTermsAndConditionsPage from "@/components/legal/seller-terms-and-conditions-page"

export default function SellerTermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-muted/20">
            <main className="flex-1">
                <div className="container px-4 py-10">
                    <SellerTermsAndConditionsPage />
                </div>
            </main>
        </div>
    )
}
