import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

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
