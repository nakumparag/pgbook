"use client";

import { Suspense } from "react";
import { RoomDetailsContent } from "@/app/(owner)/owner/add-pg/page";

export default function RoomsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <RoomDetailsContent basePath="/become-owner" />
    </Suspense>
  );
}
