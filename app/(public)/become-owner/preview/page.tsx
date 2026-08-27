"use client";

import { Suspense } from "react";
import { PreviewContent } from "@/app/(owner)/owner/add-pg/preview/page";

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <PreviewContent basePath="/become-owner" />
    </Suspense>
  );
}
