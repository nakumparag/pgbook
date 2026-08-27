"use client";

import { Suspense } from "react";
import { DetailsContent } from "@/app/(owner)/owner/add-pg/details/page";

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <DetailsContent basePath="/become-owner" />
    </Suspense>
  );
}
