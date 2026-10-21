import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface SupabasePGListing {
  id: string;
  slug: string;
  name: string;
  address: string;
  gender: string;
  status: string;
  is_verified: boolean;
  rating: number;
  review_count: number;
  cities: { name: string } | null;
  localities: { name: string } | null;
  rooms: { rent: number; room_type?: string }[];
  pg_images: { url: string; is_primary: boolean }[];
  pg_amenities: { amenities: { name: string; icon: string; category: string } | null }[];
  monthly_rent_from?: number;
  monthly_rent_to?: number;
  isFavorited?: boolean;
}

export function PGCard({ pg }: { pg: SupabasePGListing }) {
  const primaryImage = pg.pg_images?.find(img => img.is_primary)?.url || pg.pg_images?.[0]?.url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80";
  
  // Extract amenities safely
  const amenitiesList = (pg.pg_amenities || [])
    .map(pa => pa.amenities)
    .filter((a): a is NonNullable<typeof a> => a !== null);
  
  // Show max 3 amenities to keep card clean
  const topAmenities = amenitiesList.slice(0, 3);
  
  const hasFood = amenitiesList.some(a => a.name.toLowerCase().includes("meal") || a.name.toLowerCase().includes("food"));

  // Calculate minimum rent from rooms or monthly_rent_from
  const rentMin = (pg.rooms && pg.rooms.length > 0)
    ? Math.min(...pg.rooms.map(r => r.rent)) 
    : ((pg as any).monthly_rent_from || 0);

  const cityName = pg.cities?.name || "";
  const areaName = pg.localities?.name || "";

  return (
    <Link href={`/pg/${pg.slug}`}>
      <Card className="rounded-[20px] overflow-hidden group cursor-pointer border-transparent hover:border-border/50 h-full flex flex-col bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        
        {/* Image Container */}
        <div className="relative h-[240px] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={primaryImage}
            alt={pg.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {pg.is_verified && (
              <Badge className="bg-white/95 text-success hover:bg-white border-none shadow-sm gap-1 pl-1.5 font-bold">
                <ShieldCheck className="w-4 h-4" /> PGBook Reviewed
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/95 hover:bg-white text-foreground border-none shadow-sm font-semibold capitalize">
              {pg.gender.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>

          <button 
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${pg.isFavorited ? 'bg-primary/10 text-primary' : 'bg-black/20 text-white hover:bg-black/40'}`}
            onClick={(e) => {
              e.preventDefault();
              // handle favorite
            }}
          >
            <Heart className={`w-5 h-5 ${pg.isFavorited ? 'fill-primary' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-heading font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors text-foreground">
              {pg.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-muted px-2 py-0.5 rounded text-sm font-medium">
              <Rating value={1} max={1} size={14} className="text-warning fill-warning" />
              <span>{pg.rating}</span>
            </div>
          </div>

          <div className="flex items-center text-muted-foreground text-sm mb-4">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="line-clamp-1">{areaName}, {cityName}</span>
          </div>

          {/* Amenities Mini List */}
          <div className="flex flex-wrap gap-2 mt-auto mb-4">
            {topAmenities.map((amenity, idx) => (
              <span key={idx} className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                {amenity.name}
              </span>
            ))}
            {hasFood && (
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                Food Included
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 border-t border-border/50 mt-auto flex items-center justify-between bg-card">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Starts from</p>
            <p className="font-heading font-bold text-lg text-primary">
              {rentMin > 0 ? formatCurrency(rentMin) : "TBD"}<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
          <div className="bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Details
          </div>
        </CardFooter>

      </Card>
    </Link>
  );
}
