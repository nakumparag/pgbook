"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar as CalendarIcon, Clock, User, Phone, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BookingModal({ pgName }: { pgName: string }) {
  const [open, setOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setTimeout(() => setIsSuccess(false), 300); // reset after close animation
    }, 2500);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="btn btn-primary w-full py-4 text-lg">
          Book a Free Visit
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
                {!isSuccess ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <Dialog.Title className="text-2xl font-bold font-poppins">
                        Schedule Visit
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </Dialog.Close>
                    </div>
                    
                    <Dialog.Description className="text-muted-foreground mb-8">
                      You&apos;re booking a visit for <span className="font-semibold text-foreground">{pgName}</span>. The owner will contact you to confirm.
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Your Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="text" required placeholder="John Doe" className="input pl-10" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input type="tel" required placeholder="+91 98765 43210" className="input pl-10" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground ml-1">Date</label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="date" required className="input pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground ml-1">Time</label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input type="time" required className="input pl-10" />
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-full mt-4">
                        Confirm Booking
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-success" />
                    </div>
                    <h3 className="text-2xl font-bold font-poppins mb-2">Visit Scheduled!</h3>
                    <p className="text-muted-foreground">
                      We&apos;ve notified the owner. They will contact you shortly to confirm the exact timing.
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
