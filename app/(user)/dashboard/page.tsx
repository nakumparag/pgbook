import { Calendar, Heart, MessageSquare } from "lucide-react";
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

  // Fetch bookings (visits)
  const { data: bookings } = await supabase
    .from("visit_bookings")
    .select("id, status")
    .eq("user_id", user?.id || "");

  // Fetch reviews given
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user?.id || "");

  const savedPGs = favorites?.map((f: any) => f.pgs).filter(Boolean) || [];
  const upcomingVisits = bookings?.filter((b: any) => b.status === "PENDING" || b.status === "CONFIRMED").length || 0;
  const reviewsGiven = reviews?.length || 0;

  return (
    <div className="container-custom py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-heading font-black mb-2 text-foreground tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground font-medium text-lg">Manage your bookings and saved properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5 hover:border-primary/50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-0.5">Upcoming Visits</p>
            <p className="text-3xl font-heading font-black text-foreground">{upcomingVisits}</p>
          </div>
        </div>
        
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
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-semibold mb-0.5">Reviews Given</p>
            <p className="text-3xl font-heading font-black text-foreground">{reviewsGiven}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
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
        
        <div>
          <h2 className="text-2xl font-heading font-bold mb-6 text-foreground">Upcoming Visits</h2>
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <h3 className="font-bold text-lg text-foreground mb-1">No Upcoming Visits</h3>
            <p className="text-sm text-muted-foreground font-medium mb-4">Book a visit to a PG to see it here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
