"use client";

import { Suspense } from "react";
import { AmenitiesContent } from "@/app/(owner)/owner/add-pg/amenities/page";

export default function AmenitiesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <AmenitiesContent basePath="/become-owner" />
    </Suspense>
  );
}
