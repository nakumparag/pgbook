import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Component
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/owner/dashboard')
  }

  // Fetch user profile and owner_profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const { data: ownerProfile } = await supabase
    .from('owner_profiles')
    .select('status')
    .eq('user_id', user.id)
    .single()

  const isApprovedOwner = ownerProfile?.status === 'APPROVED'
  const isAdmin = profile?.role === 'ADMIN'

  // Allow APPROVED OWNER or ADMIN to access owner routes
  if (!isApprovedOwner && !isAdmin) {
    redirect('/dashboard?error=access_denied')
  }

  return <>{children}</>
}
