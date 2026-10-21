"use client";

import { ContactOwnerModal } from "./ContactOwnerModal";

export function PropertyContactCard({ pg }: { pg: any }) {
  const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
  const rentMax = pg.rooms?.length > 0 ? Math.max(...pg.rooms.map((r: any) => r.rent)) : 0;
  const deposits = (pg.rooms || []).map((room: any) => room.security_deposit).filter((value: number | null) => typeof value === "number");

  return (
    <div className="sticky top-28 bg-card border border-border rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <div className="flex items-end gap-1 mb-1">
          {rentMax > rentMin && (
             <span className="text-sm font-semibold line-through text-muted-foreground mr-1">₹{rentMax.toLocaleString()}</span>
          )}
          <h3 className="text-3xl font-heading font-bold text-foreground tracking-tight">
            {rentMin > 0 ? `₹${rentMin.toLocaleString()}` : 'TBD'}
          </h3>
          <span className="text-muted-foreground font-medium">/ month</span>
        </div>
        <p className="text-sm text-success font-medium">Best available price</p>
      </div>

      {deposits.length > 0 && (
        <div className="mb-6 flex justify-between border-t border-border pt-6 text-sm">
          <span className="text-muted-foreground">Security deposit</span>
          <span className="font-semibold text-foreground">₹{Math.min(...deposits).toLocaleString()}{Math.max(...deposits) > Math.min(...deposits) ? `–₹${Math.max(...deposits).toLocaleString()}` : ""}</span>
        </div>
      )}

      <ContactOwnerModal 
        pgId={pg.id}
        pgName={pg.name}
        returnTo={`/pg/${pg.slug}`}
      />

    </div>
  );
}
