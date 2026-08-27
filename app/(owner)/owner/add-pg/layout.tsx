"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

const STEPS = [
  { id: 1, name: "Room Details", path: "/owner/add-pg" },
  { id: 2, name: "Location", path: "/owner/add-pg/location" },
  { id: 3, name: "PG Details", path: "/owner/add-pg/details" },
  { id: 4, name: "Amenities", path: "/owner/add-pg/amenities" },
  { id: 5, name: "Gallery", path: "/owner/add-pg/gallery" },
  { id: 6, name: "Preview", path: "/owner/add-pg/preview" },
];

function StepperContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";

  const currentStepIndex = STEPS.findIndex(s => s.path === pathname);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <div className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container-custom">
        <div className="flex items-center overflow-x-auto scrollbar-none py-1">
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const href = pgId ? `${step.path}?pgId=${pgId}` : step.path;

            return (
              <Link
                key={step.id}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-4 border-b-2 transition-all whitespace-nowrap min-w-fit text-sm font-semibold",
                  isCompleted
                    ? "border-primary text-primary bg-primary/5"
                    : isCurrent
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                    isCompleted
                      ? "bg-primary text-white"
                      : isCurrent
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </span>
                <span className="hidden sm:inline">
                  {isCompleted && <span className="text-xs text-primary mr-1">Complete</span>}
                </span>
                <span>{step.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AddPgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Suspense fallback={<div className="h-14 bg-card border-b border-border" />}>
        <StepperContent />
      </Suspense>
      <div className="container-custom py-8 md:py-12 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
