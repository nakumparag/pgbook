"use client";

import { Suspense } from "react";
import { GalleryContent } from "@/app/(owner)/owner/add-pg/gallery/page";

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <GalleryContent basePath="/become-owner" />
    </Suspense>
  );
}
