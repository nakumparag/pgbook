"use client";

import { useState } from "react";
import { Plus, Layers, DoorOpen, BedDouble, Check, AlertCircle, Wrench, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { createFloor, createBed } from "@/app/actions/business_properties";
import { formatCurrency } from "@/lib/utils";
import type { Floor, Bed, Room } from "@/types/database.types";

interface RoomBedManagerClientProps {
  propertyId: string;
  propertyName: string;
  floors: Floor[];
  rooms: Room[];
  beds: Bed[];
}

export function RoomBedManagerClient({
  propertyId,
  propertyName,
  floors,
  rooms,
  beds,
}: RoomBedManagerClientProps) {
  const [selectedFloorId, setSelectedFloorId] = useState<string | "all">(
    floors.length > 0 ? floors[0].id : "all"
  );

  // New Floor Modal State
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [floorNumber, setFloorNumber] = useState(floors.length + 1);
  const [floorName, setFloorName] = useState(`Floor ${floors.length + 1}`);
  const [floorLoading, setFloorLoading] = useState(false);

  // New Bed Modal State
  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState<string>("");
  const [bedNumber, setBedNumber] = useState("");
  const [bedRent, setBedRent] = useState(7000);
  const [bedLoading, setBedLoading] = useState(false);

  const handleCreateFloor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFloorLoading(true);
    const res = await createFloor(propertyId, floorNumber, floorName);
    setFloorLoading(false);
    if (res.success) {
      setFloorModalOpen(false);
      setFloorNumber((prev) => prev + 1);
      setFloorName(`Floor ${floorNumber + 1}`);
    } else {
      alert(res.error || "Failed to create floor");
    }
  };

  const handleCreateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoomId || !bedNumber.trim()) return;
    setBedLoading(true);
    const res = await createBed(propertyId, targetRoomId, bedNumber, bedRent);
    setBedLoading(false);
    if (res.success) {
      setBedModalOpen(false);
      setBedNumber("");
    } else {
      alert(res.error || "Failed to create bed");
    }
  };

  // Group beds by room
  const bedsByRoom = beds.reduce((acc, b) => {
    if (!acc[b.room_id]) acc[b.room_id] = [];
    acc[b.room_id].push(b);
    return acc;
  }, {} as Record<string, Bed[]>);

  // Filter rooms by selected floor
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloorId === "all") return true;
    return r.floor_id === selectedFloorId || !r.floor_id;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Floor Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Floor selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <Button
            variant={selectedFloorId === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFloorId("all")}
            className="rounded-xl text-xs font-semibold shrink-0"
          >
            All Floors
          </Button>
          {floors.map((f) => (
            <Button
              key={f.id}
              variant={selectedFloorId === f.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFloorId(f.id)}
              className="rounded-xl text-xs font-semibold shrink-0"
            >
              {f.name}
            </Button>
          ))}
        </div>

        {/* Action: Add Floor */}
        <div className="flex items-center gap-2">
          <Dialog open={floorModalOpen} onOpenChange={setFloorModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Add Floor
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-heading font-extrabold text-lg">Add New Floor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFloor} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Floor Number</Label>
                  <Input
                    type="number"
                    value={floorNumber}
                    onChange={(e) => setFloorNumber(Number(e.target.value))}
                    min={0}
                    max={50}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Floor Display Name</Label>
                  <Input
                    value={floorName}
                    onChange={(e) => setFloorName(e.target.value)}
                    placeholder="e.g. 1st Floor / Wing A"
                    required
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" disabled={floorLoading} className="w-full rounded-xl font-bold">
                  {floorLoading ? "Creating..." : "Save Floor"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rooms & Bed Grid */}
      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <DoorOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-foreground">No rooms configured for this floor</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Configure rooms and assign beds to start tracking vacancies and tenant allocations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => {
            const roomBeds = bedsByRoom[room.id] || [];
            const vacantCount = roomBeds.length > 0
              ? roomBeds.filter((b) => b.status === "VACANT").length
              : Math.max(0, room.total_beds - (room.occupied_beds || 0));

            return (
              <div
                key={room.id}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Room Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-heading font-extrabold text-base text-foreground">
                        {room.room_number ? `Room ${room.room_number}` : `Room (${room.room_type})`}
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        {room.room_type.replace("_", " ")} • {formatCurrency(room.rent)}/mo
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                      {vacantCount} Vacant
                    </Badge>
                  </div>

                  {/* Bed Grid Inside Room */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Beds ({roomBeds.length > 0 ? roomBeds.length : room.total_beds} Total)
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {roomBeds.length > 0 ? (
                        roomBeds.map((bed) => (
                          <div
                            key={bed.id}
                            className="p-2 rounded-xl border border-border/60 bg-muted/30 flex flex-col items-center justify-center text-center space-y-1"
                          >
                            <BedDouble className="w-4 h-4 text-foreground/80" />
                            <span className="font-bold text-xs text-foreground truncate max-w-full">
                              {bed.bed_number}
                            </span>
                            <StatusBadge status={bed.status} className="text-[10px] px-1.5 py-0" />
                          </div>
                        ))
                      ) : (
                        // Virtual beds fallback if beds records not yet individually generated
                        Array.from({ length: room.total_beds }).map((_, idx) => {
                          const isOccupied = idx < (room.occupied_beds || 0);
                          return (
                            <div
                              key={idx}
                              className="p-2 rounded-xl border border-border/60 bg-muted/30 flex flex-col items-center justify-center text-center space-y-1"
                            >
                              <BedDouble className="w-4 h-4 text-foreground/80" />
                              <span className="font-bold text-xs text-foreground">
                                Bed {idx + 1}
                              </span>
                              <StatusBadge status={isOccupied ? "OCCUPIED" : "VACANT"} className="text-[10px] px-1.5 py-0" />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Bed Trigger */}
                <div className="pt-4 mt-4 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetRoomId(room.id);
                      setBedNumber(`Bed ${roomBeds.length + 1}`);
                      setBedRent(room.rent);
                      setBedModalOpen(true);
                    }}
                    className="w-full rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Bed to Room
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Bed Modal */}
      <Dialog open={bedModalOpen} onOpenChange={setBedModalOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading font-extrabold text-lg">Add Bed to Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBed} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Bed Number / Label</Label>
              <Input
                value={bedNumber}
                onChange={(e) => setBedNumber(e.target.value)}
                placeholder="e.g. Bed A, 101-1"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Monthly Bed Rent (₹)</Label>
              <Input
                type="number"
                value={bedRent}
                onChange={(e) => setBedRent(Number(e.target.value))}
                min={500}
                required
                className="rounded-xl"
              />
            </div>
            <Button type="submit" disabled={bedLoading} className="w-full rounded-xl font-bold">
              {bedLoading ? "Saving..." : "Save Bed"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

