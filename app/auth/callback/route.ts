import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect')
  
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = (forwardedHost && !isLocalEnv)
    ? `https://${forwardedHost}`
    : requestUrl.origin

  // Ensure we only redirect to a relative URL to prevent Open Redirect vulnerabilities
  const defaultNext = type === 'recovery' ? '/reset-password' : '/dashboard'
  const safeNext = (next && next.startsWith('/') && !next.startsWith('//')) ? next : defaultNext

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error("Auth callback code exchange error:", error.message)
      return NextResponse.redirect(new URL('/login?error=auth_callback_failed', redirectBase))
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      console.error("Auth callback verifyOtp error:", error.message)
      return NextResponse.redirect(new URL('/login?error=verification_failed', redirectBase))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(safeNext, redirectBase))
}
