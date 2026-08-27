"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, BedDouble, Check, ShieldCheck, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchDraftPg, submitForVerification } from "@/app/actions/owner_pgs";
import Link from "next/link";

const ROOM_LABELS: Record<string, string> = {
  PERSONAL: "Single Room",
  "2_SHARING": "Double Sharing",
  "3_SHARING": "Triple Sharing",
  "4_SHARING": "4+ Sharing",
  "5_SHARING": "5 Sharing",
  "6_SHARING": "6 Sharing",
  "7_SHARING": "7 Sharing",
};

export function PreviewContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";

  const [pg, setPg] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pgId) {
      fetchDraftPg(pgId).then(data => {
        setPg(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [pgId]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await submitForVerification(pgId);
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Failed to submit.");
    }
  };

  if (!pgId || (!loading && !pg)) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please start from Step 1 to create a listing.</p>
        <Button onClick={() => router.push(basePath)} className="mt-4 rounded-xl">Go to Step 1</Button>
      </div>
    );
  }

  if (loading) return <div className="animate-pulse bg-muted rounded-2xl h-96" />;

  if (submitted) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-heading font-black mb-4">Submitted for Verification!</h2>
        <p className="text-muted-foreground text-lg mb-2">Your PG listing has been submitted successfully.</p>
        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 mb-8 text-sm px-4 py-1">PENDING REVIEW</Badge>
        <p className="text-muted-foreground text-sm mb-8">Our admin team will review your listing shortly. Once approved, it will be visible to all users on PGBook.</p>
        <Link href="/owner/dashboard">
          <Button size="lg" className="rounded-xl font-bold h-14 px-8">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const images = (pg.pg_images as any[] || []).sort((a: any, b: any) => a.display_order - b.display_order);
  const coverImage = images.find((img: any) => img.is_primary) || images[0];
  const rooms = (pg.rooms as any[]) || [];
  const amenities = (pg.pg_amenities as any[]) || [];
  const cityName = (pg.cities as any)?.name || "";
  const localityName = (pg.localities as any)?.name || "";
  const genderLabel = pg.gender === "BOYS" ? "Boys" : pg.gender === "GIRLS" ? "Girls" : "Co-Living";
  const foodLabel = pg.food_status === "INCLUDED" ? "Included" : pg.food_status === "AVAILABLE" ? "Available" : "Not Available";

  const editLink = (step: string) => `${basePath}${step}?pgId=${pgId}`;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Preview Your Listing</h1>
        <p className="text-muted-foreground font-medium">Review all details before submitting for verification.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">{error}</div>
      )}

      <div className="space-y-6 mb-8">
        {/* Cover Image */}
        {coverImage && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm aspect-video relative">
            <img src={coverImage.url} alt={pg.name} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Gallery thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img: any) => (
              <img key={img.id} src={img.url} alt="" className="w-20 h-16 rounded-lg object-cover border border-border shrink-0" />
            ))}
            <Link href={editLink("/gallery")} className="w-20 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center shrink-0 hover:bg-muted/50">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        )}

        {/* PG Info */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">{pg.name === "Untitled PG" ? "—" : pg.name}</h2>
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-primary" />
                {pg.address ? `${pg.address}, ${localityName}, ${cityName}` : "No address set"}
              </p>
            </div>
            <Link href={editLink("/details")}>
              <Button variant="ghost" size="sm" className="text-primary"><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{genderLabel}</Badge>
            <Badge variant="outline">Food: {foodLabel}</Badge>
          </div>
          {pg.description && <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{pg.description}</p>}
        </div>

        {/* Rooms */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">Room Configurations</h3>
            <Link href={editLink("")}>
              <Button variant="ghost" size="sm" className="text-primary"><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
            </Link>
          </div>
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room: any) => (
                <div key={room.id} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{ROOM_LABELS[room.room_type] || room.room_type}</span>
                    <span className="text-primary font-bold">₹{room.rent?.toLocaleString()}/mo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Deposit: ₹{room.security_deposit?.toLocaleString()} • Beds: {room.total_beds}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No rooms configured.</p>
          )}
        </div>

        {/* Amenities */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">Amenities</h3>
            <Link href={editLink("/amenities")}>
              <Button variant="ghost" size="sm" className="text-primary"><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
            </Link>
          </div>
          {amenities.length > 0 ? (
            <p className="text-muted-foreground text-sm">{amenities.length} amenities selected</p>
          ) : (
            <p className="text-muted-foreground text-sm">No amenities selected.</p>
          )}
        </div>
      </div>

      {/* Submit Bar */}
      <div className="bg-card rounded-2xl p-6 border-2 border-primary/20 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">Ready to submit?</h3>
            <p className="text-sm text-muted-foreground">Your listing will be reviewed by our team before going live.</p>
          </div>
          <Button onClick={handleSubmit} disabled={submitting} size="lg" className="rounded-xl font-bold h-14 px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Send className="w-5 h-5 mr-2" />
            {submitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <Button variant="outline" onClick={() => router.push(`${basePath}/gallery?pgId=${pgId}`)} className="rounded-xl font-bold px-6 h-12">Previous</Button>
      </div>
    </>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <PreviewContent />
    </Suspense>
  );
}
