import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Building2, BedDouble, Users, CreditCard, ClipboardList, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PropertyManagerPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login?next=/manager/manager-portal");
  }

  // Fetch properties assigned to this manager or owned by this user
  const { data: memberRows } = await supabase
    .from("property_members")
    .select("pg_id, role")
    .eq("user_id", user.id);

  let assignedPgIds = (memberRows || []).map((m) => m.pg_id);

  // Fallback: If owner logged in to manager portal, show their properties
  if (assignedPgIds.length === 0) {
    const { data: ownedPgs } = await supabase
      .from("pgs")
      .select("id")
      .eq("owner_id", user.id);
    assignedPgIds = (ownedPgs || []).map((p) => p.id);
  }

  if (assignedPgIds.length === 0) {
    return (
      <div className="min-h-screen bg-muted/20 p-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border text-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">No Assigned Properties Found</h2>
          <p className="text-xs text-muted-foreground">
            You have not been assigned to any properties yet. Please contact the PG owner to assign your account.
          </p>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/manager">Back to PG Manager</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch assigned properties details
  const { data: properties } = await supabase
    .from("pgs")
    .select(`
      id, name, address,
      cities ( name ),
      rooms ( id, room_type, rent, total_beds, occupied_beds )
    `)
    .in("id", assignedPgIds);

  // Fetch active tenants in assigned properties
  const { data: activeTenants } = await supabase
    .from("tenants")
    .select("id, full_name, phone, monthly_rent, status, move_in_date, pgs(name)")
    .in("pg_id", assignedPgIds)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch open maintenance requests
  const { data: openComplaints } = await supabase
    .from("maintenance_requests")
    .select("id, title, category, priority, status, created_at, pgs(name)")
    .in("pg_id", assignedPgIds)
    .neq("status", "RESOLVED")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col">
      {/* Manager Topbar */}
      <header className="sticky top-0 z-20 h-16 border-b border-border bg-background px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading font-black text-base text-foreground">Property Manager Desk</h1>
            <p className="text-[10px] text-muted-foreground font-semibold">Assigned Property Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
            <Link href="/owner/dashboard">
              Owner Mode
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Assigned Properties Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Assigned Properties ({properties?.length || 0})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(properties || []).map((p: any) => {
              const rooms = p.rooms || [];
              let beds = 0;
              let occ = 0;
              rooms.forEach((r: any) => {
                beds += r.total_beds || 0;
                occ += r.occupied_beds || 0;
              });

              return (
                <div key={p.id} className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.cities?.name} • {p.address}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-muted/40">
                    <span className="font-semibold text-muted-foreground">Occupancy:</span>
                    <span className="font-extrabold text-foreground">{occ} / {beds} Beds ({beds > 0 ? Math.round((occ / beds) * 100) : 0}%)</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button asChild size="sm" variant="outline" className="flex-1 rounded-xl text-xs font-semibold">
                      <Link href={`/owner/rooms?property=${p.id}`}>Beds</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1 rounded-xl text-xs font-semibold">
                      <Link href={`/owner/tenants?property=${p.id}`}>Tenants</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Panels: Active Residents & Maintenance Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Residents */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-foreground">Recent Check-Ins</h3>
              <Badge variant="outline" className="text-xs font-semibold">{activeTenants?.length || 0} Residents</Badge>
            </div>

            {(!activeTenants || activeTenants.length === 0) ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No active residents recorded.</p>
            ) : (
              <div className="divide-y divide-border/40 text-xs">
                {activeTenants.map((t: any) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{t.full_name}</p>
                      <p className="text-muted-foreground">{t.phone} • {t.pgs?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(t.monthly_rent)}/mo</p>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Maintenance Complaints */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-foreground">Pending Complaints</h3>
              <Badge variant="outline" className="text-xs font-semibold">{openComplaints?.length || 0} Open</Badge>
            </div>

            {(!openComplaints || openComplaints.length === 0) ? (
              <p className="text-xs text-muted-foreground py-6 text-center">All maintenance tickets resolved!</p>
            ) : (
              <div className="divide-y divide-border/40 text-xs">
                {openComplaints.map((c: any) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{c.title}</p>
                      <p className="text-muted-foreground">{c.category} • {c.pgs?.name}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={c.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
