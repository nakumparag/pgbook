import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }
  if (!client) {
    client = createBrowserClient<Database>(supabaseUrl, supabaseKey)
  }
  return client
}
