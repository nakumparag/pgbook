import Link from "next/link";
import { ArrowRight, KeyRound, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="container-custom max-w-3xl py-12 md:py-20">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-heading font-black mb-4 text-foreground">Contact</h1>
        <p className="text-lg text-muted-foreground">
          Choose the right place to get help with PGBook.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Ask about a PG</h2>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            Open a listing and contact its owner directly by phone or WhatsApp. PGBook does not take bookings or payments.
          </p>
          <Button asChild className="w-full rounded-xl">
            <Link href="/explore">Explore PGs <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <KeyRound className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Account access</h2>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            Reset a forgotten password from the sign-in page. For identity or listing review, sign in and check your dashboard status.
          </p>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/forgot-password">Reset password <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </section>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Privacy and legal contact email is not configured yet. Please set a support email before inviting users to send account or privacy requests.
      </p>
    </div>
  );
}
