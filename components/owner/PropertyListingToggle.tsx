"use client";

import { useState } from "react";
import { Globe, EyeOff, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { togglePropertyPublicListing } from "@/app/actions/business_properties";

interface PropertyListingToggleProps {
  propertyId: string;
  initialListed: boolean;
  propertyName: string;
}

export function PropertyListingToggle({
  propertyId,
  initialListed,
  propertyName,
}: PropertyListingToggleProps) {
  const [isListed, setIsListed] = useState(initialListed);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = async () => {
    setLoading(true);
    setFeedback(null);
    const nextState = !isListed;

    try {
      const res = await togglePropertyPublicListing(propertyId, nextState);
      if (res.success) {
        setIsListed(nextState);
        setFeedback(
          nextState
            ? "Listed publicly on PGBook!"
            : "Property is now private (unlisted)."
        );
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(res.error || "Failed to update listing status");
      }
    } catch {
      alert("Failed to update listing status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={
            isListed
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[11px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full"
              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 text-[11px] font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full"
          }
        >
          {isListed ? (
            <>
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Public on PGBook</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 text-slate-500" />
              <span>Private Management</span>
            </>
          )}
        </Badge>

        <Button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] font-bold rounded-lg px-2.5 border-border/80"
          title={
            isListed
              ? `Unlist ${propertyName} from PGBook public search`
              : `Make ${propertyName} searchable on PGBook`
          }
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isListed ? (
            "Make Private"
          ) : (
            "List on PGBook"
          )}
        </Button>
      </div>

      {feedback && (
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-fade-in">
          <Check className="w-3 h-3" />
          {feedback}
        </span>
      )}
    </div>
  );
}

