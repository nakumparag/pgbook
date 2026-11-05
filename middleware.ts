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

  const hostname = request.headers.get('host') || ''
  const isManagerSubdomain = hostname.startsWith('manager.')
  const pathname = request.nextUrl.pathname

  const managerPathMap: Record<string, string> = {
    '/': '/manager',
    '/features': '/manager/features',
    '/pricing': '/manager/pricing',
    '/login': '/manager/login',
    '/signup': '/manager/signup',
    '/forgot-password': '/manager/forgot-password',
    '/reset-password': '/manager/reset-password',
    '/dashboard': '/owner/dashboard',
    '/properties': '/owner/properties',
    '/rooms': '/owner/rooms',
    '/tenants': '/owner/tenants',
    '/finance': '/owner/finance',
    '/operations': '/owner/operations',
    '/staff': '/owner/staff',
    '/reports': '/owner/reports',
    '/manager-portal': '/manager/manager-portal',
    '/staff-portal': '/manager/staff-portal',
    '/tenant-portal': '/manager/tenant-portal',
  }
  const internalManagerPath = isManagerSubdomain ? managerPathMap[pathname] : undefined
  const routePath = internalManagerPath || pathname

  // Refresh session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes check (Notice: /manager, /manager/features, /manager/pricing, /manager/login, /manager/signup are public!)
  const isProtectedOwnerRoute = routePath.startsWith('/owner') || routePath.startsWith('/manager/owner')
  const isProtectedManagerRoute = routePath.startsWith('/manager/manager-portal')
  const isProtectedStaffRoute = routePath.startsWith('/staff') || routePath.startsWith('/manager/staff-portal')
  const isProtectedTenantRoute = routePath.startsWith('/tenant') || routePath.startsWith('/manager/tenant-portal')
  const isProtectedUserRoute =
    routePath === '/profile' || routePath.startsWith('/profile/') ||
    routePath === '/dashboard' || routePath.startsWith('/dashboard/') ||
    routePath === '/bookings' || routePath.startsWith('/bookings/') ||
    routePath === '/favorites' || routePath.startsWith('/favorites/')

  const isAdminRoute = routePath === '/admin' || routePath.startsWith('/admin/')

  const isProtectedRoute =
    isProtectedOwnerRoute ||
    isProtectedManagerRoute ||
    isProtectedStaffRoute ||
    isProtectedTenantRoute ||
    isProtectedUserRoute ||
    isAdminRoute

  // Check for local development admin session bypass
  const isDevAdmin =
    process.env.NODE_ENV !== "production" &&
    request.cookies.get("pgbook_dev_admin_session")?.value === "true"

  if (!user) {
    if (isDevAdmin && isAdminRoute) {
      return supabaseResponse
    }

    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      // If attempting to access manager/owner routes, redirect to PG Manager login
      if (isProtectedOwnerRoute || isProtectedManagerRoute || isProtectedStaffRoute) {
        url.pathname = isManagerSubdomain ? '/login' : '/manager/login'
      } else {
        url.pathname = '/login'
      }
      url.searchParams.set('next', pathname)
      return createRedirectResponse(url)
    }
  }

  // Auth pages redirect for already logged-in users
  const isMainAuthRoute = ['/login', '/signup', '/forgot-password'].includes(routePath)
  const isManagerAuthRoute = ['/manager/login', '/manager/signup', '/manager/forgot-password'].includes(routePath)

  if (user && (isMainAuthRoute || isManagerAuthRoute)) {
    const nextParam = request.nextUrl.searchParams.get('next') || request.nextUrl.searchParams.get('redirect')
    
    // Fetch profile to do smart role-based redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    let destination = '/dashboard'
    if (profile?.role === 'ADMIN') {
      destination = '/admin/dashboard'
    } else if (profile?.role === 'OWNER' || isManagerAuthRoute) {
      destination = '/owner/dashboard'
    }

    const safeNext = (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//'))
      ? nextParam
      : (isManagerSubdomain && destination.startsWith('/owner/') ? destination.slice('/owner'.length) : destination)
    const url = request.nextUrl.clone()
    url.pathname = safeNext
    url.search = ''
    return createRedirectResponse(url)
  }

  // Admin route protection for logged in users
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

  if (internalManagerPath) {
    const url = request.nextUrl.clone()
    url.pathname = internalManagerPath
    const rewriteResponse = NextResponse.rewrite(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return rewriteResponse
  }

  return supabaseResponse
}

export const proxy = middleware

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

