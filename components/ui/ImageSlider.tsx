"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SliderVariant = "card" | "detail" | "modal" | "dashboard";

export interface ImageSliderProps {
    /** Array of image URLs. Falls back to placeholder if empty. */
    images: string[];
    /** Alt text for the images (applied to all slides) */
    alt?: string;
    /** Display variant controls sizing and UI density */
    variant?: SliderVariant;
    /** Whether autoplay is enabled (default: true) */
    autoplay?: boolean;
    /** Autoplay delay in ms (default: 3500) */
    autoplayDelay?: number;
    /** Extra className for the root wrapper */
    className?: string;
    /** Aspect ratio class — defaults per variant if not provided */
    aspectRatio?: string;
    /** Priority load the first image (set true for LCP images) */
    priority?: boolean;
    /** Called when the active slide index changes */
    onSlideChange?: (index: number) => void;
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

// ─── Aspect ratio defaults per variant ────────────────────────────────────────

const ASPECT_DEFAULTS: Record<SliderVariant, string> = {
    card: "aspect-[4/3]",
    detail: "aspect-[16/9] md:aspect-[3/2]",
    modal: "aspect-[4/3] md:aspect-[16/9]",
    dashboard: "aspect-square",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageSlider({
    images,
    alt = "Product image",
    variant = "card",
    autoplay = true,
    autoplayDelay = 3500,
    className = "",
    aspectRatio,
    priority = false,
    onSlideChange,
}: ImageSliderProps) {
    // Normalise: always work with a non-empty array
    const slides = images && images.length > 0 ? images : [PLACEHOLDER];
    const isSingle = slides.length === 1;

    const autoplayPlugin = useRef(
        Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: !isSingle,
            dragFree: false,
            containScroll: "trimSnaps",
        },
        autoplay && !isSingle ? [autoplayPlugin.current] : []
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // ── Sync state on scroll ──────────────────────────────────────────────────
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        const idx = emblaApi.selectedScrollSnap();
        setSelectedIndex(idx);
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
        onSlideChange?.(idx);
    }, [emblaApi, onSlideChange]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const scrollPrev = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            emblaApi?.scrollPrev();
        },
        [emblaApi]
    );

    const scrollNext = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            emblaApi?.scrollNext();
        },
        [emblaApi]
    );

    const scrollTo = useCallback(
        (idx: number, e: React.MouseEvent) => {
            e.stopPropagation();
            emblaApi?.scrollTo(idx);
        },
        [emblaApi]
    );

    // ── Sizing ───────────────────────────────────────────────────────────────
    const aspect = aspectRatio ?? ASPECT_DEFAULTS[variant];

    // ── Button sizes per variant ─────────────────────────────────────────────
    const btnSize =
        variant === "card"
            ? "w-7 h-7"
            : variant === "dashboard"
                ? "w-7 h-7"
                : "w-9 h-9";

    const iconSize =
        variant === "card" || variant === "dashboard" ? 14 : 18;

    return (
        <div
            className={`relative w-full overflow-hidden rounded-xl bg-slate-100 ${aspect} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ── Embla viewport ─────────────────────────────────────────────── */}
            <div ref={emblaRef} className="h-full w-full overflow-hidden">
                <div className="flex h-full touch-pan-y">
                    {slides.map((src, i) => (
                        <div
                            key={i}
                            className="relative h-full min-w-0 flex-[0_0_100%]"
                            style={{ willChange: "transform" }}
                        >
                            <Image
                                src={src}
                                alt={`${alt} ${i + 1}`}
                                fill
                                sizes={
                                    variant === "card"
                                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        : "(max-width: 768px) 100vw, 80vw"
                                }
                                className="object-cover"
                                priority={i === 0 && priority}
                                loading={i === 0 && priority ? "eager" : "lazy"}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = PLACEHOLDER;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Navigation arrows (hidden for single image) ────────────────── */}
            {!isSingle && (
                <>
                    <button
                        onClick={scrollPrev}
                        aria-label="Previous image"
                        className={`
              absolute left-2 top-1/2 z-10 -translate-y-1/2
              ${btnSize} flex items-center justify-center
              rounded-full bg-white/80 shadow-md backdrop-blur-sm
              text-slate-700 ring-1 ring-slate-200/60
              transition-all duration-200
              ${isHovered ? "opacity-100" : "opacity-0 md:opacity-60"}
              hover:bg-white hover:scale-105 hover:opacity-100
              disabled:opacity-20 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
            `}
                        disabled={!canScrollPrev}
                    >
                        <ChevronLeft size={iconSize} strokeWidth={2.5} />
                    </button>

                    <button
                        onClick={scrollNext}
                        aria-label="Next image"
                        className={`
              absolute right-2 top-1/2 z-10 -translate-y-1/2
              ${btnSize} flex items-center justify-center
              rounded-full bg-white/80 shadow-md backdrop-blur-sm
              text-slate-700 ring-1 ring-slate-200/60
              transition-all duration-200
              ${isHovered ? "opacity-100" : "opacity-0 md:opacity-60"}
              hover:bg-white hover:scale-105 hover:opacity-100
              disabled:opacity-20 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
            `}
                        disabled={!canScrollNext}
                    >
                        <ChevronRight size={iconSize} strokeWidth={2.5} />
                    </button>
                </>
            )}

            {/* ── Pagination dots ────────────────────────────────────────────── */}
            {!isSingle && slides.length <= 10 && (
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => scrollTo(i, e)}
                            aria-label={`Go to image ${i + 1}`}
                            className={`
                rounded-full transition-all duration-300
                ${i === selectedIndex
                                    ? "w-5 h-1.5 bg-white shadow"
                                    : "w-1.5 h-1.5 bg-white/60 hover:bg-white/90"
                                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
              `}
                        />
                    ))}
                </div>
            )}

            {/* ── Image counter (when > 10 images) ──────────────────────────── */}
            {!isSingle && slides.length > 10 && (
                <div className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                    {selectedIndex + 1} / {slides.length}
                </div>
            )}
        </div>
    );
}