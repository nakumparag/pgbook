"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Phone, MapPin, Loader2, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onboardPgOwner } from "@/app/actions/onboard_owner";

interface OwnerOnboardingFormProps {
  initialPhone?: string;
  initialName?: string;
}

export function OwnerOnboardingForm({ initialPhone = "", initialName = "" }: OwnerOnboardingFormProps) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(
    initialName ? `${initialName}'s PG` : ""
  );
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState("Ahmedabad");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("businessName", businessName.trim());
    formData.append("phone", phone.trim());
    formData.append("city", city.trim());

    try {
      const result = await onboardPgOwner(formData);
      if (!result.success) {
        setError(result.error || "Failed to activate owner account. Please try again.");
        setLoading(false);
        return;
      }

      // Smooth redirect to PG Manager
      const target = result.redirectUrl || "/owner/dashboard";
      router.replace(target);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">
            Activate PG Business Manager
          </h2>
          <p className="text-xs text-muted-foreground">
            Takes less than 30 seconds. No new account or logout needed.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-semibold text-foreground">
            PG / Hostel / Organization Name *
          </Label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="businessName"
              name="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Royal Living PG & Hostels"
              required
              className="pl-11 py-5 rounded-xl bg-muted/40"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            This name will be displayed on your invoices and manager reports.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
            Contact Mobile Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              pattern="[0-9]{10}"
              className="pl-11 py-5 rounded-xl bg-muted/40"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-semibold text-foreground">
            Primary Operating City *
          </Label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Ahmedabad"
              required
              className="pl-11 py-5 rounded-xl bg-muted/40"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Optional Public Listing Guarantee</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Every property you add can be managed privately or listed publicly on PGBook. You maintain full control over your inventory and privacy.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full py-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md text-base gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Activating PG Manager...
            </>
          ) : (
            <>
              <span>Activate PG Manager Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
