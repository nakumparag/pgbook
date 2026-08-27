 
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { use, useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Map, LayoutGrid, SlidersHorizontal, ChevronDown, Search, X } from "lucide-react";
import { PGCard, SupabasePGListing } from "@/components/pg/PGCard";
import { SearchFilters, ActiveFilters } from "@/components/search/SearchFilters";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

const QUICK_FILTERS = [
  { label: "Verified", param: "verified", value: "true" },
  { label: "Food Included", param: "food", value: "included" },
  { label: "Girls PG", param: "gender", value: "girls" },
  { label: "Boys PG", param: "gender", value: "boys" },
  { label: "WiFi", param: "amenity", value: "wifi" },
  { label: "AC", param: "amenity", value: "ac" },
  { label: "Private Room", param: "roomType", value: "personal" },
  { label: "Under ₹7,000", param: "budget", value: "under-7000" },
];

interface ExploreContentProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ExploreContent({ searchParams }: ExploreContentProps) {
  const resolvedParams = use(searchParams);
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const supabase = createClient();

  const [realListings, setRealListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read all URL params
  const cityQuery = (resolvedParams.city as string) || "";
  const urlGender = (resolvedParams.gender as string) || "";
  const urlBudget = (resolvedParams.budget as string) || "";
  const urlFood = (resolvedParams.food as string) || "";
  const urlRoomType = (resolvedParams.roomType as string) || "";
  const urlVerified = resolvedParams.verified === "true";
  const urlAmenity = (resolvedParams.amenity as string) || "";
  const urlQ = (resolvedParams.q as string) || "";

  const [view, setView] = useState<"grid" | "map">("grid");
  const [sort, setSort] = useState("recommended");
  const [sortOpen, setSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(cityQuery || urlQ);
  const [sidebarFilters, setSidebarFilters] = useState<ActiveFilters>({
    propertyTypes: [],
    genders: [],
    roomTypes: [],
    amenities: [],
    maxRent: 50000,
    minRent: 3000,
    verifiedOnly: urlVerified,
    location: cityQuery,
  });

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("pgs")
        .select(`
          id, slug, name, address, gender, status, is_verified, rating, review_count, description, created_at,
          cities ( name ), localities ( name ), rooms ( rent, room_type ),
          pg_images ( url, is_primary ), pg_amenities ( amenities ( name, icon, category ) )
        `)
        .eq("status", "APPROVED");

      if (!error && data) {
        setRealListings(data);
      }
      setLoading(false);
    }
    fetchListings();
  }, [supabase]);

  const handleFilterChange = useCallback((filters: ActiveFilters) => {
    setSidebarFilters(filters);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) router.push(`/explore?city=${encodeURIComponent(searchQuery.toLowerCase())}`);
    else router.push("/explore");
  };

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || "Sort";

  const getQuickFilterActive = (filter: typeof QUICK_FILTERS[0]) => {
    if (filter.param === "verified") return sidebarFilters.verifiedOnly || urlVerified;
    if (filter.param === "gender") {
      const g = filter.value === "girls" ? "Female" : "Male";
      return sidebarFilters.genders.includes(g) || urlGender === filter.value;
    }
    if (filter.param === "food") {
      return sidebarFilters.amenities.some((a) => a.toLowerCase().includes("meal")) || urlFood === "included";
    }
    if (filter.param === "amenity") {
      return (
        sidebarFilters.amenities.some((a) => a.toLowerCase() === filter.value.toLowerCase()) ||
        urlAmenity === filter.value
      );
    }
    if (filter.param === "roomType") return urlRoomType === filter.value;
    if (filter.param === "budget") return urlBudget === filter.value;
    return false;
  };

  const toggleQuickFilter = (filter: typeof QUICK_FILTERS[0]) => {
    const params = new URLSearchParams(urlSearchParams?.toString() || "");
    const isActive = getQuickFilterActive(filter);

    if (isActive) {
      params.delete(filter.param);
    } else {
      params.set(filter.param, filter.value);
    }
    router.push(`/explore?${params.toString()}`);
  };

  const filteredListings = useMemo(() => {
    let results = [...realListings];

    // Helper to get safe values from Supabase object
    const getCity = (pg: any) => pg.cities?.name?.toLowerCase() || "";
    const getArea = (pg: any) => pg.localities?.name?.toLowerCase() || "";
    const getRentMin = (pg: any) => pg.rooms?.length ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
    const getRentMax = (pg: any) => pg.rooms?.length ? Math.max(...pg.rooms.map((r: any) => r.rent)) : 0;
    const getFlatAmenities = (pg: any) => pg.pg_amenities?.map((pa: any) => pa.amenities?.name?.toLowerCase() || "") || [];

    if (cityQuery) {
      results = results.filter((pg) => getCity(pg).includes(cityQuery.toLowerCase()));
    }

    if (sidebarFilters.location && !cityQuery) {
      const loc = sidebarFilters.location.toLowerCase();
      results = results.filter((pg) => getCity(pg).includes(loc) || getArea(pg).includes(loc));
    }

    results = results.filter(
      (pg) => getRentMin(pg) <= sidebarFilters.maxRent && getRentMax(pg) >= sidebarFilters.minRent
    );

    if (urlBudget === "under-7000") results = results.filter((pg) => getRentMin(pg) < 7000);
    else if (urlBudget === "under-5000") results = results.filter((pg) => getRentMin(pg) < 5000);
    else if (urlBudget === "5000-7000") results = results.filter((pg) => getRentMin(pg) >= 5000 && getRentMin(pg) <= 7000);
    else if (urlBudget === "7000-10000") results = results.filter((pg) => getRentMin(pg) >= 7000 && getRentMin(pg) <= 10000);
    else if (urlBudget === "10000-15000") results = results.filter((pg) => getRentMin(pg) >= 10000 && getRentMin(pg) <= 15000);
    else if (urlBudget === "above-15000") results = results.filter((pg) => getRentMin(pg) > 15000);

    if (sidebarFilters.genders.length > 0) {
      results = results.filter((pg) =>
        sidebarFilters.genders.some((g) => pg.gender.toLowerCase() === g.toLowerCase() || pg.gender.toLowerCase() === "co_living")
      );
    }

    if (urlGender) {
      const genderMap: Record<string, string> = { girls: "GIRLS", boys: "BOYS", unisex: "CO_LIVING" };
      const mappedGender = genderMap[urlGender];
      if (mappedGender) results = results.filter((pg) => pg.gender === mappedGender);
    }

    // Property types (pgs table represents only PGs, but we map CoLiving from gender)
    if (sidebarFilters.propertyTypes.length > 0) {
      results = results.filter((pg) => {
        const isCoLiving = pg.gender === "CO_LIVING";
        return sidebarFilters.propertyTypes.some((t) => 
          (t.toLowerCase().includes("pg") && !isCoLiving) || 
          (t.toLowerCase().includes("co") && isCoLiving)
        );
      });
    }

    if (sidebarFilters.amenities.length > 0) {
      results = results.filter((pg) =>
        sidebarFilters.amenities.every((reqAmenity) =>
          getFlatAmenities(pg).some((a: string) => a.includes(reqAmenity.toLowerCase()))
        )
      );
    }

    if (urlAmenity) {
      results = results.filter((pg) =>
        getFlatAmenities(pg).some((a: string) => a.includes(urlAmenity.toLowerCase()))
      );
    }

    if (urlFood === "included") {
      results = results.filter((pg) =>
        getFlatAmenities(pg).some((a: string) => a.includes("meal") || a.includes("food"))
      );
    }

    if (urlRoomType) {
      const rtMap: Record<string, string[]> = {
        personal: ["personal", "single", "private"],
        "2-sharing": ["2_sharing", "double"],
        "3-sharing": ["3_sharing", "triple"],
      };
      const roomKeywords = rtMap[urlRoomType] || [urlRoomType];
      results = results.filter((pg) =>
        pg.rooms?.some((room: any) => roomKeywords.some((k) => room.room_type?.toLowerCase().includes(k.toLowerCase())))
      );
    }

    if (sidebarFilters.roomTypes.length > 0) {
      results = results.filter((pg) =>
        pg.rooms?.some((room: any) =>
          sidebarFilters.roomTypes.some((rt) => room.room_type?.toLowerCase().includes(rt.toLowerCase().split(" ")[0]))
        )
      );
    }

    if (sidebarFilters.verifiedOnly || urlVerified) {
      results = results.filter((pg) => pg.is_verified === true);
    }

    if (urlQ && !cityQuery) {
      const q = urlQ.toLowerCase();
      results = results.filter(
        (pg) =>
          pg.name?.toLowerCase().includes(q) ||
          getCity(pg).includes(q) ||
          getArea(pg).includes(q) ||
          pg.description?.toLowerCase().includes(q)
      );
    }

    return results;
  }, [
    cityQuery, urlBudget, urlGender, urlFood, urlRoomType, urlVerified, urlAmenity, urlQ, sidebarFilters, realListings
  ]);

  const sortedListings = useMemo(() => {
    return [...filteredListings].sort((a, b) => {
      const getRentMin = (pg: any) => pg.rooms?.length ? Math.min(...pg.rooms.map((r: any) => r.rent)) : 0;
      if (sort === "price-low") return getRentMin(a) - getRentMin(b);
      if (sort === "price-high") return getRentMin(b) - getRentMin(a);
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });
  }, [filteredListings, sort]);

  const headingParts: string[] = [];
  if (urlGender === "girls") headingParts.push("Girls");
  else if (urlGender === "boys") headingParts.push("Boys");
  headingParts.push("PGs");
  if (cityQuery) headingParts.push(`in ${cityQuery.charAt(0).toUpperCase() + cityQuery.slice(1)}`);
  else headingParts.push("Across Gujarat");
  const heading = headingParts.join(" ");

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-16 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="container-custom py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search city, area or locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground flex-1"
                aria-label="Search location"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); router.push("/explore"); }}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="rounded-xl shrink-0 gradient-primary border-none">
              Search
            </Button>
          </form>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 pb-1">
            {QUICK_FILTERS.map((filter) => {
              const isActive = getQuickFilterActive(filter);
              return (
                <button
                  key={filter.label}
                  onClick={() => toggleQuickFilter(filter)}
                  className={`shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                  aria-pressed={isActive}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container-custom py-6 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-72 shrink-0" aria-label="Search filters">
          <SearchFilters
            onFilterChange={handleFilterChange}
            initialLocation={cityQuery}
          />
        </aside>

        <main className="flex-1 flex flex-col" aria-label="Search results">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-0.5">{heading}</h1>
              <p className="text-muted-foreground text-sm">
                {loading ? "Searching..." : `${sortedListings.length} verified ${sortedListings.length === 1 ? "stay" : "stays"} found`}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex p-1 bg-muted rounded-xl border border-border/50" role="group" aria-label="View toggle">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`p-2 rounded-lg transition-colors ${view === "map" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  aria-label="Map view"
                  aria-pressed={view === "map"}
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-semibold hover:border-primary transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                >
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  {currentSortLabel}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${sortOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                {sortOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                    role="listbox"
                    aria-label="Sort options"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                         key={opt.value}
                         onClick={() => { setSort(opt.value); setSortOpen(false); }}
                         role="option"
                         aria-selected={sort === opt.value}
                         className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                           sort === opt.value ? "text-primary font-semibold bg-primary/8" : "text-foreground hover:bg-muted"
                         }`}
                      >
                         {opt.value === sort && <span className="mr-2">✓</span>}
                         {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {loading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground">Loading PGs...</div>
              ) : sortedListings.length > 0 ? (
                sortedListings.map((pg, index) => (
                  <motion.div
                    key={pg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                  >
                    <PGCard pg={pg as SupabasePGListing} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-2xl text-center px-8">
                  <Search className="w-12 h-12 text-muted-foreground/30 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground mb-2">No PGs found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your filters or search for a different city.
                  </p>
                  <button
                    onClick={() => router.push("/explore")}
                    className="mt-4 text-primary font-semibold text-sm hover:underline"
                  >
                    View all PGs →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-96 border border-border rounded-2xl overflow-hidden relative bg-muted/30">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-card p-6 rounded-2xl shadow-xl max-w-sm border border-border">
                  <Map className="w-12 h-12 text-primary mx-auto mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-foreground mb-2">Map View Coming Soon</h3>
                  <p className="text-muted-foreground text-sm">
                    Interactive map with PG locations will be available once Google Maps API is configured.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
