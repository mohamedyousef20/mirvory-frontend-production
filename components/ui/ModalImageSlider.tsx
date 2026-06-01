"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalImageSliderProps {
    images: string[];
    alt?: string;
    /** Controlled: which slide to start on */
    initialIndex?: number;
    /** Called when user closes */
    onClose?: () => void;
}

const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='system-ui' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

// ─── Inline modal slider (embed in your own dialog/modal) ─────────────────────

export function ModalImageSlider({
    images,
    alt = "Image",
    initialIndex = 0,
    onClose,
}: ModalImageSliderProps) {
    const slides = images && images.length > 0 ? images : [PLACEHOLDER];
    const isSingle = slides.length === 1;

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: !isSingle,
        startIndex: initialIndex,
    });

    const [selectedIndex, setSelectedIndex] = useState(initialIndex);

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

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
            if (e.key === "ArrowRight") emblaApi?.scrollNext();
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [emblaApi, onClose]);

    return (
        <div className="relative flex flex-col h-full w-full bg-black/95 rounded-2xl overflow-hidden">
            {/* Close */}
            {onClose && (
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus-visible:outline-none"
                >
                    <X size={18} />
                </button>
            )}

            {/* Counter */}
            {!isSingle && (
                <div className="absolute left-3 top-3 z-20 rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur-sm">
                    {selectedIndex + 1} / {slides.length}
                </div>
            )}

            {/* Main viewer */}
            <div ref={emblaRef} className="flex-1 overflow-hidden">
                <div className="flex h-full touch-pan-y">
                    {slides.map((src, i) => (
                        <div key={i} className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center p-6">
                            <div className="relative w-full h-full">
                                <Image
                                    src={src}
                                    alt={`${alt} ${i + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 80vw"
                                    className="object-contain"
                                    priority={i === initialIndex}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = PLACEHOLDER;
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Arrows */}
            {!isSingle && (
                <>
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        aria-label="Previous"
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        aria-label="Next"
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                        <ChevronRight size={22} />
                    </button>
                </>
            )}

            {/* Dot pagination */}
            {!isSingle && slides.length <= 12 && (
                <div className="flex justify-center gap-2 pb-4 pt-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => emblaApi?.scrollTo(i)}
                            aria-label={`Image ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${i === selectedIndex
                                    ? "w-6 h-1.5 bg-white"
                                    : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Lightbox wrapper (full-screen overlay) ───────────────────────────────────

interface LightboxProps {
    images: string[];
    alt?: string;
    isOpen: boolean;
    initialIndex?: number;
    onClose: () => void;
}

export function Lightbox({
    images,
    alt,
    isOpen,
    initialIndex = 0,
    onClose,
}: LightboxProps) {
    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-8"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-5xl h-[80vh]">
                <ModalImageSlider
                    images={images}
                    alt={alt}
                    initialIndex={initialIndex}
                    onClose={onClose}
                />
            </div>
        </div>
    );
}