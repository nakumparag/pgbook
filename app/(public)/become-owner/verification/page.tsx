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

  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

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
      }

      const { data: ownerProfile } = await supabase.from("owner_profiles").select("*").eq("user_id", user.id).single();
      if (ownerProfile) {
        setOwnerType(ownerProfile.owner_type || "PG Owner");
        setIdType(ownerProfile.id_type || "Aadhaar");
        setIdNumber(ownerProfile.id_number || "");
        setExistingDocUrl(ownerProfile.id_document_url || null);
        setVerificationStatus(ownerProfile.status || "PENDING");

        if (ownerProfile.status === "REJECTED") {
          const { data: request } = await supabase
            .from("approval_requests")
            .select("admin_notes")
            .eq("owner_id", user.id)
            .eq("request_type", "OWNER")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (request?.admin_notes) {
            setRejectionReason(request.admin_notes);
          }
        }
      } else {
        setVerificationStatus("UNSUBMITTED");
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
      setVerificationStatus("PENDING");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(result.error || "Failed to update verification details.");
    }
  };

  if (loading) return <div className="animate-pulse bg-muted rounded-[24px] max-w-3xl mx-auto h-96 mt-8" />;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 mt-8 mb-16">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight mb-2">Owner Verification</h1>
        <p className="text-muted-foreground font-medium text-sm md:text-base">Please provide your details to verify your identity.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-[16px] bg-destructive/10 text-destructive border border-destructive/20 font-semibold text-sm">
          {error}
        </div>
      )}

      {verificationStatus === "APPROVED" && (
        <div className="p-4 mb-6 rounded-[16px] bg-success/10 text-success border border-success/20 font-semibold text-sm">
          Your profile is already verified! You can proceed to listing properties.
        </div>
      )}

      {verificationStatus === "PENDING" && (
        <div className="p-4 mb-6 rounded-[16px] bg-warning/10 text-warning border border-warning/20 font-semibold text-sm">
          Your verification is under review by an admin. We will notify you once it is approved.
        </div>
      )}

      {verificationStatus === "REJECTED" && (
        <div className="p-4 mb-6 rounded-[16px] bg-destructive/10 text-destructive border border-destructive/20 font-semibold text-sm">
          <p className="mb-2">Verification rejected by admin.</p>
          {rejectionReason && <p className="font-normal mb-2 text-foreground">Reason: {rejectionReason}</p>}
          <p className="font-normal text-xs opacity-80">Please correct the information and resubmit the form below.</p>
        </div>
      )}

      {(verificationStatus === "UNSUBMITTED" || verificationStatus === "REJECTED") && (

      <form onSubmit={handleSubmit} className="bg-card rounded-[24px] p-6 md:p-10 border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name <span className="text-destructive">*</span></label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} required className="h-14 rounded-[16px] font-medium px-4 bg-muted/30 focus:bg-background transition-colors" placeholder="Legal Name" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Phone Number <span className="text-destructive">*</span></label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} required className="h-14 rounded-[16px] font-medium px-4 bg-muted/30 focus:bg-background transition-colors" placeholder="10-digit mobile number" maxLength={10} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Owner Type <span className="text-destructive">*</span></label>
            <select
              value={ownerType}
              onChange={e => setOwnerType(e.target.value)}
              className="flex h-14 w-full rounded-[16px] border border-border bg-muted/30 focus:bg-background px-4 font-medium text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="PG Owner">PG Owner</option>
              <option value="Property Owner">Property Owner</option>
              <option value="Broker/Agent">Broker/Agent</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Govt ID Type <span className="text-destructive">*</span></label>
            <select
              value={idType}
              onChange={e => {
                setIdType(e.target.value);
                setIdNumber(""); // Reset when changing type
              }}
              className="flex h-14 w-full rounded-[16px] border border-border bg-muted/30 focus:bg-background px-4 font-medium text-sm transition-colors outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN Card</option>
              <option value="Voter ID">Voter ID</option>
              <option value="Driving License">Driving License</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">ID Number <span className="text-destructive">*</span></label>
          <Input 
            value={idNumber} 
            onChange={e => setIdNumber(e.target.value)} 
            required 
            className="h-14 rounded-[16px] font-medium px-4 bg-muted/30 focus:bg-background transition-colors" 
            placeholder={`Enter your ${idType} number`} 
            maxLength={idType === "Aadhaar" ? 12 : idType === "PAN" ? 10 : 20}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Upload ID Document <span className="text-destructive">*</span></label>
          <div 
            className="border-2 border-dashed border-border/60 rounded-[20px] p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/40 transition-all bg-muted/10 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,image/jpeg,image/png,image/webp" 
              className="hidden"
              onChange={e => {
                if (e.target.files?.[0]) setIdFile(e.target.files[0]);
              }}
            />
            {idFile ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-bold text-foreground text-lg">{idFile.name}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  {(idFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                </p>
              </div>
            ) : existingDocUrl ? (
               <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success">
                  <FileText className="w-8 h-8" />
                </div>
                <p className="font-bold text-foreground text-lg">Document Uploaded</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Click to upload a new one to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-bold text-foreground text-lg">Click to browse or drag & drop</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">PDF, JPG, or PNG (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-medium md:max-w-xs text-center md:text-left">
            Your document is encrypted and stored securely. It will not be visible publicly.
          </p>
          <Button type="submit" disabled={saving} size="lg" className="w-full md:w-auto rounded-[16px] font-bold px-10 h-14 gradient-primary hover:opacity-90 transition-opacity shadow-lg text-white">
            {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
            {saving ? "Saving Details..." : "Save & Continue"}
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="animate-pulse bg-muted rounded-2xl h-96" />}>
      <VerificationContent />
    </Suspense>
  );
}
