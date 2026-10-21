"use client";

import { useState } from "react";
import { CheckCircle, CircleCheck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { updateInquiryStatus } from "@/app/actions/owner_inquiries";

type InquiryStatus = "NEW" | "CONTACTED" | "INTERESTED" | "CLOSED" | "CANCELLED";
type Inquiry = {
  id: string;
  name: string;
  phone: string | null;
  contact_type: string;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
  pgs: { name: string } | null;
};

const LABELS: Record<InquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
};

export function InquiryList({ inquiries: initialInquiries }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: "CONTACTED" | "INTERESTED" | "CLOSED") => {
    setLoadingId(id);
    const result = await updateInquiryStatus(id, newStatus);
    if (result.success) setInquiries((prev) => prev.map((inquiry) => inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry));
    else window.alert(result.error);
    setLoadingId(null);
  };

  if (!inquiries.length) return <div className="rounded-2xl border border-border bg-card p-8 text-center"><p className="text-muted-foreground">No customer inquiries yet.</p></div>;

  return <div className="space-y-4">{inquiries.map((inquiry) => {
    const actions: Array<"CONTACTED" | "INTERESTED" | "CLOSED"> = inquiry.status === "NEW" ? ["CONTACTED", "INTERESTED", "CLOSED"] : inquiry.status === "CONTACTED" ? ["INTERESTED", "CLOSED"] : inquiry.status === "INTERESTED" ? ["CONTACTED", "CLOSED"] : [];
    return <article key={inquiry.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm md:flex-row">
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold text-foreground">{inquiry.name}</h3><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-primary">{LABELS[inquiry.status]}</span></div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p><span className="font-medium">PG:</span> {inquiry.pgs?.name || "Unknown PG"}</p>
          {inquiry.phone && <p><span className="font-medium">Phone:</span> <a href={`tel:${inquiry.phone}`} className="underline underline-offset-2">{inquiry.phone}</a></p>}
          <p className="sm:col-span-2"><span className="font-medium">Received:</span> {format(new Date(inquiry.created_at), "PPp")}</p>
        </div>
        {inquiry.message && <blockquote className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-foreground">{inquiry.message}</blockquote>}
      </div>
      {actions.length > 0 && <div className="flex flex-wrap gap-2 border-t border-border pt-3 md:w-56 md:flex-col md:border-l md:border-t-0 md:pl-5 md:pt-0">
        {actions.map((status) => <button key={status} onClick={() => handleStatusUpdate(inquiry.id, status)} disabled={loadingId === inquiry.id} className={`inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50 ${status === "CLOSED" ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
          {status === "CLOSED" ? <XCircle className="h-4 w-4" /> : status === "CONTACTED" ? <CheckCircle className="h-4 w-4" /> : <CircleCheck className="h-4 w-4" />}{status === "CLOSED" ? "Close" : `Mark ${LABELS[status]}`}
        </button>)}
      </div>}
    </article>;
  })}</div>;
}
