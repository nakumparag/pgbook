"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BedDouble, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDraftPg, saveRooms, fetchDraftPg } from "@/app/actions/owner_pgs";

interface RoomConfig {
  room_type: string;
  rent: number;
  security_deposit: number;
  total_beds: number;
  electricity_charges: number;
  maintenance_charges: number;
  other_charges: number;
}

const ROOM_TYPES = [
  { value: "PERSONAL", label: "Single Bed", icon: "🛏️" },
  { value: "2_SHARING", label: "Double Sharing", icon: "🛏️🛏️" },
  { value: "3_SHARING", label: "Triple Sharing", icon: "🛏️🛏️🛏️" },
  { value: "4_SHARING", label: "4+ Sharing", icon: "🛏️🛏️🛏️🛏️" },
  { value: "HALL_SHARING", label: "Hall Sharing", icon: "🛋️" },
];

export function RoomDetailsContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId");

  const [rooms, setRooms] = useState<RoomConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPgId, setCurrentPgId] = useState(pgId || "");

  // Load existing room data if editing
  useEffect(() => {
    if (pgId) {
      setCurrentPgId(pgId);
      fetchDraftPg(pgId).then(pg => {
        if (pg?.rooms && (pg.rooms as any[]).length > 0) {
          setRooms((pg.rooms as any[]).map(r => ({
            room_type: r.room_type,
            rent: r.rent,
            security_deposit: r.security_deposit,
            total_beds: r.total_beds,
            electricity_charges: r.electricity_charges || 0,
            maintenance_charges: r.maintenance_charges || 0,
            other_charges: r.other_charges || 0,
          })));
        }
      });
    }
  }, [pgId]);

  const addRoom = (roomType: string) => {
    // Don't add duplicate room types
    if (rooms.find(r => r.room_type === roomType)) return;
    setRooms([...rooms, { 
      room_type: roomType, 
      rent: 0, 
      security_deposit: 0, 
      total_beds: 1,
      electricity_charges: 0,
      maintenance_charges: 0,
      other_charges: 0
    }]);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, field: keyof RoomConfig, value: any) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const handleSaveAndContinue = async () => {
    setError(null);
    if (rooms.length === 0) {
      setError("Please add at least one room type.");
      return;
    }
    for (const r of rooms) {
      if (!r.rent || r.rent <= 0) { setError("Rent must be greater than 0 for all rooms."); return; }
      if (!r.total_beds || r.total_beds <= 0) { setError("Total beds must be at least 1."); return; }
    }

    setSaving(true);
    let activePgId = currentPgId;

    // Create draft if this is a new listing
    if (!activePgId) {
      setCreating(true);
      const result = await createDraftPg();
      setCreating(false);
      if (!result.success || !result.pgId) {
        setError(result.error || "Failed to create draft.");
        setSaving(false);
        return;
      }
      activePgId = result.pgId;
      setCurrentPgId(activePgId);
    }

    const result = await saveRooms(activePgId, rooms);
    setSaving(false);

    if (!result.success) {
      setError(result.error || "Failed to save rooms.");
      return;
    }

    router.push(`${basePath}/location?pgId=${activePgId}`);
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSaving(true);
    let activePgId = currentPgId;

    if (!activePgId) {
      const result = await createDraftPg();
      if (!result.success || !result.pgId) {
        setError(result.error || "Failed to create draft.");
        setSaving(false);
        return;
      }
      activePgId = result.pgId;
      setCurrentPgId(activePgId);
      // Update URL without reload
      window.history.replaceState({}, "", `${basePath}?pgId=${activePgId}`);
    }

    if (rooms.length > 0) {
      await saveRooms(activePgId, rooms);
    }
    setSaving(false);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Room Details</h1>
        <p className="text-muted-foreground font-medium">Select the room types you offer and provide rent details for each.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
          {error}
        </div>
      )}

      {/* Room Type Selector */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Select Room Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROOM_TYPES.map(type => {
            const isSelected = rooms.some(r => r.room_type === type.value);
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => isSelected ? undefined : addRoom(type.value)}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50 text-foreground hover:bg-muted/50"
                }`}
              >
                <BedDouble className="w-8 h-8" />
                <span className="text-sm font-bold">{type.label}</span>
                {isSelected && <span className="text-[10px] font-bold uppercase text-primary">Added ✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Configurations */}
      {rooms.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Provide Details of Rent</h3>
          {rooms.map((room, index) => {
            const typeLabel = ROOM_TYPES.find(t => t.value === room.room_type)?.label || room.room_type;
            return (
              <div key={index} className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="font-bold text-lg text-foreground">{typeLabel}</h4>
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Monthly Rent (₹) *</label>
                    <Input
                      type="number"
                      min={1000}
                      value={room.rent || ""}
                      onChange={e => updateRoom(index, "rent", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 6000"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Security Deposit (₹) *</label>
                    <Input
                      type="number"
                      min={0}
                      value={room.security_deposit || ""}
                      onChange={e => updateRoom(index, "security_deposit", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 6000"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Total Beds *</label>
                    <Input
                      type="number"
                      min={1}
                      value={room.total_beds || ""}
                      onChange={e => updateRoom(index, "total_beds", parseInt(e.target.value) || 1)}
                      placeholder="e.g. 10"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                
                {/* Additional Charges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Electricity (₹/mo)</label>
                    <Input
                      type="number"
                      min={0}
                      value={room.electricity_charges || ""}
                      onChange={e => updateRoom(index, "electricity_charges", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 500 or 0 if included"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Maintenance (₹/mo)</label>
                    <Input
                      type="number"
                      min={0}
                      value={room.maintenance_charges || ""}
                      onChange={e => updateRoom(index, "maintenance_charges", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 200 or 0 if included"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Other Charges (₹)</label>
                    <Input
                      type="number"
                      min={0}
                      value={room.other_charges || ""}
                      onChange={e => updateRoom(index, "other_charges", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 0"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rooms.length === 0 && (
        <div className="bg-muted/30 rounded-2xl p-12 text-center mb-8 border-2 border-dashed border-border">
          <BedDouble className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">Select a room type above to get started</p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="rounded-xl font-bold px-6 h-12">
          {saving && !creating ? "Saving..." : "Save Draft"}
        </Button>
        <Button onClick={handleSaveAndContinue} disabled={saving} className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
          {saving ? (creating ? "Creating..." : "Saving...") : "Save & Continue"}
        </Button>
      </div>
    </>
  );
}

export default function AddPGPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <RoomDetailsContent />
    </Suspense>
  );
}
