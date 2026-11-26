import { redirect } from "next/navigation"

// The old category page is replaced by the new catalog, filtered by category.
export default async function CategoryProductsRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/products?category=${encodeURIComponent(id)}`)
}
