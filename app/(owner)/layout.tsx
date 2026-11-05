import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { OwnerTopNav } from "@/components/owner/OwnerTopNav";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login?next=/owner/dashboard");
  }

  // Fetch user profile and owner_profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: ownerProfile } = await supabase
    .from("owner_profiles")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const isApprovedOwner = ownerProfile?.status === "APPROVED";
  const isOwner = profile?.role === "OWNER" || isApprovedOwner;
  const isAdmin = profile?.role === "ADMIN";

  // Auto-upgrade PG Manager user session to owner if they signed up for PG Manager
  if (!isOwner && !isAdmin) {
    // Check if user has any properties
    const { count: pgCount } = await supabase
      .from("pgs")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id);

    if (!pgCount || pgCount === 0) {
      // Let them into properties management to create their first PG
      // Do not kick to PGBook's old become-owner flow!
    }
  }

  // Fetch properties for property selector
  const { data: properties } = await supabase
    .from("pgs")
    .select("id, name, address, cities ( name )")
    .eq("owner_id", user.id)
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  const simpleProperties = (properties || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    city: p.cities?.name,
  }));

  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      {/* Desktop Sidebar */}
      <OwnerSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <OwnerTopNav
          properties={simpleProperties}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
