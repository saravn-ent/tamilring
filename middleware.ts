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
  const requestHeaders = new Headers(request.headers)

  // 1. Language Detection (Region-based without GPS)
  const acceptLang = request.headers.get('accept-language') || '';
  const geoCountry = request.headers.get('x-vercel-ip-country') || ''; // Vercel support

  const geoRegion = request.headers.get('x-vercel-ip-country-region') || '';

  let detectedLang = 'en';
  const lowerAccept = acceptLang.toLowerCase();

  // 1. Check User Preference (Browser Settings)
  if (lowerAccept.includes('ta')) detectedLang = 'ta';
  else if (lowerAccept.includes('te')) detectedLang = 'te';
  else if (lowerAccept.includes('kn')) detectedLang = 'kn';
  else if (lowerAccept.includes('ml')) detectedLang = 'ml';
  else if (lowerAccept.includes('hi')) detectedLang = 'hi';

  // 2. Fallback to Geographic Region (if in India and no specific lang pref found yet)
  else if (geoCountry === 'IN') {
    switch (geoRegion) {
      case 'TN': // Tamil Nadu
        detectedLang = 'ta';
        break;
      case 'KL': // Kerala
        detectedLang = 'ml';
        break;
      case 'KA': // Karnataka
        detectedLang = 'kn';
        break;
      case 'AP': // Andhra Pradesh
      case 'TG': // Telangana
        detectedLang = 'te';
        break;
      // Default North/Central India to Hindi? Or keep English?
      // Let's bias towards Hindi for other major Hindi states, else English
      case 'DL': case 'MH': case 'UP': case 'MP': case 'GJ': case 'RJ':
        detectedLang = 'hi';
        break;
      default:
        // Default India fallback. 
        // Previously was 'ta', but 'en' might be safer if we want to be neutral, 
        // OR 'ta' if this is primarily a Tamil site (TamilRing).
        // Maintaining 'ta' as default fallback for legacy 'TamilRing' identity unless specified.
        detectedLang = 'ta';
    }
  }

  const userLangCookie = request.cookies.get('user-language')?.value || detectedLang;
  requestHeaders.set('x-user-language', userLangCookie);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Set cookie if not present
  if (!request.cookies.has('user-language')) {
    response.cookies.set('user-language', userLangCookie, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }


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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Rate Limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api') && ratelimit) {
    const ip = (request as unknown as { ip?: string }).ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
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
    const { data: { user } } = await supabase.auth.getUser();

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
