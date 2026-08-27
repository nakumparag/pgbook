"use client";

import { Star, ThumbsUp } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

// Mock reviews
const mockReviews = [
  {
    id: "1",
    rating: 5,
    body: "Excellent PG! The food is great and the rooms are cleaned daily. WiFi speed is decent too.",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    user: { name: "Aditi S.", avatar: "A" }
  },
  {
    id: "2",
    rating: 4,
    body: "Good location, near the metro. The only issue is sometimes the washing machine is occupied.",
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    user: { name: "Rohan M.", avatar: "R" }
  },
  {
    id: "3",
    rating: 5,
    body: "Owner is very friendly and cooperative. Really feels like home. Highly recommended.",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    user: { name: "Neha K.", avatar: "N" }
  }
];

export function ReviewSection({ pgId, rating, count }: { pgId?: string, rating: number, count: number }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 pb-6 border-b border-border">
        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-2xl w-24 h-24">
          <span className="text-4xl font-heading font-black text-primary">{rating}</span>
          <div className="flex text-warning mt-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "fill-warning" : "text-muted-foreground"}`} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xl font-heading font-bold mb-1 text-foreground">Guest Reviews</h3>
          <p className="text-muted-foreground font-medium">Based on {count} verified ratings</p>
        </div>
      </div>

      <div className="space-y-8">
        {mockReviews.map((review) => (
          <div key={review.id} className="pb-8 border-b border-border/50 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-accent text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {review.user.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{review.user.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <div className="flex text-warning">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-warning" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-foreground leading-relaxed">
              {review.body}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-1 px-3 -ml-3 rounded-lg hover:bg-muted">
                <ThumbsUp className="w-4 h-4" /> Helpful
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-4 h-12 rounded-xl text-foreground font-semibold">
        Show All {count} Reviews
      </Button>
    </div>
  );
}
