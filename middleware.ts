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
  // 0. Bot & Music Label Scanner Protection
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // Whitelist Beneficial Bots (SEO & Performance)
  // We must allow Lighthouse and Googlebot to avoid 403s on PageSpeed Insights
  const beneficialBots = [
    'lighthouse', 'pagespeed', 'googlebot', 'bingbot', 'yandexbot', 
    'duckduckbot', 'baiduspider', 'ia_archiver', 'facebot', 'facebookexternalhit',
    'twitterbot', 'linkedinbot', 'slackbot', 'telegrambot', 'whatsapp'
  ];
  const isBeneficial = beneficialBots.some(bot => userAgent.includes(bot));

  if (isBeneficial) {
    return NextResponse.next();
  }

  const blockList = [
    'markmonitor', 'opsec', 'corsearch', 'digimarc', 'audiolock', 'red points', 
    'link-busters', 'muso', 'aiplex', 'websiren', 'copytrack', 'picrights', 
    'leakid', 'entura', 'marketly', 'grayzone', 'rivendell', 'ifpi', 'riaa',
    'copyright', 'piracy', 'dmca', 'legal', 'enforcement',
    'python-requests', 'node-fetch', 'axios', 'curl', 'wget', 
    'selenium', 'puppeteer', 'playwright', 'headless', 'scanner'
  ];

  const isMaliciousBot = blockList.some(keyword => userAgent.includes(keyword));
  
  // Also block empty User Agents or very short ones (less than 10 chars)
  // EXCEPT for known short UAs if any emerge (none for major bots)
  if (isMaliciousBot || (userAgent.length < 10 && userAgent.length > 0)) {
    console.log(`[Blocked Malicious Bot] UA: ${userAgent} | IP: ${request.headers.get('x-forwarded-for')}`);
    return new NextResponse('Access Denied', { status: 403 });
  }

  const requestHeaders = new Headers(request.headers)

  // 1. Language Detection (Region-based without GPS)
  // const acceptLang = request.headers.get('accept-language') || '';
  // const geoCountry = request.headers.get('x-vercel-ip-country') || ''; // Vercel support
  // const geoRegion = request.headers.get('x-vercel-ip-country-region') || '';

  const detectedLang = 'ta';

  const userLangCookie = detectedLang; 
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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
