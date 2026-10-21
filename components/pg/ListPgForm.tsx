"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Phone, 
  Check, 
  Loader2, 
  Upload, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitBasicPg } from "@/app/actions/basic-pg";
import { createClient } from "@/lib/supabase/client";

interface CityOption {
  id: string;
  name: string;
}

interface LocalityOption {
  id: string;
  name: string;
  city_id: string;
}

const DEFAULT_CITIES: CityOption[] = [
  { id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Ahmedabad" },
  { id: "b7174f88-62ba-415d-8f46-77127932ef8e", name: "Gandhinagar" },
  { id: "3d363d62-34c7-47ef-8d64-5231f092c575", name: "Surat" },
  { id: "4944977d-ec28-4985-b2a4-5986f23821fb", name: "Vadodara" },
  { id: "4a5743ee-eb8c-4191-986f-aed4293dbb90", name: "Rajkot" },
];

const DEFAULT_LOCALITIES: LocalityOption[] = [
  { id: "7a82d838-61b6-4a24-ae5c-87c42878bf5a", city_id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Sola" },
  { id: "3441cba7-4504-41da-af51-6a9d65025ad5", city_id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Satellite" },
  { id: "bc20c03d-a50a-4b71-8a27-033d0ded565a", city_id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Navrangpura" },
  { id: "3c6aa917-02fe-4c29-8af4-81bf0ccee93e", city_id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Vastrapur" },
  { id: "876bfa7f-fe93-42ae-bcae-4b9686d27e88", city_id: "ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929", name: "Prahlad Nagar" },
  { id: "781d5a9a-3f79-4209-880f-90136dc1a97a", city_id: "b7174f88-62ba-415d-8f46-77127932ef8e", name: "Infocity" },
  { id: "eb7eaa5c-a105-4ae1-ab87-16455198b968", city_id: "b7174f88-62ba-415d-8f46-77127932ef8e", name: "Kudasan" },
  { id: "0e5d3b12-6582-486f-a9d5-2b8a9ba799da", city_id: "3d363d62-34c7-47ef-8d64-5231f092c575", name: "Adajan" },
  { id: "eab3e455-45f9-43ea-a0de-d6fdbf224fed", city_id: "3d363d62-34c7-47ef-8d64-5231f092c575", name: "Vesu" },
  { id: "82f6f446-e616-40e4-ad24-84efe9c72b9b", city_id: "4944977d-ec28-4985-b2a4-5986f23821fb", name: "Alkapuri" },
  { id: "fa263f3f-fd30-4281-91f0-65aec7b2c5e0", city_id: "4944977d-ec28-4985-b2a4-5986f23821fb", name: "Sayajigunj" },
  { id: "4f33d76c-9225-4a74-8897-2a58261c277c", city_id: "4a5743ee-eb8c-4191-986f-aed4293dbb90", name: "Kalawad Road" },
];

const ROOM_TYPES = [
  { value: "Single", label: "Single" },
  { value: "2 Sharing", label: "2 Sharing" },
  { value: "3 Sharing", label: "3 Sharing" },
  { value: "4 Sharing", label: "4 Sharing" },
  { value: "Other", label: "Other" }
];

const AMENITIES_LIST = [
  "WiFi",
  "AC",
  "Parking",
  "Laundry",
  "Washing Machine",
  "CCTV",
  "Power Backup",
  "Attached Bathroom",
  "Other"
];

export default function ListPgForm() {
  const router = useRouter();
  const supabase = createClient();

  // Authentication check
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Location data
  const [cities, setCities] = useState<CityOption[]>(DEFAULT_CITIES);
  const [localities, setLocalities] = useState<LocalityOption[]>(DEFAULT_LOCALITIES);
  const [cityId, setCityId] = useState<string>("ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929"); // Ahmedabad
  const [localityId, setLocalityId] = useState<string>("7a82d838-61b6-4a24-ae5c-87c42878bf5a"); // Sola

  // Form states
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [rent, setRent] = useState("");
  const [roomType, setRoomType] = useState("Single");
  const [foodAvailable, setFoodAvailable] = useState<"Yes" | "No">("Yes");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "WiFi",
    "CCTV",
    "Power Backup"
  ]);
  const [contactPhone, setContactPhone] = useState("");
  
  // Photos state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdPgSlug, setCreatedPgSlug] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkAuthAndLoadLocations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Redirect logged-out users to login, and return them back here
        router.replace("/login?next=/become-owner");
        return;
      }
      setUser(user);
      if (user.user_metadata?.phone) {
        setContactPhone(user.user_metadata.phone.replace(/\D/g, ""));
      }
      setCheckingAuth(false);

      // Load latest cities and localities from database
      try {
        const { data: dbCities } = await supabase
          .from("cities")
          .select("id, name")
          .eq("is_active", true)
          .order("name");
        if (dbCities && dbCities.length > 0) {
          setCities(dbCities);
        }

        const { data: dbLocs } = await supabase
          .from("localities")
          .select("id, name, city_id")
          .order("name");
        if (dbLocs && dbLocs.length > 0) {
          setLocalities(dbLocs);
        }
      } catch {
        // Fallback to DEFAULT_CITIES and DEFAULT_LOCALITIES is preserved
      }
    }
    checkAuthAndLoadLocations();
  }, [router, supabase]);

  // Available localities for currently selected city
  const availableLocalities = localities.filter((l) => l.city_id === cityId);

  // Sync locality when city changes if current locality is not in the city
  const handleCityChange = (newCityId: string) => {
    setCityId(newCityId);
    const validLocs = localities.filter((l) => l.city_id === newCityId);
    if (validLocs.length > 0) {
      setLocalityId(validLocs[0].id);
    }
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Max 5 photos
    const totalAllowed = 5 - photos.length;
    if (totalAllowed <= 0) return;

    const newFiles = files.slice(0, totalAllowed);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setPhotos((prev) => [...prev, ...newFiles]);
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const parsedRent = parseInt(rent, 10);
    const cleanPhone = contactPhone.replace(/\D/g, "");

    const selectedCity = cities.find((c) => c.id === cityId);
    const selectedLocality = localities.find((l) => l.id === localityId);

    // Validation
    if (!trimmedName || trimmedName.length < 3) {
      setError("Please enter a valid PG Name (at least 3 characters).");
      return;
    }
    if (!cityId) {
      setError("Please select a City.");
      return;
    }
    if (!localityId) {
      setError("Please select an Area / Locality.");
      return;
    }
    if (!trimmedAddress) {
      setError("Please provide the Full Address.");
      return;
    }
    if (isNaN(parsedRent) || parsedRent <= 0) {
      setError("Please enter a valid monthly rent amount.");
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("cityId", cityId);
      formData.append("localityId", localityId);
      formData.append("cityName", selectedCity?.name || "Ahmedabad");
      formData.append("localityName", selectedLocality?.name || "Sola");
      formData.append("address", trimmedAddress);
      formData.append("rent", parsedRent.toString());
      formData.append("roomType", roomType);
      formData.append("foodAvailable", foodAvailable);
      formData.append("description", description.trim());
      formData.append("amenities", JSON.stringify(selectedAmenities));
      formData.append("contactPhone", cleanPhone);

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await submitBasicPg(formData);

      if (!res.success) {
        setError(res.error || "Failed to submit PG. Please try again.");
        return;
      }

      setIsSuccess(true);
      setCreatedPgSlug(res.slug || null);
    } catch {
      setError("An unexpected error occurred. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Checking authorization...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-card rounded-3xl p-8 md:p-12 border border-border shadow-xl text-center max-w-xl mx-auto my-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-heading font-black text-foreground mb-3">
          Your PG has been submitted successfully.
        </h2>
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          Thank you for submitting your property. It is <span className="font-bold text-foreground">pending admin review</span> and will appear in Explore after approval.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-xl py-6 font-bold text-base">
            <Link href="/explore">
              Explore All PGs <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-xl py-6 font-semibold text-base border-2"
            onClick={() => {
              setIsSuccess(false);
              setName("");
              setCityId("ccf6b6af-2d4d-45d7-a7e7-0ffbcbb5f929");
              setLocalityId("7a82d838-61b6-4a24-ae5c-87c42878bf5a");
              setAddress("");
              setRent("");
              setDescription("");
              setPhotos([]);
              setPhotoPreviews([]);
            }}
          >
            List Another PG
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-xl my-4">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <Building2 className="w-3.5 h-3.5" /> For Owners & Landlords
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-foreground tracking-tight">
          List Your PG
        </h1>
        <p className="text-muted-foreground text-base mt-2">
          Add your PG details for review. If approved, people can contact you directly.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-destructive/10 text-destructive rounded-2xl text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} method="POST" action="#" className="space-y-8">
        
        {/* 1. PG Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>PG Name <span className="text-destructive">*</span></span>
          </label>
          <Input 
            type="text"
            required
            placeholder="e.g. Sunrise PG, Green Valley Living"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="py-6 rounded-xl bg-muted/40 focus-visible:bg-transparent text-base"
          />
        </div>

        {/* 2 & 3. City & Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">
              City <span className="text-destructive">*</span>
            </label>
            <select
              value={cityId}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-muted/40 focus-visible:bg-transparent border border-border font-medium text-foreground outline-none text-base cursor-pointer"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">
              Area / Locality <span className="text-destructive">*</span>
            </label>
            <select
              value={localityId}
              onChange={(e) => setLocalityId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-muted/40 focus-visible:bg-transparent border border-border font-medium text-foreground outline-none text-base cursor-pointer"
            >
              {availableLocalities.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Full Address */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">
            Full Address <span className="text-destructive">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Complete building number, street, landmark, pincode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/40 focus-visible:bg-transparent border border-border text-foreground outline-none text-sm placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 5. Monthly Rent */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">
            Monthly Rent (₹) <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="number"
              min={500}
              max={150000}
              required
              placeholder="e.g. 6000"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="pl-11 py-6 rounded-xl bg-muted/40 focus-visible:bg-transparent text-base font-semibold"
            />
          </div>
        </div>

        {/* 6. Room Type */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">
            Room Type <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {ROOM_TYPES.map((rt) => {
              const isSelected = roomType === rt.value;
              return (
                <button
                  type="button"
                  key={rt.value}
                  onClick={() => setRoomType(rt.value)}
                  className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all text-center ${
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-muted/40 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {rt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Food Available */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">
            Food Available
          </label>
          <div className="flex gap-4">
            {(["Yes", "No"] as const).map((choice) => {
              const isSelected = foodAvailable === choice;
              return (
                <button
                  type="button"
                  key={choice}
                  onClick={() => setFoodAvailable(choice)}
                  className={`flex-1 py-3 px-6 rounded-xl border font-bold text-sm transition-all ${
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                      : "bg-muted/40 text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {choice === "Yes" ? "Yes (Food Provided)" : "No (Without Food)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Comfortable PG accommodation with basic facilities for students and working professionals..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted/40 focus-visible:bg-transparent border border-border text-foreground outline-none text-sm placeholder:text-muted-foreground resize-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 9. Amenities */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">
            Amenities
          </label>
          <div className="flex flex-wrap gap-2.5">
            {AMENITIES_LIST.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted/40 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                    isSelected ? "bg-white text-primary" : "border border-muted-foreground/40"
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10. PG Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground">
              PG Photos
            </label>
            <span className="text-xs text-muted-foreground">Up to 5 photos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border group bg-muted">
                <img src={preview} alt="PG Photo Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {photos.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/60 transition-all flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">Upload Photo</span>
              </button>
            )}
          </div>

          <input 
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            className="hidden"
          />
        </div>

        {/* 11. Contact Phone Number */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground">
            Contact Phone Number <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground font-semibold text-sm">
              <Phone className="w-4 h-4 mr-0.5" /> +91
            </div>
            <Input 
              type="tel"
              required
              maxLength={10}
              placeholder="9876543210"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
              className="pl-20 py-6 rounded-xl bg-muted/40 focus-visible:bg-transparent text-base font-semibold"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Prospective tenants will call or WhatsApp this number for inquiries.
          </p>
        </div>

        {/* 12. Submit PG Button */}
        <div className="pt-4 border-t border-border">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full py-6 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting PG...
              </>
            ) : (
              "Submit PG"
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
