"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, MessageSquare, Clock, User, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitCallbackInquiry, logContactClick } from "@/app/actions/inquiries";

type View = "OPTIONS" | "CALLBACK_FORM" | "SUCCESS";

interface ContactOwnerModalProps {
  pgId: string;
  ownerId: string;
  pgName: string;
  contactPhone: string | null;
  whatsappNumber: string | null;
  locality: string;
}

export function ContactOwnerModal({
  pgId,
  ownerId,
  pgName,
  contactPhone,
  whatsappNumber,
  locality,
}: ContactOwnerModalProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("OPTIONS");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWhatsApp = async () => {
    if (!whatsappNumber) return;
    await logContactClick(pgId, ownerId, "WHATSAPP");
    const message = `Hi, I am interested in ${pgName} in ${locality}. I would like to know more about availability and visit options.`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCall = async () => {
    if (!contactPhone) return;
    await logContactClick(pgId, ownerId, "CALL");
    window.location.href = `tel:${contactPhone}`;
  };

  const handleCallbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("pg_id", pgId);
    formData.append("owner_id", ownerId);

    const result = await submitCallbackInquiry(formData);

    setIsSubmitting(false);

    if (result.success) {
      setView("SUCCESS");
      setTimeout(() => {
        setOpen(false);
        setTimeout(() => setView("OPTIONS"), 300);
      }, 3000);
    } else {
      setError(result.error || "Failed to submit request.");
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setView("OPTIONS");
        setError(null);
      }, 300);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="btn btn-outline w-full py-4 text-lg border-2 mt-3">
          Contact Owner
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 md:p-8 z-50 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {view === "CALLBACK_FORM" && (
                      <button
                        onClick={() => setView("OPTIONS")}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                    <Dialog.Title className="text-2xl font-bold font-poppins">
                      {view === "CALLBACK_FORM" ? "Request Callback" : "Contact Owner"}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {view === "OPTIONS" && (
                  <div className="space-y-4">
                    <Dialog.Description className="text-muted-foreground mb-4">
                      How would you like to connect with the owner of <span className="font-semibold text-foreground">{pgName}</span>?
                    </Dialog.Description>

                    <button
                      onClick={handleWhatsApp}
                      disabled={!whatsappNumber}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground group-hover:text-[#25D366] transition-colors">WhatsApp</p>
                          <p className="text-sm text-muted-foreground">
                            {whatsappNumber ? "Chat directly on WhatsApp" : "Unavailable"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#25D366]" />
                    </button>

                    <button
                      onClick={handleCall}
                      disabled={!contactPhone}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Call</p>
                          <p className="text-sm text-muted-foreground">
                            {contactPhone ? "Call the owner directly" : "Unavailable"}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </button>

                    <button
                      onClick={() => setView("CALLBACK_FORM")}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-foreground hover:bg-muted transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-foreground/5 text-foreground flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-foreground">Request Callback</p>
                          <p className="text-sm text-muted-foreground">Owner will call you back</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                )}

                {view === "CALLBACK_FORM" && (
                  <form onSubmit={handleCallbackSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium border border-danger/20">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground ml-1">Your Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="text" name="name" required placeholder="John Doe" className="input pl-10 w-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground ml-1">Phone Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="tel" name="phone" required placeholder="+91 98765 43210" className="input pl-10 w-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground ml-1">Preferred Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select name="preferred_time" required className="input pl-10 w-full bg-background">
                          <option value="">Select a time slot</option>
                          <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                          <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                          <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                          <option value="Anytime">Anytime</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground ml-1">Message (Optional)</label>
                      <textarea 
                        name="message" 
                        placeholder="Any specific questions before they call?" 
                        className="input w-full min-h-[80px] p-3 resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="btn btn-primary w-full mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Submitting..." : "Request Callback"}
                    </button>
                  </form>
                )}

                {view === "SUCCESS" && (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="text-2xl font-bold font-poppins mb-2">Request Submitted!</h3>
                    <p className="text-muted-foreground">
                      We&apos;ve sent your callback request to the owner. They will reach out to you shortly.
                    </p>
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
