"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardImageSliderProps {
    images: string[];
    alt?: string;
    /** Compact square or wide rectangle */
    layout?: "square" | "wide";
    /** Called with index when user clicks the image */
    onImageClick?: (index: number) => void;
}

const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f8fafc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23cbd5e1' font-family='system-ui' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardImageSlider({
    images,
    alt = "Product",
    layout = "square",
    onImageClick,
}: DashboardImageSliderProps) {
    const slides = images && images.length > 0 ? images : [PLACEHOLDER];
    const isSingle = slides.length === 1;

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: !isSingle });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hovered, setHovered] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi, onSelect]);

    const aspectClass = layout === "square" ? "aspect-square" : "aspect-[4/3]";

    return (
        <div
            className={`relative w-full ${aspectClass} overflow-hidden rounded-lg bg-slate-100 group`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Main slider */}
            <div ref={emblaRef} className="h-full overflow-hidden">
                <div className="flex h-full touch-pan-y">
                    {slides.map((src, i) => (
                        <div
                            key={i}
                            className="relative h-full min-w-0 flex-[0_0_100%] cursor-pointer"
                            onClick={() => onImageClick?.(i)}
                        >
                            <Image
                                src={src}
                                alt={`${alt} ${i + 1}`}
                                fill
                                sizes="(max-width: 640px) 50vw, 200px"
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                loading="lazy"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = PLACEHOLDER;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Arrow controls */}
            {!isSingle && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); emblaApi?.scrollPrev(); }}
                        aria-label="Previous"
                        className={`
              absolute left-1 top-1/2 z-10 -translate-y-1/2
              w-6 h-6 flex items-center justify-center
              rounded-full bg-white/85 shadow text-slate-600
              transition-all duration-150
              ${hovered ? "opacity-100" : "opacity-0"}
              hover:bg-white
            `}
                    >
                        <ChevronLeft size={12} strokeWidth={3} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); emblaApi?.scrollNext(); }}
                        aria-label="Next"
                        className={`
              absolute right-1 top-1/2 z-10 -translate-y-1/2
              w-6 h-6 flex items-center justify-center
              rounded-full bg-white/85 shadow text-slate-600
              transition-all duration-150
              ${hovered ? "opacity-100" : "opacity-0"}
              hover:bg-white
            `}
                    >
                        <ChevronRight size={12} strokeWidth={3} />
                    </button>
                </>
            )}

            {/* Image count badge */}
            {!isSingle && (
                <div
                    className={`
            absolute bottom-1.5 right-1.5 z-10
            flex items-center gap-1 rounded-full
            bg-black/50 px-1.5 py-0.5 text-[10px] text-white
            backdrop-blur-sm transition-opacity
            ${hovered ? "opacity-0" : "opacity-100"}
          `}
                >
                    <Images size={9} />
                    {slides.length}
                </div>
            )}

            {/* Dots (compact — max 5 shown) */}
            {!isSingle && slides.length <= 5 && (
                <div
                    className={`
            absolute bottom-1.5 left-1/2 z-10 -translate-x-1/2
            flex gap-1 transition-opacity
            ${hovered ? "opacity-100" : "opacity-0"}
          `}
                >
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(i); }}
                            aria-label={`Image ${i + 1}`}
                            className={`rounded-full transition-all ${i === selectedIndex
                                    ? "w-4 h-1 bg-white"
                                    : "w-1 h-1 bg-white/60"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}