"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveAmenities, fetchDraftPg } from "@/app/actions/owner_pgs";
import { createClient } from "@/lib/supabase/client";

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  category: string | null;
}

export function AmenitiesContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";

  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("amenities").select("id, name, icon, category").order("category").order("name");
      if (data) setAmenities(data);

      if (pgId) {
        const pg = await fetchDraftPg(pgId);
        if (pg?.pg_amenities) {
          setSelected((pg.pg_amenities as any[]).map(pa => pa.amenity_id));
        }
      }
    };
    load();
  }, [pgId]);

  const toggleAmenity = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  // Group by category
  const grouped = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
    const cat = a.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  const handleSaveAndContinue = async () => {
    setError(null);
    setSaving(true);
    const result = await saveAmenities(pgId, selected);
    setSaving(false);
    if (!result.success) { setError(result.error || "Failed to save."); return; }
    router.push(`${basePath}/gallery?pgId=${pgId}`);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await saveAmenities(pgId, selected);
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
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Amenities</h1>
        <p className="text-muted-foreground font-medium">Select the amenities available at your PG.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">{error}</div>
      )}

      {amenities.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-border">
          <p className="text-muted-foreground font-medium">No amenities found in the database.</p>
          <p className="text-sm text-muted-foreground mt-1">Ask your admin to seed the amenities table.</p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map(amenity => {
                  const isChecked = selected.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left text-sm font-medium ${
                        isChecked
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-primary text-white" : "bg-muted border border-border"
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <span className="truncate">{amenity.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`${basePath}/details?pgId=${pgId}`)} className="rounded-xl font-bold px-6 h-12">Previous</Button>
          <Button variant="ghost" onClick={handleSaveDraft} disabled={saving} className="rounded-xl font-bold px-6 h-12">Save Draft</Button>
        </div>
        <Button onClick={handleSaveAndContinue} disabled={saving} className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </>
  );
}

export default function AmenitiesPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <AmenitiesContent />
    </Suspense>
  );
}
