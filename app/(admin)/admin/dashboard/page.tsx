import { Building2, Users, AlertTriangle, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { updatePgStatus, verifyOwnerId, verifyProperty, resolveApprovalRequest } from "@/app/actions/admin";
import ApprovalRequestsTable from "@/components/admin/ApprovalRequestsTable";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch approval requests
  const { data: rawApprovalRequests } = await supabase
    .from("approval_requests")
    .select(`
      id, status, created_at, request_type,
      profiles!owner_id ( full_name, phone, owner_profiles ( status, id_type, id_number, id_document_url ) ),
      pgs!pg_id ( id, name, city_id, cities(name) )
    `)
    .eq("status", "PENDING")
    .order("created_at", { ascending: false });

  // Generate signed URLs for private documents
  const approvalRequests = await Promise.all((rawApprovalRequests || []).map(async (req: any) => {
    let signedDocUrl = null;
    const ownerProfile = Array.isArray(req.profiles?.owner_profiles) ? req.profiles?.owner_profiles[0] : req.profiles?.owner_profiles;
    if (ownerProfile?.id_document_url) {
      if (!ownerProfile.id_document_url.startsWith('http')) {
        const { data } = await supabase.storage.from('owner-documents').createSignedUrl(ownerProfile.id_document_url, 60 * 60);
        if (data?.signedUrl) {
          signedDocUrl = data.signedUrl;
        }
      } else {
        signedDocUrl = ownerProfile.id_document_url; // Fallback for any old public URLs
      }
    }
    return { ...req, ownerProfile, signedDocUrl };
  }));

  // Fetch active listings
  const { data: activeListings } = await supabase
    .from("pgs")
    .select(`
      id, name, city_id, is_verified, owner_id,
      cities ( name ),
      profiles!owner_id ( full_name, id_verified )
    `)
    .eq("status", "APPROVED")
    .limit(20);

  // Quick stats queries
  const [{ count: totalPGs }, { count: totalUsers }, { count: pendingCount }] = await Promise.all([
    supabase.from("pgs").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("pgs").select("*", { count: "exact", head: true }).eq("status", "PENDING")
  ]);

  return (
    <div className="container-custom py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black mb-2 text-foreground tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground font-medium text-lg">Platform overview and pending approvals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">Total PGs</p>
          </div>
          <p className="text-3xl font-heading font-black mt-2 text-foreground">{totalPGs || 0}</p>
        </div>
        
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">Total Users</p>
          </div>
          <p className="text-3xl font-heading font-black mt-2 text-foreground">{totalUsers || 0}</p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-warning" />
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-warning/20 flex items-center justify-center text-warning">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">Pending Requests</p>
          </div>
          <p className="text-3xl font-heading font-black mt-2 text-foreground">{approvalRequests?.length || 0}</p>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Building2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-muted-foreground font-semibold">Total Owners</p>
          </div>
          <p className="text-3xl font-heading font-black mt-2 text-foreground">--</p>
        </div>
      </div>

      <ApprovalRequestsTable requests={approvalRequests} />

      <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-foreground">Active PGs (Management)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">PG Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(activeListings || []).map((pg: any) => (
                <tr key={pg.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground text-base">{pg.name}</td>
                  <td className="px-6 py-4 font-medium text-muted-foreground">
                    {pg.profiles?.full_name || 'Unknown'} 
                    {pg.profiles?.id_verified && <span className="ml-2 text-xs bg-success/20 text-success px-2 py-0.5 rounded">ID Verified</span>}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {pg.is_verified ? (
                      <span className="text-success text-xs font-bold bg-success/10 px-2 py-1 rounded">Verified Property</span>
                    ) : (
                      <span className="text-muted-foreground text-xs font-bold bg-muted px-2 py-1 rounded">Unverified Property</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      {!pg.profiles?.id_verified && (
                        <form action={async () => { "use server"; await verifyOwnerId(pg.owner_id, true); }}>
                          <Button type="submit" size="sm" variant="outline" className="rounded-lg shadow-sm border-primary text-primary">
                            Verify Owner ID
                          </Button>
                        </form>
                      )}
                      {!pg.is_verified && (
                        <form action={async () => { "use server"; await verifyProperty(pg.id, true); }}>
                          <Button type="submit" size="sm" variant="outline" className="rounded-lg shadow-sm border-success text-success">
                            Verify Property
                          </Button>
                        </form>
                      )}
                      <form action={async () => { "use server"; await updatePgStatus(pg.id, "ARCHIVED"); }}>
                        <Button type="submit" size="sm" variant="destructive" className="rounded-lg shadow-sm">
                          Remove Listing
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
