"use client";

import { useEffect } from "react";
import { logPgVisit } from "@/app/actions/tracking";

export function VisitTracker({ pgId }: { pgId: string }) {
  useEffect(() => {
    logPgVisit(pgId);
  }, [pgId]);

  return null;
}
