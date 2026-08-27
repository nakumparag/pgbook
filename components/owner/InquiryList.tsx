"use client";

import { useState } from "react";
import { Phone, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { updateInquiryStatus } from "@/app/actions/owner_inquiries";

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  contact_type: "WHATSAPP" | "CALL" | "CALLBACK";
  preferred_time: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "CLOSED";
  created_at: string;
  pgs: { name: string } | null;
};

export function InquiryList({ inquiries: initialInquiries }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: "CONTACTED" | "CLOSED") => {
    setLoadingId(id);
    const result = await updateInquiryStatus(id, newStatus);
    if (result.success) {
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
    } else {
      alert(result.error);
    }
    setLoadingId(null);
  };

  if (inquiries.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <p className="text-muted-foreground">No customer inquiries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm flex flex-col md:flex-row gap-5 justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-foreground">{inquiry.name}</h3>
              {inquiry.status === "NEW" && (
                <span className="bg-blue-500/10 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  New
                </span>
              )}
              {inquiry.status === "CONTACTED" && (
                <span className="bg-amber-500/10 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Contacted
                </span>
              )}
              {inquiry.status === "CLOSED" && (
                <span className="bg-muted text-muted-foreground text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Closed
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">PG:</span> {inquiry.pgs?.name || "Unknown PG"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Type:</span> 
                {inquiry.contact_type === "WHATSAPP" && <><MessageSquare className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp</>}
                {inquiry.contact_type === "CALL" && <><Phone className="w-3.5 h-3.5 text-primary" /> Call</>}
                {inquiry.contact_type === "CALLBACK" && <><Clock className="w-3.5 h-3.5 text-orange-500" /> Callback Request</>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Phone:</span> {inquiry.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Date:</span> {format(new Date(inquiry.created_at), "PPp")}
              </div>
              {inquiry.preferred_time && (
                <div className="flex items-center gap-1.5 sm:col-span-2">
                  <span className="font-medium">Preferred Time:</span> {inquiry.preferred_time}
                </div>
              )}
            </div>

            {inquiry.message && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-foreground italic">
                "{inquiry.message}"
              </div>
            )}
          </div>

          <div className="flex md:flex-col gap-2 shrink-0 md:w-36 pt-2 border-t md:border-t-0 md:border-l border-border md:pl-5">
            {inquiry.status === "NEW" && (
              <button
                onClick={() => handleStatusUpdate(inquiry.id, "CONTACTED")}
                disabled={loadingId === inquiry.id}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Contacted
              </button>
            )}
            {inquiry.status !== "CLOSED" && (
              <button
                onClick={() => handleStatusUpdate(inquiry.id, "CLOSED")}
                disabled={loadingId === inquiry.id}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-muted text-muted-foreground hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Close
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
