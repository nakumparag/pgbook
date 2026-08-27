"use server";

import { createClient } from "@/lib/supabase/server";

export async function logPgVisit(pgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // We intentionally ignore errors here so it doesn't fail the page load
  await supabase.from("pg_visits").insert({
    pg_id: pgId,
    user_id: user?.id || null,
  });
}
