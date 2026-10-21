import { Heart, MessageSquare, ClipboardList } from "lucide-react";
import Link from "next/link";
import { PGCard } from "@/components/pg/PGCard";
import { createClient } from "@/lib/supabase/server";

export default async function UserDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch saved PGs (favorites)
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      pg_id,
      pgs (
        id, slug, name, description, address, gender, rating, review_count, status, is_verified,
        cities ( name ), localities ( name ),
        rooms ( id, room_type, rent, total_beds, occupied_beds ),
        pg_images ( url, is_primary ),
        pg_amenities ( amenities ( id, name, icon, category ) )
      )
    `)
    .eq("user_id", user?.id || "");

  // Fetch reviews given
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user?.id || "");

  const savedPGs = favorites?.map((f: any) => f.pgs).filter(Boolean) || [];
  const reviewsGiven = reviews?.length || 0;

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id, pg_id, status, message, created_at, pgs ( name, slug )")
    .eq("user_id", user?.id || "")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="container-custom py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black mb-2 text-foreground tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground font-medium text-lg">Your saved PGs and reviews, all in one place.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5 hover:border-primary/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-600">
            <Heart className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-0.5">Saved Properties</p>
            <p className="text-3xl font-heading font-black text-foreground">{savedPGs.length}</p>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5 hover:border-primary/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600"><ClipboardList className="w-7 h-7" /></div>
          <div><p className="text-sm text-muted-foreground font-semibold mb-0.5">My Inquiries</p><p className="text-3xl font-heading font-black text-foreground">{inquiries?.length || 0}</p></div>
        </div>
        
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5 hover:border-primary/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-0.5">Reviews Given</p>
            <p className="text-3xl font-heading font-black text-foreground">{reviewsGiven}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-heading font-bold text-foreground">My Inquiries</h2><p className="text-sm text-muted-foreground">These are questions to owners, not room bookings.</p></div>
          {inquiries?.length ? <div className="space-y-3">{inquiries.map((inquiry: any) => <article key={inquiry.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center"><div><h3 className="font-bold text-foreground">{inquiry.pgs?.name || "PG listing"}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{inquiry.message || "Inquiry sent"}</p><time className="mt-2 block text-xs text-muted-foreground" dateTime={inquiry.created_at}>{new Date(inquiry.created_at).toLocaleDateString("en-IN")}</time></div><div className="flex items-center gap-3"><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{String(inquiry.status).toLowerCase()}</span>{inquiry.pgs?.slug && <Link href={`/pg/${inquiry.pgs.slug}`} className="text-sm font-semibold text-primary hover:underline">View PG</Link>}</div></article>)}</div> : <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">You have not sent any inquiries yet.</p>}
        </section>

        <div>
          <h2 className="text-2xl font-heading font-bold mb-6 text-foreground">Saved Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {savedPGs.map((pg) => (
              <PGCard key={pg.id} pg={pg as any} />
            ))}
            {savedPGs.length === 0 && (
              <p className="text-muted-foreground col-span-full">You have not saved any properties yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
