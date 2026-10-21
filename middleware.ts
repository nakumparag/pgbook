import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Helper function to create redirects while preserving refreshed cookies
  function createRedirectResponse(url: URL) {
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected routes check
  const isProtectedRoute = 
    pathname === '/profile' || pathname.startsWith('/profile/') ||
    pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
    pathname === '/bookings' || pathname.startsWith('/bookings/') ||
    pathname === '/favorites' || pathname.startsWith('/favorites/') ||
    pathname === '/become-owner' || pathname.startsWith('/become-owner/') ||
    pathname === '/owner' || pathname.startsWith('/owner/') ||
    (pathname === '/admin' || pathname.startsWith('/admin/'))

  // Check for local development admin session bypass
  const isDevAdmin =
    process.env.NODE_ENV !== "production" &&
    request.cookies.get("pgbook_dev_admin_session")?.value === "true"

  if (!user) {
    // If dev admin is enabled and accessing admin route, allow through
    if (isDevAdmin && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
      return supabaseResponse
    }

    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return createRedirectResponse(url)
    }
  }

  // Redirect logged in users away from auth pages
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.includes(pathname)

  if (user && isAuthRoute) {
    const nextParam = request.nextUrl.searchParams.get('next') || request.nextUrl.searchParams.get('redirect')
    const safeNext = (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) ? nextParam : '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = safeNext
    url.search = '' // Strip any query parameters
    return createRedirectResponse(url)
  }

  // Admin route protection for logged in users
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      url.searchParams.set('error', 'access_denied')
      return createRedirectResponse(url)
    }
  }

  // Owner route protection for logged in users
  if (user && pathname.startsWith('/owner')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    const { data: ownerData } = await supabase
      .from('owner_profiles')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profile?.role !== 'ADMIN' && ownerData?.status !== 'APPROVED') {
      const url = request.nextUrl.clone()
      url.pathname = '/become-owner'
      url.search = ''
      return createRedirectResponse(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
