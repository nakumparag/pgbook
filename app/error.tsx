"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center p-4">
      <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
      </div>
      <h2 className="text-4xl font-heading font-black mb-4 text-center">Something went wrong.</h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">
        We encountered an unexpected error while trying to load this page.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" onClick={() => reset()} className="w-full font-bold">
          Try Again
        </Button>
        <Link href="/">
          <Button size="lg" variant="outline" className="w-full font-bold">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
