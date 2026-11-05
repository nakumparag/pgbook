import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect')
  const oauthError = requestUrl.searchParams.get('error')
  
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = (forwardedHost && !isLocalEnv)
    ? `https://${forwardedHost}`
    : requestUrl.origin

  // Ensure we only redirect to a relative URL to prevent Open Redirect vulnerabilities
  const isRecoveryFlow = type === 'recovery' || next?.includes('reset-password')
  const isManagerFlow = next?.includes('owner') || next?.includes('manager')
  
  const recoveryDestination = isManagerFlow ? '/manager/reset-password' : '/reset-password'
  const recoveryFallback = isManagerFlow ? '/manager/forgot-password?error=recovery_failed' : '/forgot-password?error=recovery_failed'

  const defaultNext = isRecoveryFlow ? recoveryDestination : (isManagerFlow ? '/owner/dashboard' : '/dashboard')
  const safeNext = (next && next.startsWith('/') && !next.startsWith('//')) ? next : defaultNext
  const fallbackLogin = isManagerFlow ? '/manager/login' : '/login'

  // If user cancelled OAuth or provider returned an error
  if (oauthError) {
    console.error("Auth callback OAuth error received:", oauthError)
    const errCode = oauthError === 'access_denied' ? 'access_denied' : 'auth_callback_failed'
    const errorRedirect = isRecoveryFlow ? recoveryFallback : `${fallbackLogin}?error=${errCode}`
    return NextResponse.redirect(new URL(errorRedirect, redirectBase))
  }

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Auth callback code exchange error:", error.message)
      const errorRedirect = isRecoveryFlow ? recoveryFallback : `${fallbackLogin}?error=auth_callback_failed`
      return NextResponse.redirect(new URL(errorRedirect, redirectBase))
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      console.error("Auth callback verifyOtp error:", error.message)
      const errorRedirect = isRecoveryFlow ? recoveryFallback : `${fallbackLogin}?error=verification_failed`
      return NextResponse.redirect(new URL(errorRedirect, redirectBase))
    }
  }

  // Password recovery flow: immediately redirect to designated reset password page
  if (isRecoveryFlow) {
    return NextResponse.redirect(new URL(recoveryDestination, redirectBase))
  }

  // Check authenticated user to resolve role-based destination
  const { data: { user } } = await supabase.auth.getUser()
  if (user && isManagerFlow) {
    // 1. Check profile role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    // 2. Check approved owner profile
    const { data: ownerProfile } = await supabase
      .from('owner_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    // 3. Check property ownership
    const { count: pgCount } = await supabase
      .from('pgs')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)

    const isOwner =
      profile?.role === 'OWNER' ||
      profile?.role === 'ADMIN' ||
      ownerProfile?.status === 'APPROVED' ||
      (pgCount !== null && pgCount > 0)

    if (isOwner) {
      return NextResponse.redirect(new URL(safeNext, redirectBase))
    }

    // 4. Check staff or manager memberships
    const { data: member } = await supabase
      .from('property_members')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (member?.role === 'PROPERTY_MANAGER') {
      return NextResponse.redirect(new URL('/manager/manager-portal', redirectBase))
    }
    if (member?.role === 'STAFF') {
      return NextResponse.redirect(new URL('/manager/staff-portal', redirectBase))
    }

    // 5. Check resident tenant status
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (tenant) {
      return NextResponse.redirect(new URL('/manager/tenant-portal', redirectBase))
    }

    // New Google sign-in/sign-up through PG Manager:
    // User remains standard USER until completing secure server-side owner onboarding
    return NextResponse.redirect(new URL('/become-owner', redirectBase))
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(safeNext, redirectBase))
}
