import { WishlistPage } from "@/components/wishlist-page"
import { WishlistMobile } from "@/components/m3/wishlist-mobile"

export default function Wishlist() {
  return (
    <>
      <WishlistMobile />
      <div className="hidden md:flex min-h-screen flex-col">
        <main className="flex-1">
          <div className="container px-4 py-6 md:py-10">
            <WishlistPage />
          </div>
        </main>
      </div>
    </>
  )
}
