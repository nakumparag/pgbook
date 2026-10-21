import Link from "next/link";
import { adminUpdateInquiryStatus } from "@/app/actions/admin_inquiries";
import { createClient } from "@/lib/supabase/server";

type Search = Record<string, string | string[] | undefined>;
const STATUSES = ["NEW", "CONTACTED", "INTERESTED", "CLOSED", "CANCELLED"] as const;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: cities } = await supabase.from("cities").select("id,name").order("name");
  const { data: pgs } = await supabase.from("pgs").select("id,name,city_id").order("name").limit(500);
  const { data: owners } = await supabase.from("profiles").select("id,full_name").eq("role", "OWNER").order("full_name").limit(500);

  let inquiryQuery = supabase.from("inquiries").select(`
    id, pg_id, owner_id, user_id, name, phone, message, status, created_at,
    pgs!inner ( id, name, city_id, cities(name) ),
    owner:profiles!owner_id ( full_name )
  `).order("created_at", { ascending: false }).limit(500);
  const statusFilter = one(filters.status);
  const pgFilter = one(filters.pg);
  const ownerFilter = one(filters.owner);
  const cityFilter = one(filters.city);
  const fromDate = one(filters.from);
  const toDate = one(filters.to);
  if (STATUSES.includes(statusFilter as typeof STATUSES[number])) inquiryQuery = inquiryQuery.eq("status", statusFilter as typeof STATUSES[number]);
  if (pgFilter) inquiryQuery = inquiryQuery.eq("pg_id", pgFilter);
  if (ownerFilter) inquiryQuery = inquiryQuery.eq("owner_id", ownerFilter);
  if (cityFilter) inquiryQuery = inquiryQuery.eq("pgs.city_id", cityFilter);
  if (fromDate) inquiryQuery = inquiryQuery.gte("created_at", `${fromDate}T00:00:00.000Z`);
  if (toDate) inquiryQuery = inquiryQuery.lte("created_at", `${toDate}T23:59:59.999Z`);

  const [{ data: inquiries }, ...counts] = await Promise.all([
    inquiryQuery,
    ...STATUSES.map((status) => supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", status as typeof STATUSES[number])),
  ]);
  const countByStatus = Object.fromEntries(STATUSES.map((status, index) => [status, counts[index].count || 0]));

  return <div className="container-custom space-y-8 py-10">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline">← Admin dashboard</Link><h1 className="mt-3 text-3xl font-heading font-black">Platform inquiries</h1><p className="mt-1 text-muted-foreground">All user questions sent to PG owners. These are not bookings.</p></div></header>
    <section className="grid grid-cols-2 gap-3 md:grid-cols-5">{STATUSES.map((status) => <div key={status} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">{status.toLowerCase()}</p><p className="mt-1 text-2xl font-black">{countByStatus[status]}</p></div>)}</section>
    <form method="get" className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Status<select name="status" defaultValue={statusFilter} className="input"><option value="">All statuses</option>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">City<select name="city" defaultValue={cityFilter} className="input"><option value="">All cities</option>{(cities || []).map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">PG<select name="pg" defaultValue={pgFilter} className="input"><option value="">All PGs</option>{(pgs || []).map((pg) => <option key={pg.id} value={pg.id}>{pg.name}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">Owner<select name="owner" defaultValue={ownerFilter} className="input"><option value="">All owners</option>{(owners || []).map((owner) => <option key={owner.id} value={owner.id}>{owner.full_name || owner.id.slice(0, 8)}</option>)}</select></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">From<input type="date" name="from" defaultValue={fromDate} className="input" /></label>
      <label className="grid gap-1 text-xs font-semibold text-muted-foreground">To<input type="date" name="to" defaultValue={toDate} className="input" /></label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-6"><button className="btn btn-primary">Apply filters</button><Link href="/admin/inquiries" className="btn btn-outline">Clear</Link></div>
    </form>
    <section className="space-y-3">{(inquiries || []).map((inquiry: any) => <article key={inquiry.id} className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-bold">{inquiry.name} <span className="text-sm font-medium text-muted-foreground">→ {inquiry.pgs?.name}</span></h2><p className="mt-1 text-sm text-muted-foreground">{inquiry.owner?.full_name || "Owner"} · {inquiry.phone || "No phone on profile"} · {new Date(inquiry.created_at).toLocaleString("en-IN")}</p>{inquiry.pgs?.cities?.name && <p className="text-sm text-muted-foreground">{inquiry.pgs.cities.name}</p>}</div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{inquiry.status}</span></div>
      {inquiry.message && <p className="mt-4 rounded-xl bg-muted/50 p-3 text-sm leading-relaxed">{inquiry.message}</p>}
      <div className="mt-4 flex flex-wrap gap-2">{STATUSES.filter((status) => status !== inquiry.status).map((status) => <form key={status} action={async () => { "use server"; await adminUpdateInquiryStatus(inquiry.id, status); }}><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Mark {status.toLowerCase()}</button></form>)}</div>
    </article>)}{!inquiries?.length && <p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">No inquiries match these filters.</p>}</section>
    {(inquiries?.length || 0) >= 500 && <p className="text-sm text-muted-foreground">Showing the 500 newest matching inquiries. Use date filters to narrow the list.</p>}
  </div>;
}
