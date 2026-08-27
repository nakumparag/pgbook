"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageIcon, Trash2, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPgImage, deletePgImage, setPrimaryImage, updateImageCategory, fetchDraftPg } from "@/app/actions/owner_pgs";

interface ImageItem {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
  category: string;
}

export function GalleryContent({ basePath = "/owner/add-pg" }: { basePath?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pgId = searchParams.get("pgId") || "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pgId) {
      fetchDraftPg(pgId).then(pg => {
        if (pg?.pg_images) {
          setImages(
            (pg.pg_images as any[])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((img: any) => ({ id: img.id, url: img.url, is_primary: img.is_primary, display_order: img.display_order, category: img.category || "Property" }))
          );
        }
      });
    }
  }, [pgId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadPgImage(pgId, formData);

      if (result.success && result.imageId && result.url) {
        setImages(prev => [...prev, {
          id: result.imageId!,
          url: result.url!,
          is_primary: prev.length === 0,
          display_order: prev.length,
          category: "Property"
        }]);
      } else {
        setError(result.error || "Failed to upload image.");
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (imageId: string) => {
    const result = await deletePgImage(pgId, imageId);
    if (result.success) {
      setImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const result = await setPrimaryImage(pgId, imageId);
    if (result.success) {
      setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
    }
  };

  const handleCategoryChange = async (imageId: string, category: string) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, category } : img));
    await updateImageCategory(pgId, imageId, category);
  };

  if (!pgId) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please start from Step 1 to create a listing.</p>
        <Button onClick={() => router.push(basePath)} className="mt-4 rounded-xl">Go to Step 1</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Property Photos</h1>
        <p className="text-muted-foreground font-medium">Upload real photos of your property. Good photos attract more tenants.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">{error}</div>
      )}

      {/* Upload Area */}
      <div
        className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center hover:bg-muted/30 hover:border-primary/50 transition-all cursor-pointer mb-6"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          {uploading ? "Uploading..." : "Click to upload images"}
        </h3>
        <p className="text-sm text-muted-foreground">JPG, PNG, WEBP • Max 5MB per file</p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {images.map(img => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border shadow-sm aspect-4/3">
              <img src={img.url} alt="PG Photo" className="w-full h-full object-cover" />

              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3" /> Cover
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(img.id)}
                    className="bg-white text-foreground p-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-colors"
                    title="Set as cover"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="bg-white text-destructive p-2 rounded-lg text-xs font-bold hover:bg-destructive hover:text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Category Selector */}
              <div className="absolute bottom-2 left-2 right-2">
                <select
                  value={img.category}
                  onChange={(e) => handleCategoryChange(img.id, e.target.value)}
                  className="w-full bg-black/70 text-white text-xs font-bold rounded-lg px-2 py-1.5 outline-none border border-white/20"
                >
                  <option value="Property">Property</option>
                  <option value="Room">Room</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Common Area">Common Area</option>
                  <option value="Exterior">Exterior</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="bg-muted/30 rounded-2xl p-8 text-center mb-8 border border-border">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium text-sm">No photos uploaded yet.</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`${basePath}/amenities?pgId=${pgId}`)} className="rounded-xl font-bold px-6 h-12">Previous</Button>
        </div>
        <Button onClick={() => router.push(`${basePath}/preview?pgId=${pgId}`)} disabled={uploading} className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
          Continue to Preview
        </Button>
      </div>
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <GalleryContent />
    </Suspense>
  );
}
