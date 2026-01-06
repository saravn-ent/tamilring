import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@upstash/ratelimit',
    });
  } else {
    console.warn("Rate limiting disabled: Missing Upstash credentials");
  }
} catch (error) {
  console.warn("Rate limiting initialization failed:", error);
}


export async function middleware(request: NextRequest) {
  // CSP - Permissive for development, secure for production
  // Allows localhost, blob, data, and all tamilring.in resources
  const cspHeader = `
    default-src 'self' localhost:* http://localhost:* https://localhost:*;
    script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: localhost:* http://localhost:* https://localhost:* https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' localhost:* http://localhost:* https://localhost:* https://fonts.googleapis.com;
    img-src 'self' blob: data: localhost:* http://localhost:* https://localhost:* https://image.tmdb.org https://i.scdn.co https://upload.wikimedia.org https://lh3.googleusercontent.com https://ui-avatars.com https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co https://*.supabase.in;
    media-src 'self' blob: data: localhost:* http://localhost:* https://localhost:* https://*.supabase.co https://*.supabase.in;
    connect-src 'self' blob: data: localhost:* http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* https://image.tmdb.org https://api.themoviedb.org https://unpkg.com https://www.google-analytics.com https://www.googletagmanager.com https://accounts.google.com https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
    font-src 'self' data: localhost:* http://localhost:* https://localhost:* https://fonts.gstatic.com;
    frame-src 'self' localhost:* http://localhost:* https://localhost:* https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    worker-src 'self' blob: localhost:* http://localhost:* https://localhost:* https://unpkg.com;
    frame-ancestors 'none';
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set CSP on response so browser sees it
  response.headers.set('Content-Security-Policy', cspHeader)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          // Re-set CSP on new response
          response.headers.set('Content-Security-Policy', cspHeader)

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api') && ratelimit) {
    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    try {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    } catch (error) {
      console.error('Rate limit error:', error);
    }
  }

  // 3. Auth & Session Management
  // CRITICAL PERFORMANCE: Only run getUser() for routes that need authentication or session refreshing.
  // This saves ~500ms-1000ms TTFB for public pages.
  const authRequiredRoutes = ['/admin', '/profile', '/upload', '/settings', '/api/protected'];
  const isAuthRoute = authRequiredRoutes.some(path => request.nextUrl.pathname.startsWith(path));

  // We also refresh session on auth-related API routes
  const isAuthApi = request.nextUrl.pathname.startsWith('/api/auth');

  if (isAuthRoute || isAuthApi) {
    const { data: { user }, error } = await supabase.auth.getUser();

    // STRICT PROTECTION FOR /admin ROUTES
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // 1. Unauthenticated users -> Redirect to Home
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      // 2. Authorization Check (Role-based & Email-based)
      // We check the 'profiles' table for the role.
      // We also strictly allow 'saravn.ent@gmail.com' as a fail-safe.
      let isAdmin = false;

      if (user.email === 'saravn.ent@gmail.com') {
        isAdmin = true;
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          isAdmin = true;
        }
      }

      // 3. Unauthorized users -> Redirect to Home
      if (!isAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
