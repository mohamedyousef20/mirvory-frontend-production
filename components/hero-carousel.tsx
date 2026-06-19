"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// تعريف النوع للبيانات
interface Announcement {
  _id?: string;
  image?: string;
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  link?: string;
}

interface HeroCarouselProps {
  initialAnnouncements: Announcement[];
}

export function HeroCarousel({ initialAnnouncements }: HeroCarouselProps) {
  const { language } = useLanguage()
  const [currentSlide, setCurrentSlide] = useState(0)
  const announcements = initialAnnouncements || []

  const nextSlide = () => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === announcements.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    if (announcements.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? announcements.length - 1 : prev - 1))
  }

  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [announcements.length])

  if (announcements.length === 0) return null;

  const hasMultipleSlides = announcements.length > 1;

  return (
    <div className="relative overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(${language === "ar" ? currentSlide * 100 : -currentSlide * 100}%)` }}
      >
        {announcements.map((ann) => (
          <div key={ann._id} className="min-w-full relative">
            <div className="relative aspect-[21/9] md:aspect-[3/1]">
              <Image
                src={ann.image || "/placeholder.svg"}
                alt={(language === 'ar' ? ann.title : ann.titleEn) ?? 'Announcement'}
                fill
                priority // ضروري جداً لـ LCP
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/20">
                <div className="container h-full flex items-center">
                  <div className="max-w-lg space-y-4">
                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                      {language === "ar" ? ann.title : ann.titleEn || ann.title}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground">
                      {language === "ar" ? ann.content : ann.contentEn || ann.content}
                    </p>
                    <Button asChild size="lg">
                      <Link href={ann.link || "/"}>
                        {language === "ar" ? "تسوق الآن" : "Shop Now"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMultipleSlides && (
        <>
          <Button variant="ghost" size="icon" className="absolute top-1/2 left-2 -translate-y-1/2 bg-background/50 rounded-full h-10 w-10" onClick={prevSlide}>
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          <Button variant="ghost" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 bg-background/50 rounded-full h-10 w-10" onClick={nextSlide}>
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        </>
      )}
    </div>
  )
}
