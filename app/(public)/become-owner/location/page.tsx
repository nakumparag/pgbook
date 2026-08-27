"use client";

import { Suspense } from "react";
import { LocationContent } from "@/app/(owner)/owner/add-pg/location/page";

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <LocationContent basePath="/become-owner" />
    </Suspense>
  );
}
