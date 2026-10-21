import { Star } from "lucide-react";
import { format } from "date-fns";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export function ReviewSection({ rating, reviews }: { rating: number; reviews: Review[] }) {
  return (
    <section className="space-y-8" aria-labelledby="guest-reviews-heading">
      <div className="flex flex-wrap items-center gap-5 pb-6 border-b border-border">
        {reviews.length > 0 && (
          <div className="flex flex-col items-center justify-center bg-primary/10 rounded-2xl w-24 h-24">
            <span className="text-4xl font-heading font-black text-primary">{rating.toFixed(1)}</span>
            <div className="flex text-warning mt-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} aria-hidden="true" className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "fill-warning" : "text-muted-foreground"}`} />
              ))}
            </div>
          </div>
        )}
        <div>
          <h3 id="guest-reviews-heading" className="text-xl font-heading font-bold mb-1 text-foreground">Guest Reviews</h3>
          <p className="text-muted-foreground font-medium">
            {reviews.length ? `Based on ${reviews.length} guest ${reviews.length === 1 ? "review" : "reviews"}` : "No reviews yet"}
          </p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => {
            const name = review.profiles?.full_name?.trim() || "PGBook user";
            return (
              <article key={review.id} className="pb-6 border-b border-border/50 last:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground">{name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                        <Star aria-hidden="true" className="w-4 h-4 fill-warning text-warning" /> {review.rating}
                      </span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={review.created_at}>{format(new Date(review.created_at), "MMM d, yyyy")}</time>
                    </div>
                  </div>
                </div>
                {review.title && <h5 className="font-semibold mb-1 text-foreground">{review.title}</h5>}
                {review.content && <p className="text-foreground leading-relaxed">{review.content}</p>}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">Guests can leave a review after a genuine stay.</p>
      )}
    </section>
  );
}
