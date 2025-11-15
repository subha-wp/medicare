// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Banner = {
  id: string;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  targetAudience: string;
};

type BannerCarouselProps = {
  role?: "PATIENT" | "DOCTOR" | "PHARMACY";
  className?: string;
  height?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

export function BannerCarousel({
  role,
  className,
  height = "h-32",
  autoPlay = true,
  autoPlayInterval = 5000,
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [role]);

  useEffect(() => {
    if (autoPlay && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, autoPlayInterval);

      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, banners.length]);

  const fetchBanners = async () => {
    try {
      const params = new URLSearchParams();
      if (role) {
        params.set("role", role);
      }

      const response = await fetch(`/api/banners?${params.toString()}`);
      const data = await response.json();

      if (data.banners && data.banners.length > 0) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={cn("relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl", height, className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-white">Loading banners...</div>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className={cn("relative rounded-2xl overflow-hidden backdrop-blur-sm", height, className)}>
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {banner.linkUrl ? (
            <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </a>
          ) : (
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              fill
              className="object-cover"
              priority={index === 0}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          {(banner.title || banner.description) && (
            <div className="absolute inset-0 flex items-center justify-start p-4 z-20">
              <div className="text-white">
                {banner.title && (
                  <h3 className="text-lg font-bold mb-1">{banner.title}</h3>
                )}
                {banner.description && (
                  <p className="text-sm opacity-90">{banner.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

