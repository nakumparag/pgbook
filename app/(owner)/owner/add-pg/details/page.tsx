"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePgDetails, fetchDraftPg } from "@/app/actions/owner_pgs";

export function DetailsContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [foodStatus, setFoodStatus] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [rules, setRules] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pgId) {
      fetchDraftPg(pgId).then(pg => {
        if (pg) {
          setName(pg.name === "Untitled PG" ? "" : pg.name || "");
          setDescription(pg.description || "");
          setGender(pg.gender || "");
          setFoodStatus(pg.food_status || "");
          setAvailableFrom(pg.available_from || "");
          setRules(pg.rules ? pg.rules.join("\n") : "");
        }
      });
    }
  }, [pgId]);

  const validate = () => {
    if (!name.trim()) return "PG name is required.";
    if (!gender) return "Gender preference is required.";
    if (!foodStatus) return "Food status is required.";
    return null;
  };

  const handleSaveAndContinue = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setSaving(true);

    const rulesArray = rules.split("\n").map(r => r.trim()).filter(r => r.length > 0);
    const result = await savePgDetails(pgId, { 
      name, description, gender, food_status: foodStatus, 
      available_from: availableFrom || null, rules: rulesArray 
    });
    setSaving(false);
    if (!result.success) { setError(result.error || "Failed to save."); return; }
    router.push(`${basePath}/amenities?pgId=${pgId}`);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSaving(true);
    if (name.trim()) {
      const rulesArray = rules.split("\n").map(r => r.trim()).filter(r => r.length > 0);
      await savePgDetails(pgId, { 
        name, description, gender: gender || "BOYS", food_status: foodStatus || "NOT_AVAILABLE",
        available_from: availableFrom || null, rules: rulesArray 
      });
    }
    setSaving(false);
  };

  if (!pgId) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please start from Step 1 to create a listing.</p>
        <Button onClick={() => router.push(basePath)} className="mt-4 rounded-xl">Go to Step 1</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">PG Details</h1>
        <p className="text-muted-foreground font-medium">Tell tenants about your property.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 mb-8">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">PG Name *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Royal PG for Boys" className="h-12 rounded-xl" />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm min-h-30 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Describe your property — what makes it special?"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Available For *</label>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "BOYS", label: "Boys PG" },
              { value: "GIRLS", label: "Girls PG" },
              { value: "CO_LIVING", label: "Co-Living" },
              { value: "UNISEX", label: "Unisex PG" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGender(opt.value)}
                className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  gender === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Food Status *</label>
          <div className="flex gap-3 flex-wrap">
            {[
              { value: "INCLUDED", label: "Included in Rent" },
              { value: "AVAILABLE", label: "Available (Extra)" },
              { value: "NOT_AVAILABLE", label: "Not Available" },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFoodStatus(opt.value)}
                className={`px-6 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  foodStatus === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Available From</label>
            <Input 
              type="date"
              value={availableFrom} 
              onChange={e => setAvailableFrom(e.target.value)} 
              className="h-12 rounded-xl w-full" 
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">PG Rules (One per line)</label>
          <textarea
            value={rules}
            onChange={e => setRules(e.target.value)}
            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm min-h-30 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g. No smoking inside premises&#10;Gates close at 10 PM&#10;No loud music after 11 PM"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`${basePath}/location?pgId=${pgId}`)} className="rounded-xl font-bold px-6 h-12">Previous</Button>
          <Button variant="ghost" onClick={handleSaveDraft} disabled={saving} className="rounded-xl font-bold px-6 h-12">Save Draft</Button>
        </div>
        <Button onClick={handleSaveAndContinue} disabled={saving} className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <DetailsContent />
    </Suspense>
  );
}
