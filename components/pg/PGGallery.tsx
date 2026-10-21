"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface PGGalleryProps {
  images: { id?: string; url: string; isPrimary?: boolean; category?: string; publicId?: string }[];
}

export function PGGallery({ images }: PGGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!images || images.length === 0) return null;

  const gridLayout = images.length === 1
    ? "grid-cols-1 grid-rows-1"
    : images.length === 2
      ? "grid-cols-2 grid-rows-1"
      : images.length === 3
        ? "grid-cols-3 grid-rows-1"
        : images.length === 4
          ? "grid-cols-2 grid-rows-2"
          : "grid-cols-4 grid-rows-2";
  const primaryLayout = images.length >= 5 ? "col-span-2 row-span-2" : "col-span-1 row-span-1";

  return (
    <Dialog>
      <div className="relative group rounded-3xl overflow-hidden">
        {/* Desktop Layout */}
        <div className={`hidden md:grid ${gridLayout} gap-2 h-125`}>
          <div className={`${primaryLayout} relative h-full`}>
            <Image
              src={images[0].url}
              alt="Primary Image"
              fill
              className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
              priority
            />
          </div>
          {images.slice(1, images.length >= 5 ? 5 : undefined).map((img, idx) => (
            <div key={idx} className="relative h-full">
              <Image
                src={img.url}
                alt={`Gallery image ${idx + 1}`}
                fill
                className="object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
          ))}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden relative h-75 w-full">
          <Image
            src={images[0].url}
            alt="Primary Image"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* View All Button */}
        <DialogTrigger asChild>
          <Button variant="secondary" className="absolute bottom-4 right-4 gap-2 shadow-lg z-10 rounded-xl bg-white text-black hover:bg-gray-100">
            <Grid className="w-4 h-4" />
            View all photos
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col bg-black border-none gap-0 rounded-none sm:rounded-2xl overflow-hidden">
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
        <div className="flex-1 relative flex items-center justify-center bg-black/90 p-4">
          <Image
            src={images[currentIdx]?.url || ""}
            alt="Gallery view"
            fill
            className="object-contain"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                onClick={() => setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
                onClick={() => setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}

          {images[currentIdx]?.category && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20 uppercase tracking-wider backdrop-blur-sm">
              {images[currentIdx].category}
            </div>
          )}
        </div>
        <div className="h-24 bg-black border-t border-white/10 flex items-center justify-center gap-2 p-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={idx}
              className={`relative h-16 w-24 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${currentIdx === idx ? 'border-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}
              onClick={() => setCurrentIdx(idx)}
            >
              <Image src={img.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
