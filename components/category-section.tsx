"use client"

import Link from "next/link"
import Image from "next/image"
import { useLanguage } from "@/components/language-provider"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { categoryService } from "@/lib/api"

interface Category {
  _id: string
  name: string
  description?: string
  image?: string
  status?: "active" | "inactive"
}

export function CategorySection() {
  const { language } = useLanguage()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await categoryService.getCategories()

        if (!mounted) return

        // Supports both response.data and response.data.data
        const payload = response?.data
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : []

        setCategories(
          items.filter(
            (category: Category) =>
              category &&
              category._id &&
              category.name &&
              category.status !== "inactive"
          )
        )
      } catch (err: unknown) {
        if (!mounted) return

        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ||
          (language === "ar"
            ? "تعذر تحميل الفئات حاليًا"
            : "Failed to load categories")

        setError(message)
        toast.error(message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCategories()

    return () => {
      mounted = false
    }
  }, [language])

  const title =
    language === "ar" ? "تسوق حسب الفئة" : "Shop by Category"

  const viewAll =
    language === "ar" ? "عرض كل الفئات" : "View All Categories"

  if (loading) {
    return (
      <section className="py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tight">
          {title}
        </h2>

        <div className="rounded-xl border p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-semibold text-primary hover:underline"
          >
            {language === "ar" ? "إعادة المحاولة" : "Try Again"}
          </button>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === "ar"
              ? "اكتشف مجموعتك المفضلة"
              : "Discover your favorite collection"}
          </p>
        </div>

        <Link
          href="/categories"
          className="shrink-0 text-sm font-semibold text-primary transition-colors hover:underline"
        >
          {viewAll}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => {
          const categoryName = category.name?.trim()

          if (!categoryName) return null

          return (
            <Link
              key={category._id}
              href={`/categories/${category._id}/products`}
              aria-label={categoryName}
              className="group block min-w-0"
            >
              <Card className="relative overflow-hidden rounded-xl border-0 bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={categoryName}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark gradient keeps the category name readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="text-center text-base font-bold text-white drop-shadow-md sm:text-lg">
                      {categoryName}
                    </h3>

                    <p className="mt-1 text-center text-xs font-medium text-white/80 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      {language === "ar"
                        ? "اكتشف المنتجات"
                        : "Explore Products"}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
