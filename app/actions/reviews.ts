"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  pgId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  content: z.string().trim().min(30, "Write at least 30 characters about your experience.").max(2000, "Review must be 2,000 characters or fewer."),
});

export type PublicReview = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  display_name: string | null;
  created_at: string;
};

export async function submitReview(input: { pgId: string; rating: number; title: string; content: string }) {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Check your review." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in to write a review.", loginRequired: true };

  const { data: existing } = await supabase.from("reviews").select("id").eq("pg_id", parsed.data.pgId).eq("user_id", user.id).maybeSingle();
  const payload = { rating: parsed.data.rating, title: parsed.data.title || null, content: parsed.data.content };
  const { error } = existing
    ? await supabase.from("reviews").update(payload).eq("id", existing.id).eq("user_id", user.id)
    : await supabase.from("reviews").insert({ ...payload, pg_id: parsed.data.pgId, user_id: user.id });

  if (error?.code === "23505") return { success: false as const, error: "You have already reviewed this PG. Edit your existing review instead." };
  if (error) {
    console.error("Review submission failed:", error.code);
    return { success: false as const, error: "We couldn't save your review. Please try again." };
  }

  revalidatePath("/explore");
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function deleteReview(reviewId: string, pgId: string) {
  const parsed = z.object({ reviewId: z.string().uuid(), pgId: z.string().uuid() }).safeParse({ reviewId, pgId });
  if (!parsed.success) return { success: false as const, error: "Invalid review." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in to manage your review." };
  const { error, count } = await supabase.from("reviews").delete({ count: "exact" }).eq("id", reviewId).eq("user_id", user.id);
  if (error || !count) return { success: false as const, error: "This review could not be deleted." };
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function reportReview(reviewId: string, reason: string, details: string) {
  const parsed = z.object({
    reviewId: z.string().uuid(),
    reason: z.enum(["SPAM", "ABUSE", "NOT_RELEVANT", "OTHER"]),
    details: z.string().trim().max(1000),
  }).safeParse({ reviewId, reason, details });
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message || "Check the report." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Sign in to report a review.", loginRequired: true };
  const { data: review } = await supabase.from("reviews").select("user_id").eq("id", parsed.data.reviewId).maybeSingle();
  if (!review || review.user_id === user.id) return { success: false as const, error: "You can't report your own review." };

  const { error } = await supabase.from("review_reports").insert({
    review_id: parsed.data.reviewId,
    reporter_id: user.id,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });
  if (error?.code === "23505") return { success: false as const, error: "You have already reported this review." };
  if (error) {
    console.error("Review report failed:", error.code);
    return { success: false as const, error: "We couldn't send this report. Please try again." };
  }
  revalidatePath("/admin/reviews");
  return { success: true as const };
}

export async function loadMoreReviews(pgId: string, offset: number) {
  const parsed = z.object({ pgId: z.string().uuid(), offset: z.number().int().min(0).max(10000) }).safeParse({ pgId, offset });
  if (!parsed.success) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("reviews")
    .select("id, user_id, rating, title, content, display_name, created_at")
    .eq("pg_id", parsed.data.pgId)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(parsed.data.offset, parsed.data.offset + 9);
  return (data || []) as PublicReview[];
}
