"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Flag, Star, Trash2 } from "lucide-react";
import { deleteReview, loadMoreReviews, reportReview, submitReview, type PublicReview } from "@/app/actions/reviews";

type OwnReview = { id: string; rating: number; title: string | null; content: string | null; status: string } | null;

function ReviewForm({ pgId, ownReview, onSaved }: { pgId: string; ownReview: OwnReview; onSaved: () => void }) {
  const [rating, setRating] = useState(ownReview?.rating || 5);
  const [title, setTitle] = useState(ownReview?.title || "");
  const [content, setContent] = useState(ownReview?.content || "");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    startTransition(async () => {
      const result = await submitReview({ pgId, rating, title, content });
      if (!result.success) {
        setMessage(result.loginRequired ? "Sign in to add a review." : result.error || "Couldn't save your review.");
        return;
      }
      setMessage("Your review has been saved.");
      onSaved();
    });
  };

  const remove = () => {
    if (!ownReview) return;
    setMessage("");
    startTransition(async () => {
      const result = await deleteReview(ownReview.id, pgId);
      if (!result.success) setMessage(result.error || "Couldn't delete your review.");
      else {
        setMessage("Your review has been deleted.");
        setRating(5);
        setTitle("");
        setContent("");
        onSaved();
      }
    });
  };

  return (
    <form onSubmit={save} className="mb-8 rounded-2xl border border-border bg-card p-5 md:p-6">
      <h4 className="mb-1 text-lg font-bold">{ownReview ? "Edit your review" : "Share your experience"}</h4>
      <p className="mb-4 text-sm text-muted-foreground">PGBook does not verify stays. Review only places you have personally experienced.</p>
      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating from 1 to 5 stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onClick={() => setRating(value)} className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
              <Star className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="review-title" className="mb-1 block text-sm font-semibold">Short title (optional)</label>
      <input id="review-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className="input mb-4 w-full" placeholder="What stood out?" />
      <label htmlFor="review-content" className="mb-1 block text-sm font-semibold">Your review</label>
      <textarea id="review-content" value={content} onChange={(event) => setContent(event.target.value)} required minLength={30} maxLength={2000} rows={5} className="input w-full resize-y p-3" placeholder="Describe your experience with the rooms, location, or amenities…" />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{content.trim().length}/2,000 characters (minimum 30)</p>
        <div className="flex gap-2">
          {ownReview && <button type="button" onClick={remove} disabled={pending} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete</button>}
          <button type="submit" disabled={pending || content.trim().length < 30} className="btn btn-primary min-h-10 disabled:opacity-50">{pending ? "Saving…" : ownReview ? "Save changes" : "Post review"}</button>
        </div>
      </div>
      {message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}
    </form>
  );
}

function ReportControl({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="mt-3">
      {!open ? <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Flag className="h-3 w-3" /> Report</button> : (
        <form onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            const result = await reportReview(reviewId, String(form.get("reason")), String(form.get("details") || ""));
            setMessage(result.success ? "Report sent to the moderation team." : result.error || "Couldn't submit the report.");
            if (result.success) setOpen(false);
          });
        }} className="grid gap-2 rounded-xl bg-muted/40 p-3 sm:grid-cols-[160px_1fr_auto]">
          <label className="sr-only" htmlFor={`report-reason-${reviewId}`}>Report reason</label>
          <select id={`report-reason-${reviewId}`} name="reason" className="input" defaultValue="NOT_RELEVANT"><option value="SPAM">Spam</option><option value="ABUSE">Abusive content</option><option value="NOT_RELEVANT">Not relevant</option><option value="OTHER">Other</option></select>
          <label className="sr-only" htmlFor={`report-details-${reviewId}`}>Optional report details</label>
          <input id={`report-details-${reviewId}`} name="details" maxLength={1000} className="input" placeholder="Optional details" />
          <button className="btn btn-outline" disabled={pending}>{pending ? "Sending…" : "Send report"}</button>
          {message && <p role="status" className="text-xs text-muted-foreground sm:col-span-3">{message}</p>}
          {message.includes("Sign in") && <Link href="/login" className="text-sm font-semibold text-primary underline">Log in</Link>}
        </form>
      )}
    </div>
  );
}

export function ReviewSection({
  pgId, pgSlug, rating, reviewCount, reviews: initialReviews, userId, ownReview, hasMore: initialHasMore,
}: {
  pgId: string;
  pgSlug: string;
  rating: number;
  reviewCount: number;
  reviews: PublicReview[];
  userId: string | null;
  ownReview: OwnReview;
  hasMore: boolean;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();

  const showMore = async () => {
    setLoadingMore(true);
    const next = await loadMoreReviews(pgId, reviews.length);
    setReviews((current) => [...current, ...next]);
    setHasMore(next.length === 10);
    setLoadingMore(false);
  };

  return (
    <section className="space-y-6" aria-labelledby="guest-reviews-heading">
      <div className="flex flex-wrap items-center gap-5 border-b border-border pb-6">
        {reviewCount > 0 && <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-primary/10"><span className="font-heading text-4xl font-black text-primary">{rating.toFixed(1)}</span><div className="mt-1 flex" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}</div></div>}
        <div><h3 id="guest-reviews-heading" className="mb-1 text-xl font-heading font-bold text-foreground">Community reviews</h3><p className="font-medium text-muted-foreground">{reviewCount ? `Based on ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}` : "No reviews yet"}</p></div>
      </div>

      {userId ? <ReviewForm key={ownReview?.id || "new-review"} pgId={pgId} ownReview={ownReview} onSaved={() => router.refresh()} /> : <p className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground"><Link href={`/login?next=${encodeURIComponent(`/pg/${pgSlug}`)}`} className="font-semibold text-primary underline">Log in</Link> to write a review.</p>}

      {reviews.length ? <div className="space-y-6">{reviews.map((review) => <article key={review.id} className="border-b border-border/50 pb-6 last:border-0"><div className="mb-2 flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-semibold text-foreground">{review.display_name || "PGBook user"}</h4><div className="flex items-center gap-2 text-sm text-muted-foreground"><span aria-label={`${review.rating} out of 5 stars`} className="inline-flex items-center gap-1"><Star aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-400" /> {review.rating}</span><span aria-hidden="true">·</span><time dateTime={review.created_at}>{format(new Date(review.created_at), "MMM d, yyyy")}</time></div></div></div>{review.title && <h5 className="mb-1 font-semibold text-foreground">{review.title}</h5>}<p className="leading-relaxed text-foreground">{review.content}</p>{userId && userId !== review.user_id && <ReportControl reviewId={review.id} />}</article>)}</div> : <p className="text-sm text-muted-foreground">Be the first to share a review of this PG. Reviews are not verified-stay records.</p>}
      {hasMore && <button type="button" onClick={showMore} disabled={loadingMore} className="btn btn-outline" aria-live="polite">{loadingMore ? "Loading reviews…" : "Load more reviews"}</button>}
    </section>
  );
}
