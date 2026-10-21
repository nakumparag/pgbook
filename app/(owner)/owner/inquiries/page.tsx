import { createClient } from "@/lib/supabase/server";
import { InquiryList } from "@/components/owner/InquiryList";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function OwnerInquiriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch inquiries for the owner
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select(`
      id, name, phone, contact_type, message, status, created_at,
      pgs ( name )
    `)
    .eq("owner_id", user?.id || "")
    .order("created_at", { ascending: false });

  return (
    <div className="container-custom py-10">
      <div className="mb-8">
        <Link 
          href="/owner/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-4xl font-heading font-black mb-2 text-foreground tracking-tight">Customer Inquiries</h1>
        <p className="text-muted-foreground font-medium text-lg">Manage all contact requests and inquiries for your properties.</p>
      </div>

      <div className="max-w-5xl">
        <InquiryList inquiries={(inquiries as any) || []} />
      </div>
    </div>
  );
}
