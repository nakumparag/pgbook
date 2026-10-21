"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOwnerRoomInventory } from "@/app/actions/owner_pgs";

type Room = { id: string; room_type: string; rent: number; total_beds: number; occupied_beds: number };

export function RoomInventoryForm({ pgId, rooms }: { pgId: string; rooms: Room[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return <section className="mt-4 rounded-xl border border-border bg-muted/20 p-4" aria-label="Manage rooms, rent and occupancy">
    <h4 className="mb-3 text-sm font-bold">Rooms, rent & occupied beds</h4>
    <div className="space-y-3">
      {rooms.map((room) => <form key={room.id} className="grid gap-2 sm:grid-cols-[1fr_repeat(3,minmax(90px,120px))_auto] sm:items-end" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const values = { rent: Number(data.get("rent")), totalBeds: Number(data.get("totalBeds")), occupiedBeds: Number(data.get("occupiedBeds")) };
        setMessage("");
        startTransition(async () => {
          const result = await updateOwnerRoomInventory(pgId, room.id, values);
          setMessage(result.success ? "Room details saved." : result.error || "Could not save.");
          if (result.success) router.refresh();
        });
      }}>
        <p className="pb-2 text-sm font-semibold">{room.room_type.replaceAll("_", " ")}</p>
        <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">Rent/month<input aria-label={`${room.room_type} monthly rent`} name="rent" type="number" min="1" max="500000" required defaultValue={room.rent} className="input h-10" /></label>
        <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">Total beds<input aria-label={`${room.room_type} total beds`} name="totalBeds" type="number" min="1" max="1000" required defaultValue={room.total_beds} className="input h-10" /></label>
        <label className="grid gap-1 text-[11px] font-semibold text-muted-foreground">Occupied<input aria-label={`${room.room_type} occupied beds`} name="occupiedBeds" type="number" min="0" max={1000} required defaultValue={room.occupied_beds} className="input h-10" /></label>
        <button disabled={pending} className="btn btn-outline h-10 px-3 text-xs">{pending ? "Saving…" : "Save"}</button>
      </form>)}
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Update occupied beds only; PGBook does not collect tenant names, rent or payments.</p>
    {message && <p className="mt-2 text-xs" role="status">{message}</p>}
  </section>;
}
