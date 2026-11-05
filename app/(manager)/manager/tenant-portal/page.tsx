import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { Home, BedDouble, Calendar, CreditCard, Wrench, Bell, ArrowRight, ShieldCheck, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TenantPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/manager/login?next=/manager/tenant-portal");
  }

  // Look up tenant record by user_id or email or phone
  const { data: tenant } = await supabase
    .from("tenants")
    .select(`
      *,
      pgs ( id, name, address, wifi_ssid, wifi_password, rules, checkin_time, checkout_time ),
      rooms ( id, room_number, room_type ),
      beds ( id, bed_number )
    `)
    .or(`user_id.eq.${user.id},email.eq.${user.email || ""}`)
    .order("created_at", { ascending: false })
    .maybeSingle();

  // Fetch invoices for this tenant
  let invoices: any[] = [];
  let payments: any[] = [];
  let notices: any[] = [];
  let complaints: any[] = [];

  if (tenant) {
    const { data: invs } = await supabase
      .from("rent_invoices")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });
    invoices = invs || [];

    const { data: pays } = await supabase
      .from("payments")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("payment_date", { ascending: false });
    payments = pays || [];

    const { data: nots } = await supabase
      .from("notices")
      .select("*")
      .or(`pg_id.eq.${tenant.pg_id},pg_id.is.null`)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);
    notices = nots || [];

    const { data: reqs } = await supabase
      .from("maintenance_requests")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false });
    complaints = reqs || [];
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-muted/20 p-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-2xl bg-card border border-border text-center space-y-4">
          <Home className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold">No Active Resident Record Found</h2>
          <p className="text-xs text-muted-foreground">
            Your account ({user.email}) is not currently linked to an active PG bed allocation.
            Please ask your PG manager to onboard your email or mobile phone.
          </p>
          <Button asChild className="rounded-xl font-bold">
            <Link href="/manager">Back to PG Manager</Link>
          </Button>
        </div>
      </div>
    );
  }

  const latestInvoice = invoices[0];
  const pendingAmount = invoices.reduce((s, i) => s + (i.balance_due || 0), 0);

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-20 h-16 border-b border-border bg-background px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading font-black text-base text-foreground">Resident Portal</h1>
            <p className="text-[10px] text-muted-foreground font-semibold">{tenant.full_name}</p>
          </div>
        </div>

        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-semibold">
          <Link href="/manager">PG Manager Home</Link>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Room & Stay Overview Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 rounded-full border-emerald-300 text-emerald-700 bg-emerald-50 mb-1">
              Active Resident
            </Badge>
            <h2 className="text-2xl font-black font-heading text-foreground">{tenant.pgs?.name}</h2>
            <p className="text-xs text-muted-foreground">{tenant.pgs?.address}</p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
              <span>Bed: <strong className="text-foreground">{tenant.beds?.bed_number || "Allocated"}</strong></span>
              <span>•</span>
              <span>Move-In: <strong className="text-foreground">{formatDate(tenant.move_in_date)}</strong></span>
              <span>•</span>
              <span>Rent Due Day: <strong className="text-foreground">{tenant.rent_due_day}th of month</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border text-right shrink-0">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Monthly Rent</span>
            <p className="text-2xl font-black text-foreground font-heading">{formatCurrency(tenant.monthly_rent)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Security Deposit Held: {formatCurrency(tenant.security_deposit)}
            </p>
          </div>
        </div>

        {/* WiFi & Rules Strip */}
        {(tenant.pgs?.wifi_ssid || tenant.pgs?.rules) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenant.pgs?.wifi_ssid && (
              <div className="p-4 rounded-2xl bg-card border border-border text-xs space-y-1">
                <p className="font-bold text-foreground">📶 High-Speed Resident WiFi</p>
                <p className="text-muted-foreground">SSID: <strong className="text-foreground">{tenant.pgs.wifi_ssid}</strong></p>
                {tenant.pgs.wifi_password && (
                  <p className="text-muted-foreground">Password: <strong className="text-foreground font-mono">{tenant.pgs.wifi_password}</strong></p>
                )}
              </div>
            )}
            {tenant.pgs?.rules && (
              <div className="p-4 rounded-2xl bg-card border border-border text-xs space-y-1">
                <p className="font-bold text-foreground">📋 House Guidelines</p>
                <p className="text-muted-foreground line-clamp-2">{tenant.pgs.rules}</p>
              </div>
            )}
          </div>
        )}

        {/* Invoices & Payment Ledger */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-foreground">Rent Invoices & Receipts</h3>
              <p className="text-xs text-muted-foreground">Track billing history and verified payment receipts</p>
            </div>
            {pendingAmount > 0 && (
              <Badge variant="outline" className="text-xs font-extrabold text-rose-600 border-rose-300 bg-rose-50">
                Pending Due: {formatCurrency(pendingAmount)}
              </Badge>
            )}
          </div>

          {invoices.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No invoices issued yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 uppercase font-semibold text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Cycle</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-3 px-3 font-mono font-semibold">{inv.invoice_number}</td>
                      <td className="py-3 px-3">{inv.month_year}</td>
                      <td className="py-3 px-3 font-bold">{formatCurrency(inv.total_amount)}</td>
                      <td className="py-3 px-3 text-muted-foreground">{formatDate(inv.due_date)}</td>
                      <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Notice Board */}
        {notices.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-lg text-foreground flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Property Notice Board
            </h3>
            <div className="divide-y divide-border/40 text-xs">
              {notices.map((n) => (
                <div key={n.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground text-sm">{n.title}</p>
                    <span className="text-[10px] text-muted-foreground">{formatDate(n.created_at)}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
