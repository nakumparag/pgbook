"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveLocation, fetchDraftPg } from "@/app/actions/owner_pgs";
import { createClient } from "@/lib/supabase/client";

export function LocationContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";

  const [cities, setCities] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);
  const [cityId, setCityId] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: c } = await supabase.from("cities").select("id, name").eq("is_active", true);
      const { data: l } = await supabase.from("localities").select("id, name, city_id");
      if (c) setCities(c);
      if (l) setLocalities(l);

      if (pgId) {
        const pg = await fetchDraftPg(pgId);
        if (pg) {
          setCityId(pg.city_id || "");
          setLocalityId(pg.locality_id || "");
          setAddress(pg.address || "");
        }
      }
    };
    load();
  }, [pgId]);

  const availableLocalities = localities.filter(l => l.city_id === cityId);

  const validate = () => {
    if (!cityId) return "City is required.";
    if (!localityId) return "Locality is required.";
    if (!address.trim()) return "Address is required.";
    return null;
  };

  const handleSaveAndContinue = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError(null);
    setSaving(true);

    const result = await saveLocation(pgId, { city_id: cityId, locality_id: localityId, address });
    setSaving(false);

    if (!result.success) { setError(result.error || "Failed to save."); return; }
    router.push(`${basePath}/details?pgId=${pgId}`);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSaving(true);
    if (cityId && localityId) {
      await saveLocation(pgId, { city_id: cityId, locality_id: localityId, address });
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
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Location Details</h1>
        <p className="text-muted-foreground font-medium">Help tenants find your property easily.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">City *</label>
            <select
              value={cityId}
              onChange={e => { setCityId(e.target.value); setLocalityId(""); }}
              className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 text-sm"
            >
              <option value="">Select City</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Locality *</label>
            <select
              value={localityId}
              onChange={e => setLocalityId(e.target.value)}
              disabled={!cityId}
              className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 text-sm disabled:opacity-50"
            >
              <option value="">Select Locality</option>
              {availableLocalities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Complete Address *</label>
          <Input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="House No, Building, Street, Landmark"
            className="h-12 rounded-xl"
          />
        </div>

        {/* Map placeholder */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-bold">Mark Location on Map</span>
          </div>
          <div className="h-48 rounded-xl bg-muted border border-border flex items-center justify-center">
            <div className="text-center p-6">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Map integration requires a Google Maps API key.</p>
              <p className="text-xs text-muted-foreground mt-1">Your address will be used for location.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`${basePath}?pgId=${pgId}`)} className="rounded-xl font-bold px-6 h-12">
            Previous
          </Button>
          <Button variant="ghost" onClick={handleSaveDraft} disabled={saving} className="rounded-xl font-bold px-6 h-12">
            Save Draft
          </Button>
        </div>
        <Button onClick={handleSaveAndContinue} disabled={saving} className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
          {saving ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </>
  );
}

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <LocationContent />
    </Suspense>
  );
}
