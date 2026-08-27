"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, FileText } from "lucide-react";
import { updateOwnerVerification } from "@/app/actions/onboarding";

function VerificationContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ownerType, setOwnerType] = useState("PG Owner");
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [existingDocUrl, setExistingDocUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/become-owner");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
        setOwnerType(profile.owner_type || "PG Owner");
        setIdType(profile.id_type || "Aadhaar");
        setIdNumber(profile.id_number || "");
        setExistingDocUrl(profile.id_document_url || null);
        setVerificationStatus(profile.verification_status || "PENDING");
      }
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (!idNumber.trim()) return "ID number is required.";
    if (!idFile && !existingDocUrl) return "ID document upload is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }
    
    setError(null);
    setSaving(true);
    
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("phone", phone);
    formData.append("ownerType", ownerType);
    formData.append("idType", idType);
    formData.append("idNumber", idNumber);
    if (idFile) {
      formData.append("idDocument", idFile);
    }

    const result = await updateOwnerVerification(formData);
    setSaving(false);

    if (result.success) {
      router.push("/become-owner/rooms");
    } else {
      setError(result.error || "Failed to update verification details.");
    }
  };

  if (loading) return <div className="animate-pulse bg-muted rounded-2xl h-96" />;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight mb-2">Owner Verification</h1>
        <p className="text-muted-foreground font-medium">Please provide your details to verify your identity.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium text-sm">
          {error}
        </div>
      )}

      {verificationStatus === "APPROVED" && (
        <div className="p-4 mb-6 rounded-xl bg-success/10 text-success border border-success/20 font-medium text-sm">
          Your profile is already verified! You can proceed to listing properties.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name *</label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="h-12 rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number *</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} required className="h-12 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Owner Type *</label>
            <select
              value={ownerType}
              onChange={e => setOwnerType(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 text-sm"
            >
              <option value="PG Owner">PG Owner</option>
              <option value="Property Owner">Property Owner</option>
              <option value="Broker/Agent">Broker/Agent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Govt ID Type *</label>
            <select
              value={idType}
              onChange={e => setIdType(e.target.value)}
              className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 text-sm"
            >
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Driving License">Driving License</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">ID Number *</label>
          <Input value={idNumber} onChange={e => setIdNumber(e.target.value)} required className="h-12 rounded-xl" placeholder={`Enter ${idType} number`} />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Upload ID Document *</label>
          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,image/*" 
              className="hidden"
              onChange={e => {
                if (e.target.files?.[0]) setIdFile(e.target.files[0]);
              }}
            />
            {idFile ? (
              <div className="flex flex-col items-center">
                <FileText className="w-10 h-10 text-primary mb-3" />
                <p className="font-bold text-foreground">{idFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
              </div>
            ) : existingDocUrl ? (
               <div className="flex flex-col items-center">
                <FileText className="w-10 h-10 text-success mb-3" />
                <p className="font-bold text-foreground">Document Already Uploaded</p>
                <p className="text-xs text-muted-foreground mt-1">Click to upload a new one to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-bold text-foreground">Click to upload document</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 5MB</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-6 border-t border-border flex justify-end">
          <Button type="submit" disabled={saving} size="lg" className="rounded-xl font-bold px-8 h-12 bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
        </div>
      </form>
    </>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <VerificationContent />
    </Suspense>
  );
}
