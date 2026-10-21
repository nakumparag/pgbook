"use client";

import { ShieldCheck } from "lucide-react";
import { ContactOwnerModal } from "./ContactOwnerModal";

export function PropertyContactCard({ pg }: { pg: any }) {
  const rentMin = pg.rooms?.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
  const rentMax = pg.rooms?.length > 0 ? Math.max(...pg.rooms.map((r: any) => r.rent)) : 0;

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

      <div className="space-y-4 mb-6 pt-6 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Security Deposit</span>
          <span className="font-semibold text-foreground">1 Month Rent</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Brokerage</span>
          <span className="font-semibold text-success flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Zero Brokerage
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Notice Period</span>
          <span className="font-semibold text-foreground">30 Days</span>
        </div>
      </div>

      <ContactOwnerModal 
        pgId={pg.id}
        ownerId={pg.owner_id}
        pgName={pg.name}
        contactPhone={(pg.profiles as any)?.phone || null}
        whatsappNumber={(pg.profiles as any)?.phone || null}
        locality={(pg.localities as any)?.name || ""}
      />

    </div>
  );
}
