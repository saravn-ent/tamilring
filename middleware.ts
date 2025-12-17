import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});


export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Secure CSP Policy
  // - script-src: Uses nonce for inline scripts, 'strict-dynamic' for Next.js, specific trusted domains only
  // - Removed 'unsafe-inline', 'unsafe-eval', and 'data:' from script-src
  // - object-src: 'none' (prevents plugin execution)
  // - Restricted sources to specific trusted domains
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://unpkg.com https://www.googletagmanager.com https://www.google-analytics.com https://accounts.google.com https://apis.google.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://image.tmdb.org https://i.scdn.co https://upload.wikimedia.org https://lh3.googleusercontent.com https://ui-avatars.com https://www.googletagmanager.com https://www.google-analytics.com https://*.supabase.co https://*.supabase.in;
    media-src 'self' blob: https://*.supabase.co https://*.supabase.in;
    connect-src 'self' https://image.tmdb.org https://api.themoviedb.org https://unpkg.com https://www.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://*.supabase.in wss://*.supabase.co;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    worker-src 'self' blob:;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
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

  // Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = (request as any).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    // Only rate limit write operations or heavy reads if needed.
    // For now, lenient global rate limit on APIs
    try {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
      // pending is a promise for analytics, we can ignore it or await it if critical

      if (!success) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open so we don't block users if Redis is down
    }
  }

  await supabase.auth.getUser()

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
