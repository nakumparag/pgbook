import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck, Share2, Heart, Check, Users } from "lucide-react";
import { PGGallery } from "@/components/pg/PGGallery";
import { PropertyContactCard } from "@/components/pg/PropertyContactCard";
import { ReviewSection } from "@/components/pg/ReviewSection";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { VisitTracker } from "@/components/pg/VisitTracker";
import { SAMPLE_PGS, getSamplePGBySlug } from "@/lib/sample-pgs";

interface PGDetailProps {
  params: Promise<{ slug: string }>;
}

async function getPGBySlug(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("pgs")
      .select(`
        id, slug, name, description, address, gender, rating, review_count, status, is_verified, owner_id, available_from, rules,
        cities ( name ), localities ( name ),
        rooms ( id, room_type, rent, total_beds, occupied_beds, security_deposit, electricity_charges, maintenance_charges, other_charges ),
        pg_images ( url, is_primary, category ),
        pg_amenities ( amenities ( id, name, icon, category ) ),
        profiles:owner_id ( phone )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (data && !error) return data;
  } catch {
    // If Supabase fetch fails, fallback to sample
  }

  // Fallback to sample PGs for demo/testing
  const sample = getSamplePGBySlug(slug);
  if (sample) {
    return {
      id: sample.id,
      slug: sample.slug,
      name: sample.name,
      description: sample.description,
      address: sample.address,
      gender: sample.gender || "UNISEX",
      rating: sample.rating || 4.5,
      review_count: sample.review_count || 12,
      status: sample.status || "APPROVED",
      is_verified: sample.is_verified ?? true,
      owner_id: sample.owner_id || "sample-owner",
      available_from: sample.available_from,
      rules: [
        "Gate closes at 10:30 PM",
        "Visitors allowed in common area till 8 PM",
        "Smoking & alcohol strictly prohibited on premises",
        "Maintain quiet hours between 11 PM and 6 AM"
      ],
      cities: sample.cities,
      localities: sample.localities,
      rooms: (sample.rooms || []).map((r: any, idx: number) => ({
        id: `sample-room-${idx}`,
        room_type: r.room_type,
        rent: r.rent,
        total_beds: r.room_type === "SINGLE" ? 1 : r.room_type === "2_SHARING" ? 2 : r.room_type === "3_SHARING" ? 3 : 4,
        occupied_beds: 1,
        security_deposit: r.rent * 2,
        electricity_charges: 500,
        maintenance_charges: 300,
        other_charges: 0,
      })),
      pg_images: sample.pg_images || [],
      pg_amenities: sample.pg_amenities || [],
      profiles: { phone: sample.contact_phone || "9876543210" },
    };
  }

  return null;
}

export async function generateMetadata({ params }: PGDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const pg = await getPGBySlug(slug);

  if (!pg) {
    return { title: "PG Not Found | PGBook" };
  }

  const genderLabel = pg.gender === "GIRLS" ? "Girls" : pg.gender === "BOYS" ? "Boys" : "Unisex";
  const rentMin = pg.rooms.length > 0 ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
  const rentMax = pg.rooms.length > 0 ? Math.max(...pg.rooms.map((r: any) => r.rent)) : 0;
  
  const priceLabel = rentMin > 0 ? `₹${rentMin.toLocaleString()}–₹${rentMax.toLocaleString()}/mo` : "Price TBD";
  const cityName = (pg.cities as any)?.name || "";
  const areaName = (pg.localities as any)?.name || "";

  const title = `${pg.name} — ${genderLabel} PG in ${areaName}, ${cityName} | PGBook`;
  const description = `${pg.name} in ${areaName}, ${cityName}. ${genderLabel} PG starting at ${priceLabel}. ${pg.is_verified ? "Verified property." : ""} ${pg.description?.slice(0, 80) || ""}`;
  const primaryImage = pg.pg_images.find((i: any) => i.is_primary)?.url || pg.pg_images[0]?.url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://pgbook.in/pg/${pg.slug}`,
      siteName: "PGBook",
      type: "website",
      images: primaryImage ? [{ url: primaryImage, alt: pg.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    alternates: {
      canonical: `https://pgbook.in/pg/${pg.slug}`,
    },
  };
}

export async function generateStaticParams() {
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!
    );
    const { data } = await supabase.from("pgs").select("slug").eq("status", "APPROVED");
    const dbSlugs = (data || []).map((pg) => ({ slug: pg.slug }));
    const sampleSlugs = SAMPLE_PGS.map((p) => ({ slug: p.slug }));
    return [...sampleSlugs, ...dbSlugs];
  } catch {
    return SAMPLE_PGS.map((p) => ({ slug: p.slug }));
  }
}

export default async function PGDetail({ params }: PGDetailProps) {
  const { slug } = await params;
  const pg = await getPGBySlug(slug);

  if (!pg) {
    notFound();
  }

  const cityName = (pg.cities as any)?.name || "";
  const areaName = (pg.localities as any)?.name || "";
  
  const flatAmenities = pg.pg_amenities
    .map((pa: any) => pa.amenities)
    .filter(Boolean);

  const imagesForGallery = pg.pg_images.map((img: any) => ({
    id: img.url,
    url: img.url,
    isPrimary: img.is_primary,
    category: img.category || "Property"
  }));

  if (imagesForGallery.length === 0) {
    imagesForGallery.push({ id: "placeholder", url: "/placeholder-image.jpg", isPrimary: true, category: "Property" });
  }

  return (
    <div className="container-custom py-8">
      <VisitTracker pgId={pg.id} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="default" className="uppercase tracking-wider">
                PG
              </Badge>
              <Badge
                className={`uppercase tracking-wider ${
                  pg.gender === "BOYS"
                    ? "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-transparent"
                    : pg.gender === "GIRLS"
                    ? "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-transparent"
                    : "bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-transparent"
                }`}
              >
                {pg.gender.replace("_", " ")}
              </Badge>
              {pg.is_verified && (
                <Badge variant="outline" className="text-success border-success/30 bg-success/5 gap-1.5 px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Property
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-black mb-3 text-foreground tracking-tight">
              {pg.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-lg font-medium mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              {pg.address}, {areaName}, {cityName}
            </p>
            {pg.available_from && (
              <p className="inline-block bg-muted/50 text-foreground font-semibold px-4 py-2 rounded-xl text-sm border border-border shadow-sm">
                Available From: <span className="text-primary">{new Date(pg.available_from).toLocaleDateString()}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground transition-all shadow-sm">
                    <Share2 className="w-5 h-5 text-foreground" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-foreground text-background px-3 py-1.5 rounded text-sm font-medium z-50 shadow-xl">
                    Share
                    <Tooltip.Arrow className="fill-foreground" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button className="w-12 h-12 rounded-full border border-border flex items-center justify-center hover:bg-muted hover:border-foreground transition-all shadow-sm">
                    <Heart className="w-5 h-5 text-foreground" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className="bg-foreground text-background px-3 py-1.5 rounded text-sm font-medium z-50 shadow-xl">
                    Save
                    <Tooltip.Arrow className="fill-foreground" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mb-12">
        <PGGallery images={imagesForGallery} />
      </div>

      {/* Main Content & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-16">

          {/* About */}
          {pg.description && (
            <>
              <section>
                <h2 className="text-2xl font-heading font-bold mb-6 text-foreground">About this Property</h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">{pg.description}</p>
              </section>
              <div className="h-px w-full bg-border" />
            </>
          )}

          {/* Rooms */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-8 text-foreground">Available Rooms</h2>
            {pg.rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pg.rooms.map((room: any) => {
                  const available = room.total_beds > room.occupied_beds;
                  return (
                    <div
                      key={room.id}
                      className={`bg-card rounded-2xl p-6 border-2 transition-colors ${
                        available
                          ? "border-border hover:border-primary shadow-sm hover:shadow-md"
                          : "opacity-60 bg-muted/50 border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-1 capitalize">{room.room_type.replace('_', ' ')}</h3>
                          <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                            <Users className="w-4 h-4" /> Capacity: {room.total_beds}
                          </p>
                        </div>
                        <div className="text-right mb-4">
                          <p className="font-heading font-bold text-2xl text-primary">₹{room.rent.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground font-medium">per month</p>
                        </div>
                      </div>
                      
                      {/* Charges */}
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground mb-6 bg-muted/30 p-4 rounded-xl border border-border">
                        <div className="flex justify-between col-span-2">
                          <span>Deposit:</span>
                          <span className="font-bold text-foreground">₹{(room.security_deposit || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pr-2">
                          <span>Electricity:</span>
                          <span className="font-bold text-foreground">₹{room.electricity_charges || 0}/mo</span>
                        </div>
                        <div className="flex justify-between pl-2">
                          <span>Maintenance:</span>
                          <span className="font-bold text-foreground">₹{room.maintenance_charges || 0}/mo</span>
                        </div>
                      </div>

                      {available ? (
                        <span className="text-success text-sm font-bold flex items-center gap-1.5 bg-success/10 w-fit px-3 py-1.5 rounded-lg">
                          <Check className="w-4 h-4" /> Available Now
                        </span>
                      ) : (
                        <span className="text-danger text-sm font-bold bg-danger/10 w-fit px-3 py-1.5 rounded-lg">
                          Currently Full
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">No rooms listed yet.</p>
            )}
          </section>

          <div className="h-px w-full bg-border" />

          {/* Amenities */}
          <section>
            <h2 className="text-2xl font-heading font-bold mb-8 text-foreground">Amenities</h2>
            {flatAmenities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {flatAmenities.map((amenity: any) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-transparent hover:border-border transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm text-primary shrink-0 border border-border/50">
                      <Check className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-foreground">{amenity.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No amenities listed.</p>
            )}
          </section>

          <div className="h-px w-full bg-border" />

          {/* Rules */}
          {pg.rules && pg.rules.length > 0 && (
            <>
              <section>
                <h2 className="text-2xl font-heading font-bold mb-6 text-foreground">PG Rules</h2>
                <ul className="space-y-3">
                  {pg.rules.map((rule: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-medium text-lg leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <div className="h-px w-full bg-border" />
            </>
          )}

          {/* Reviews */}
          <section>
            <ReviewSection pgId={pg.id} rating={pg.rating || 0} count={pg.review_count || 0} />
          </section>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-full lg:w-96 shrink-0 mt-8 lg:mt-0">
          <PropertyContactCard pg={pg as any} />
        </div>
      </div>
    </div>
  );
}
