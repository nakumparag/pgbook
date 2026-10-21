"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, Loader2, MessageSquare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { submitInquiry } from "@/app/actions/inquiries";

interface ContactOwnerModalProps {
  pgId: string;
  pgName: string;
  returnTo: string;
}

export function ContactOwnerModal({ pgId, pgName, returnTo }: ContactOwnerModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const result = await submitInquiry(pgId, message);
    setIsSubmitting(false);
    if (result.success) {
      setSent(true);
      setMessage("");
    } else if (result.loginRequired) {
      setError(`Sign in before sending an inquiry. ${loginHref}`);
    } else if (result.profileRequired) {
      setError(`Add your phone number in your profile, then try again. /profile`);
    } else {
      setError(result.error);
    }
  };

  const close = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setError(null);
        setSent(false);
      }, 250);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={close}>
      <Dialog.Trigger asChild>
        <button className="btn btn-outline mt-3 w-full border-2 py-4 text-lg">Contact Owner</button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl md:p-8"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-2xl font-bold">Ask about this PG</Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">Send a private inquiry to {pgName}. This does not book a room.</Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
                  </Dialog.Close>
                </div>

                {sent ? (
                  <div role="status" className="space-y-3 rounded-2xl border border-success/20 bg-success/5 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-9 w-9 text-success" aria-hidden="true" />
                    <p className="font-semibold">Inquiry sent</p>
                    <p className="text-sm text-muted-foreground">You can follow its status from your dashboard.</p>
                    <Link href="/dashboard" className="inline-flex font-semibold text-primary hover:underline">View my inquiries</Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                        {error.startsWith("Sign in") ? <>{error.split(" ").slice(0, 6).join(" ")} <Link href={loginHref} className="font-semibold underline">Log in</Link></> : error.startsWith("Add your phone") ? <>Add your phone number in your <Link href="/profile" className="font-semibold underline">profile</Link>, then try again.</> : error}
                      </div>
                    )}
                    <label htmlFor="inquiry-message" className="block text-sm font-semibold">Your question</label>
                    <textarea
                      id="inquiry-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={5}
                      placeholder="Ask about availability, room options, or the property…"
                      className="input w-full resize-y p-3"
                    />
                    <p className="text-xs text-muted-foreground">Your profile name and phone number will be shared with this PG owner so they can respond.</p>
                    <button type="submit" disabled={isSubmitting} className="btn btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60">
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MessageSquare className="h-4 w-4" aria-hidden="true" />}
                      {isSubmitting ? "Sending…" : "Send inquiry"}
                    </button>
                  </form>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
