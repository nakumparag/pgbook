import Link from "next/link";
import { moderateReview, resolveReviewReport } from "@/app/actions/admin_reviews";
import { createClient } from "@/lib/supabase/server";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const [{ data: reports }, { data: reviews }] = await Promise.all([
    supabase.from("review_reports").select(`
      id, reason, details, status, created_at,
      review:reviews!review_reports_review_id_fkey ( id, title, content, rating, status, display_name, pgs(name, slug) ),
      reporter:profiles!review_reports_reporter_id_fkey ( full_name )
    `).eq("status", "OPEN").order("created_at", { ascending: false }).limit(200),
    supabase.from("reviews").select("id, pg_id, rating, title, content, status, display_name, created_at, pgs(name, slug)").order("created_at", { ascending: false }).limit(500),
  ]);

  return <div className="container-custom space-y-10 py-10">
    <header><Link href="/admin/dashboard" className="text-sm font-semibold text-primary hover:underline">← Admin dashboard</Link><h1 className="mt-3 text-3xl font-heading font-black">Review moderation</h1><p className="mt-1 text-muted-foreground">Reported reviews and current published or hidden reviews.</p></header>
    <section className="space-y-4"><div><h2 className="text-2xl font-bold">Open reports <span className="text-muted-foreground">({reports?.length || 0})</span></h2></div>
      {(reports || []).map((report: any) => <article key={report.id} className="rounded-2xl border border-amber-500/30 bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{report.review?.pgs?.name || "PG review"} · {report.review?.display_name || "PGBook user"}</p><p className="mt-1 text-sm text-muted-foreground">Reason: {report.reason.toLowerCase().replaceAll("_", " ")} · Reported by {report.reporter?.full_name || "user"} · {new Date(report.created_at).toLocaleString("en-IN")}</p></div><span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">OPEN</span></div>
        {report.details && <p className="mt-3 text-sm">Report details: {report.details}</p>}
        {report.review && <blockquote className="mt-4 rounded-xl bg-muted/50 p-4"><p className="font-semibold">{report.review.title || `${report.review.rating}/5`}</p><p className="mt-1 text-sm leading-relaxed">{report.review.content}</p></blockquote>}
        <div className="mt-4 flex flex-wrap gap-2">{report.review && <form action={async () => { "use server"; await moderateReview(report.review.id, "HIDDEN", `Hidden after report ${report.id}`); }}><button className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">Hide review</button></form>}<form action={async () => { "use server"; await resolveReviewReport(report.id, "REVIEWED"); }}><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Mark reviewed</button></form><form action={async () => { "use server"; await resolveReviewReport(report.id, "DISMISSED"); }}><button className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Dismiss report</button></form></div>
      </article>)}
      {!reports?.length && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No open reports.</p>}
    </section>

    <section className="space-y-4"><div><h2 className="text-2xl font-bold">All reviews <span className="text-muted-foreground">({reviews?.length || 0} shown)</span></h2></div>
      {(reviews || []).map((review: any) => <article key={review.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{review.pgs?.name || "PG"} · {review.display_name || "PGBook user"} · {review.rating}/5</p><p className="mt-1 text-sm text-muted-foreground">{review.status} · {new Date(review.created_at).toLocaleDateString("en-IN")}</p></div>{review.pgs?.slug && <Link href={`/pg/${review.pgs.slug}`} className="text-sm font-semibold text-primary hover:underline">View PG</Link>}</div>{review.title && <h3 className="mt-3 font-semibold">{review.title}</h3>}<p className="mt-1 text-sm leading-relaxed">{review.content}</p><div className="mt-4 flex gap-2">{review.status === "PUBLISHED" ? <form action={async () => { "use server"; await moderateReview(review.id, "HIDDEN", "Hidden by administrator"); }}><button className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-semibold text-destructive">Hide review</button></form> : <form action={async () => { "use server"; await moderateReview(review.id, "PUBLISHED", ""); }}><button className="rounded-lg border border-success/40 px-3 py-2 text-xs font-semibold text-success">Publish review</button></form>}</div></article>)}
      {(!reviews || reviews.length === 0) && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No reviews have been submitted.</p>}
      {(reviews?.length || 0) >= 500 && <p className="text-sm text-muted-foreground">Showing the 500 newest reviews.</p>}
    </section>
  </div>;
}
