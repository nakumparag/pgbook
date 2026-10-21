import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // Check for local development admin session bypass
  if (process.env.NODE_ENV !== "production") {
    const devAdminSession = cookieStore.get("pgbook_dev_admin_session")?.value;
    if (devAdminSession === "true") {
      return <>{children}</>;
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin/dashboard')
  }

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Allow only ADMIN to access admin routes
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/dashboard?error=access_denied')
  }

  return <>{children}</>
}
