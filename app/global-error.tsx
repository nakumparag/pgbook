"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in the future
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-background text-foreground font-sans">
          <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Something went wrong.</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">
            We encountered an unexpected error while trying to process your request. 
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
      </body>
    </html>
  );
}
