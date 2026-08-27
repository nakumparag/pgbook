import { Building, Users, Eye, Plus, Heart, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "bg-muted text-muted-foreground", icon: FileText },
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  APPROVED: { label: "Active", color: "bg-success/10 text-success", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "bg-destructive/10 text-destructive", icon: XCircle },
  SUSPENDED: { label: "Paused", color: "bg-orange-100 text-orange-700", icon: Clock },
};

import { pausePgListing, deletePgListing } from "@/app/actions/owner_pgs";

export default async function OwnerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name, id_verified, verification_status, role").eq("id", user?.id || "").single();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, name, status, contact_type, created_at, pgs(name)")
    .eq("owner_id", user?.id || "")
    .order("created_at", { ascending: false });

  const pendingInquiriesCount = inquiries?.filter((inq) => inq.status === "NEW").length || 0;
  const recentInquiries = inquiries?.slice(0, 5) || [];

  const { data: myProperties } = await supabase
    .from("pgs")
    .select(`
      id, slug, name, description, address, gender, rating, review_count, status, is_verified,
      cities ( name ), localities ( name ),
      rooms ( id, room_type, rent, total_beds, occupied_beds ),
      pg_images ( url, is_primary ),
      pg_visits ( id ),
      favorites ( id )
    `)
    .eq("owner_id", user?.id || "")
    .order("created_at", { ascending: false });

  const allPgs = (myProperties || []).filter(pg => pg.status !== "ARCHIVED");
  const activeCount = allPgs.filter(pg => pg.status === "APPROVED").length;
  const pendingCount = allPgs.filter(pg => pg.status === "PENDING").length;
  const draftPgs = allPgs.filter(pg => pg.status === "DRAFT");
  const listedPgs = allPgs.filter(pg => pg.status !== "DRAFT");

  let totalVisits = 0;
  let totalSaves = 0;
  let totalBeds = 0;
  let occupiedBeds = 0;

  allPgs.forEach(pg => {
    totalVisits += (pg.pg_visits as any[])?.length || 0;
    totalSaves += (pg.favorites as any[])?.length || 0;
    (pg.rooms as any[])?.forEach(room => {
      totalBeds += room.total_beds || 0;
      occupiedBeds += room.occupied_beds || 0;
    });
  });

  const vacantBeds = totalBeds - occupiedBeds;

  const minRent = (pg: any) => {
    const rooms = (pg.rooms as any[]) || [];
    if (rooms.length === 0) return null;
    return Math.min(...rooms.map(r => r.rent));
  };

  const coverImage = (pg: any) => {
    const imgs = (pg.pg_images as any[]) || [];
    const primary = imgs.find(i => i.is_primary);
    return primary?.url || imgs[0]?.url || null;
  };

  return (
    <div className="container-custom py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-heading font-black mb-1 text-foreground tracking-tight">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">Manage your properties and tenant enquiries.</p>
        </div>
        <Button asChild size="lg" className="rounded-xl font-bold gap-2">
          <Link href="/owner/add-pg">
            <Plus className="w-5 h-5" />
            Add New PG
          </Link>
        </Button>
      </div>

      {profile?.role === "OWNER" && profile?.verification_status === "PENDING" && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-8 rounded-r-xl flex items-center justify-between">
          <div>
            <h3 className="text-orange-800 font-bold">Verification Pending</h3>
            <p className="text-orange-700 text-sm">Please submit your ID details to verify your profile and publish listings.</p>
          </div>
          <Link href="/become-owner/verification">
            <Button variant="outline" className="bg-white text-orange-700 border-orange-300 hover:bg-orange-50 font-bold">
              Verify Now
            </Button>
          </Link>
        </div>
      )}

      {profile?.role === "OWNER" && profile?.verification_status === "REJECTED" && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-8 rounded-r-xl flex items-center justify-between">
          <div>
            <h3 className="text-destructive font-bold">Verification Rejected</h3>
            <p className="text-destructive/80 text-sm">Your ID details were rejected. Please update and re-submit.</p>
          </div>
          <Link href="/become-owner/verification">
            <Button variant="outline" className="bg-white text-destructive border-destructive/30 hover:bg-destructive/10 font-bold">
              Update Details
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total PGs</p>
            <p className="text-2xl font-heading font-black text-foreground">{allPgs.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Active</p>
            <p className="text-2xl font-heading font-black text-foreground">{activeCount}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Pending</p>
            <p className="text-2xl font-heading font-black text-foreground">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Visits</p>
            <p className="text-2xl font-heading font-black text-foreground">{totalVisits}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Vacant Beds</p>
            <p className="text-2xl font-heading font-black text-foreground">{vacantBeds}</p>
          </div>
        </div>
      </div>

      {/* Drafts */}
      {draftPgs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-heading font-bold mb-4 text-foreground">My Drafts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {draftPgs.map(pg => (
              <Link key={pg.id} href={`/owner/add-pg?pgId=${pg.id}`} className="bg-card rounded-2xl p-5 border border-dashed border-border hover:border-primary/50 shadow-sm transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-muted text-muted-foreground text-[10px] font-bold">DRAFT</Badge>
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {pg.name === "Untitled PG" ? "Untitled Draft" : pg.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {(pg.cities as any)?.name || "No location set"}
                </p>
                <p className="text-xs text-primary font-semibold mt-3">Continue Editing →</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* PG Listings */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-heading font-bold mb-4 text-foreground">My PG Listings</h2>
          {listedPgs.length > 0 ? (
            <div className="space-y-4">
              {listedPgs.map(pg => {
                const status = STATUS_CONFIG[pg.status] || STATUS_CONFIG.PENDING;
                const StatusIcon = status.icon;
                const rent = minRent(pg);
                const cover = coverImage(pg);
                const visits = (pg.pg_visits as any[])?.length || 0;
                const saves = (pg.favorites as any[])?.length || 0;

                return (
                  <div key={pg.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="sm:w-48 h-40 sm:h-auto shrink-0 bg-muted">
                      {cover ? (
                        <img src={cover} alt={pg.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${status.color} text-[10px] font-bold gap-1`}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </Badge>
                          {pg.gender && (
                            <Badge variant="outline" className="text-[10px]">{pg.gender.replace("_", " ")}</Badge>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{pg.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPinInline /> {(pg.localities as any)?.name}, {(pg.cities as any)?.name}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border flex-wrap gap-2">
                        <div className="flex gap-4 text-xs text-muted-foreground font-semibold">
                          {rent && <span className="text-primary font-bold text-sm">₹{rent.toLocaleString()}/mo</span>}
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {visits}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {saves}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/owner/add-pg?pgId=${pg.id}`}>
                            <Button variant="outline" size="sm" className="rounded-lg text-xs font-bold">Edit</Button>
                          </Link>
                          {pg.status === "APPROVED" && (
                            <form action={async () => { "use server"; await pausePgListing(pg.id); }}>
                              <Button type="submit" variant="outline" size="sm" className="rounded-lg text-xs font-bold">Pause</Button>
                            </form>
                          )}
                          <form action={async () => { "use server"; await deletePgListing(pg.id); }}>
                            <Button type="submit" variant="outline" size="sm" className="rounded-lg text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive">Delete</Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-10 border border-border text-center">
              <Building className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No PGs listed yet.</p>
              <Link href="/owner/add-pg">
                <Button className="mt-4 rounded-xl">Add Your First PG</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Inquiries Sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-foreground">
              Inquiries
              {pendingInquiriesCount > 0 && (
                <span className="ml-2 text-xs bg-primary text-white rounded-full px-2 py-0.5">{pendingInquiriesCount}</span>
              )}
            </h2>
            <Link href="/owner/inquiries" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden divide-y divide-border">
            {recentInquiries.length > 0 ? (
              recentInquiries.map((inq: any) => (
                <div key={inq.id} className="p-4 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground text-sm">{inq.name}</h4>
                    {inq.status === "NEW" ? (
                      <span className="bg-blue-500/10 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">{inq.status}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">For: {inq.pgs?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {inq.contact_type} • {new Date(inq.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No inquiries yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline component to avoid importing MapPin at top level since it's used inside a map
function MapPinInline() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
  );
}
