"use client"

import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"

/**
 * Home page call-to-action for the "request a product" service.
 * Sends the shopper to /request-product, where they upload a photo of the model they want.
 */
export function RequestProductCta() {
  const { language } = useLanguage()
  const ar = language === "ar"

  return (
    <section aria-labelledby="request-product-title" className="py-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-8 md:flex md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary">
            {ar ? "خدمة اطلب منتج" : "Request a product"}
          </p>
          <h2
            id="request-product-title"
            className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl"
          >
            {ar ? "شوفت موديل وعايزه؟ ابعتلنا صورته" : "Saw a model you want? Send us its photo"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {ar
              ? "هندوّر لك على الموديل عند التجار ونرجع لك بالسعر والتوفر."
              : "We'll look for it with our sellers and get back to you with the price and availability."}
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="mt-4 h-12 w-full rounded-xl text-base font-bold md:mt-0 md:w-auto md:shrink-0"
        >
          <Link href="/request-product">
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            {ar ? "ابعت الصورة" : "Send the photo"}
          </Link>
        </Button>
      </div>
    </section>
  )
}
